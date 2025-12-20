use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct ConversationRequest {
    pub message: String,
    pub session_id: Option<String>,
    pub model: Option<String>,
    pub extensions: Option<Vec<String>>,
    pub wait_for_completion: Option<bool>,
    pub include_context: Option<bool>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ConversationResponse {
    pub session_id: String,
    pub response: String,
    pub status: String,
    pub execution_time: Option<u64>,
    pub context: Option<serde_json::Value>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RecipeRequest {
    pub recipe_name: String,
    pub parameters: Option<serde_json::Value>,
    pub model: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct RecipeResponse {
    pub session_id: String,
    pub result: String,
    pub status: String,
    pub execution_time: Option<u64>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct SkillRequest {
    pub skill_name: String,
    pub input: Option<String>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct SkillResponse {
    pub session_id: String,
    pub result: String,
    pub status: String,
    pub execution_time: Option<u64>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ContextResponse {
    pub session_id: String,
    pub context: serde_json::Value,
    pub status: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
}
