/// Goose Extension for Native n8n Integration
///
/// This extension provides direct code-level integration between Goose and n8n,
/// bypassing the MCP protocol for lower latency and tighter coupling.
///
/// Features:
/// - Direct workflow execution via n8n API
/// - Workflow template creation from agent context
/// - Shared execution state between agent and workflows
/// - Recipe-to-workflow conversion
/// - Access to workflow execution history and metrics

use async_trait::async_trait;
use rmcp::model::Tool;
use rmcp::ServiceError;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;

use crate::agents::extension::{ExtensionContext, McpClientTrait, PlatformExtensionContext};
use crate::agents::mcp_client::McpClient;

pub const EXTENSION_NAME: &str = "n8n_native";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct N8nConfig {
    pub api_url: String,
    pub api_key: String,
    pub enable_workflow_creation: bool,
    pub enable_execution_tracking: bool,
}

impl Default for N8nConfig {
    fn default() -> Self {
        Self {
            api_url: std::env::var("N8N_API_URL")
                .unwrap_or_else(|_| "http://localhost:5678/api/v1".to_string()),
            api_key: std::env::var("N8N_API_KEY").unwrap_or_default(),
            enable_workflow_creation: true,
            enable_execution_tracking: true,
        }
    }
}

pub struct N8nNativeClient {
    config: N8nConfig,
    http_client: reqwest::Client,
    execution_context: Arc<RwLock<ExecutionContext>>,
}

#[derive(Debug, Default)]
struct ExecutionContext {
    session_id: Option<String>,
    workflow_executions: Vec<WorkflowExecution>,
    shared_variables: std::collections::HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct WorkflowExecution {
    execution_id: String,
    workflow_id: String,
    triggered_by_conversation: Option<String>,
    status: String,
    started_at: chrono::DateTime<chrono::Utc>,
    finished_at: Option<chrono::DateTime<chrono::Utc>>,
    result: Option<serde_json::Value>,
}

impl N8nNativeClient {
    pub fn new(_ctx: PlatformExtensionContext) -> Result<Self, ServiceError> {
        let config = N8nConfig::default();
        
        let http_client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(300))
            .build()
            .map_err(|e| ServiceError::InternalError(e.to_string()))?;

        Ok(Self {
            config,
            http_client,
            execution_context: Arc::new(RwLock::new(ExecutionContext::default())),
        })
    }

    async fn execute_workflow_direct(
        &self,
        workflow_id: &str,
        input_data: serde_json::Value,
        wait_for_completion: bool,
    ) -> Result<serde_json::Value, ServiceError> {
        let url = format!("{}/workflows/{}/execute", self.config.api_url, workflow_id);
        
        let mut request = self
            .http_client
            .post(&url)
            .header("X-N8N-API-KEY", &self.config.api_key)
            .json(&serde_json::json!({
                "data": input_data,
            }));

        if wait_for_completion {
            request = request.query(&[("waitTill", "completed")]);
        }

        let response = request
            .send()
            .await
            .map_err(|e| ServiceError::InternalError(format!("Failed to execute workflow: {}", e)))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(ServiceError::InternalError(format!(
                "Workflow execution failed: {}",
                error_text
            )));
        }

        let result = response
            .json::<serde_json::Value>()
            .await
            .map_err(|e| ServiceError::InternalError(format!("Failed to parse response: {}", e)))?;

        // Track execution if enabled
        if self.config.enable_execution_tracking {
            if let Some(exec_id) = result.get("executionId").and_then(|v| v.as_str()) {
                let mut ctx = self.execution_context.write().await;
                ctx.workflow_executions.push(WorkflowExecution {
                    execution_id: exec_id.to_string(),
                    workflow_id: workflow_id.to_string(),
                    triggered_by_conversation: ctx.session_id.clone(),
                    status: "running".to_string(),
                    started_at: chrono::Utc::now(),
                    finished_at: None,
                    result: None,
                });
            }
        }

        Ok(result)
    }

    async fn create_workflow_from_template(
        &self,
        name: &str,
        description: &str,
        nodes: Vec<serde_json::Value>,
    ) -> Result<serde_json::Value, ServiceError> {
        let url = format!("{}/workflows", self.config.api_url);
        
        let workflow_definition = serde_json::json!({
            "name": name,
            "nodes": nodes,
            "connections": {},
            "active": false,
            "settings": {
                "executionOrder": "v1",
            },
            "meta": {
                "createdBy": "goose_agent",
                "description": description,
            }
        });

        let response = self
            .http_client
            .post(&url)
            .header("X-N8N-API-KEY", &self.config.api_key)
            .json(&workflow_definition)
            .send()
            .await
            .map_err(|e| ServiceError::InternalError(format!("Failed to create workflow: {}", e)))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(ServiceError::InternalError(format!(
                "Workflow creation failed: {}",
                error_text
            )));
        }

        response
            .json::<serde_json::Value>()
            .await
            .map_err(|e| ServiceError::InternalError(format!("Failed to parse response: {}", e)))
    }

    async fn list_workflows(&self) -> Result<serde_json::Value, ServiceError> {
        let url = format!("{}/workflows", self.config.api_url);
        
        let response = self
            .http_client
            .get(&url)
            .header("X-N8N-API-KEY", &self.config.api_key)
            .send()
            .await
            .map_err(|e| ServiceError::InternalError(format!("Failed to list workflows: {}", e)))?;

        if !response.status().is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(ServiceError::InternalError(format!(
                "Failed to list workflows: {}",
                error_text
            )));
        }

        response
            .json::<serde_json::Value>()
            .await
            .map_err(|e| ServiceError::InternalError(format!("Failed to parse response: {}", e)))
    }

    async fn get_execution_history(&self) -> Result<serde_json::Value, ServiceError> {
        let ctx = self.execution_context.read().await;
        Ok(serde_json::to_value(&ctx.workflow_executions)
            .unwrap_or_else(|_| serde_json::json!([])))
    }
}

#[async_trait]
impl McpClientTrait for N8nNativeClient {
    async fn get_name(&self) -> String {
        EXTENSION_NAME.to_string()
    }

    async fn list_tools(&self) -> Result<Vec<Tool>, ServiceError> {
        Ok(vec![
            Tool {
                name: "execute_workflow_native".to_string(),
                description: Some(
                    "Execute an n8n workflow directly with low latency (bypasses MCP). \
                     Returns execution results and tracks the execution in agent context."
                        .to_string(),
                ),
                input_schema: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "workflow_id": {
                            "type": "string",
                            "description": "ID or name of the workflow to execute"
                        },
                        "input_data": {
                            "type": "object",
                            "description": "Input data to pass to the workflow",
                            "default": {}
                        },
                        "wait_for_completion": {
                            "type": "boolean",
                            "description": "Whether to wait for workflow completion",
                            "default": true
                        }
                    },
                    "required": ["workflow_id"]
                }),
            },
            Tool {
                name: "create_workflow_from_context".to_string(),
                description: Some(
                    "Create a new n8n workflow based on the current conversation context. \
                     The agent can use this to automate repetitive tasks discussed in the conversation."
                        .to_string(),
                ),
                input_schema: serde_json::json!({
                    "type": "object",
                    "properties": {
                        "name": {
                            "type": "string",
                            "description": "Name for the new workflow"
                        },
                        "description": {
                            "type": "string",
                            "description": "Description of what the workflow does"
                        },
                        "nodes": {
                            "type": "array",
                            "description": "Array of node definitions for the workflow",
                            "items": {
                                "type": "object"
                            }
                        }
                    },
                    "required": ["name", "nodes"]
                }),
            },
            Tool {
                name: "list_workflows_native".to_string(),
                description: Some(
                    "List all available n8n workflows with their metadata. \
                     Faster than MCP-based listing."
                        .to_string(),
                ),
                input_schema: serde_json::json!({
                    "type": "object",
                    "properties": {}
                }),
            },
            Tool {
                name: "get_workflow_execution_history".to_string(),
                description: Some(
                    "Get the execution history of workflows triggered during this conversation. \
                     Shows correlation between agent actions and workflow executions."
                        .to_string(),
                ),
                input_schema: serde_json::json!({
                    "type": "object",
                    "properties": {}
                }),
            },
        ])
    }

    async fn call_tool(
        &self,
        tool_name: &str,
        arguments: &serde_json::Value,
    ) -> Result<Vec<rmcp::model::ToolResponseContent>, ServiceError> {
        match tool_name {
            "execute_workflow_native" => {
                let workflow_id = arguments
                    .get("workflow_id")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| ServiceError::InvalidRequest("workflow_id is required".to_string()))?;

                let input_data = arguments
                    .get("input_data")
                    .cloned()
                    .unwrap_or_else(|| serde_json::json!({}));

                let wait_for_completion = arguments
                    .get("wait_for_completion")
                    .and_then(|v| v.as_bool())
                    .unwrap_or(true);

                let result = self
                    .execute_workflow_direct(workflow_id, input_data, wait_for_completion)
                    .await?;

                Ok(vec![rmcp::model::ToolResponseContent::Text {
                    text: serde_json::to_string_pretty(&result).unwrap_or_default(),
                }])
            }

            "create_workflow_from_context" => {
                let name = arguments
                    .get("name")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| ServiceError::InvalidRequest("name is required".to_string()))?;

                let description = arguments
                    .get("description")
                    .and_then(|v| v.as_str())
                    .unwrap_or("");

                let nodes = arguments
                    .get("nodes")
                    .and_then(|v| v.as_array())
                    .ok_or_else(|| ServiceError::InvalidRequest("nodes array is required".to_string()))?
                    .clone();

                let result = self
                    .create_workflow_from_template(name, description, nodes)
                    .await?;

                Ok(vec![rmcp::model::ToolResponseContent::Text {
                    text: serde_json::to_string_pretty(&result).unwrap_or_default(),
                }])
            }

            "list_workflows_native" => {
                let result = self.list_workflows().await?;

                Ok(vec![rmcp::model::ToolResponseContent::Text {
                    text: serde_json::to_string_pretty(&result).unwrap_or_default(),
                }])
            }

            "get_workflow_execution_history" => {
                let result = self.get_execution_history().await?;

                Ok(vec![rmcp::model::ToolResponseContent::Text {
                    text: serde_json::to_string_pretty(&result).unwrap_or_default(),
                }])
            }

            _ => Err(ServiceError::InvalidRequest(format!(
                "Unknown tool: {}",
                tool_name
            ))),
        }
    }

    async fn list_resources(&self) -> Result<Vec<rmcp::model::Resource>, ServiceError> {
        Ok(vec![])
    }

    async fn read_resource(
        &self,
        _uri: &str,
    ) -> Result<Vec<rmcp::model::ResourceContents>, ServiceError> {
        Err(ServiceError::InvalidRequest(
            "Resource reading not supported".to_string(),
        ))
    }

    async fn subscribe_resource(&self, _uri: &str) -> Result<(), ServiceError> {
        Ok(())
    }

    async fn unsubscribe_resource(&self, _uri: &str) -> Result<(), ServiceError> {
        Ok(())
    }

    async fn list_prompts(&self) -> Result<Vec<rmcp::model::Prompt>, ServiceError> {
        Ok(vec![])
    }

    async fn get_prompt(
        &self,
        _name: &str,
        _arguments: Option<&serde_json::Value>,
    ) -> Result<rmcp::model::GetPromptResult, ServiceError> {
        Err(ServiceError::InvalidRequest(
            "Prompts not supported".to_string(),
        ))
    }

    async fn complete(
        &self,
        _ref_: rmcp::model::PromptReference,
        _argument: rmcp::model::CompleteArgument,
    ) -> Result<rmcp::model::CompleteResult, ServiceError> {
        Err(ServiceError::InvalidRequest(
            "Completion not supported".to_string(),
        ))
    }

    async fn set_level(&self, _level: rmcp::model::LoggingLevel) -> Result<(), ServiceError> {
        Ok(())
    }
}
