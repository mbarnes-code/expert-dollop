"""
MCP (Model Context Protocol) Server Base Implementation
Provides the foundation for creating MCP-compatible servers.
"""

from abc import ABC, abstractmethod
from typing import Any, Callable, Dict, List, Optional
from dataclasses import dataclass, field
import json


@dataclass
class MCPTool:
    """Definition of an MCP tool."""
    name: str
    description: str
    input_schema: Dict[str, Any]
    handler: Callable


@dataclass
class MCPPrompt:
    """Definition of an MCP prompt template."""
    name: str
    description: str
    template: str
    arguments: List[str] = field(default_factory=list)


@dataclass
class MCPResource:
    """Definition of an MCP resource."""
    uri: str
    name: str
    description: str
    mime_type: str = "application/json"


class MCPServer(ABC):
    """Base class for MCP servers."""
    
    def __init__(self, name: str, version: str = "1.0.0"):
        self.name = name
        self.version = version
        self._tools: Dict[str, MCPTool] = {}
        self._prompts: Dict[str, MCPPrompt] = {}
        self._resources: Dict[str, MCPResource] = {}
    
    def tool(self, name: Optional[str] = None, description: str = "", input_schema: Optional[Dict] = None):
        """Decorator to register a tool."""
        def decorator(func: Callable):
            tool_name = name or func.__name__
            self._tools[tool_name] = MCPTool(
                name=tool_name,
                description=description or func.__doc__ or "",
                input_schema=input_schema or {},
                handler=func,
            )
            return func
        return decorator
    
    def register_prompt(self, prompt: MCPPrompt) -> None:
        """Register a prompt template."""
        self._prompts[prompt.name] = prompt
    
    def register_resource(self, resource: MCPResource) -> None:
        """Register a resource."""
        self._resources[resource.uri] = resource
    
    def list_tools(self) -> List[Dict[str, Any]]:
        """List all registered tools."""
        return [
            {
                "name": tool.name,
                "description": tool.description,
                "inputSchema": tool.input_schema,
            }
            for tool in self._tools.values()
        ]
    
    def list_prompts(self) -> List[Dict[str, Any]]:
        """List all registered prompts."""
        return [
            {
                "name": prompt.name,
                "description": prompt.description,
                "arguments": prompt.arguments,
            }
            for prompt in self._prompts.values()
        ]
    
    def list_resources(self) -> List[Dict[str, Any]]:
        """List all registered resources."""
        return [
            {
                "uri": resource.uri,
                "name": resource.name,
                "description": resource.description,
                "mimeType": resource.mime_type,
            }
            for resource in self._resources.values()
        ]
    
    async def call_tool(self, name: str, arguments: Dict[str, Any]) -> Any:
        """Execute a registered tool."""
        if name not in self._tools:
            raise ValueError(f"Tool '{name}' not found")
        
        tool = self._tools[name]
        return await tool.handler(**arguments)
    
    def get_prompt(self, name: str, arguments: Dict[str, str]) -> str:
        """Get a rendered prompt template."""
        if name not in self._prompts:
            raise ValueError(f"Prompt '{name}' not found")
        
        prompt = self._prompts[name]
        rendered = prompt.template
        for arg_name, arg_value in arguments.items():
            rendered = rendered.replace(f"{{{arg_name}}}", arg_value)
        return rendered
    
    @abstractmethod
    async def run(self, host: str = "localhost", port: int = 9000) -> None:
        """Start the MCP server."""
        pass
    
    def get_server_info(self) -> Dict[str, Any]:
        """Get server information."""
        return {
            "name": self.name,
            "version": self.version,
            "protocolVersion": "2024-11-05",
            "capabilities": {
                "tools": len(self._tools) > 0,
                "prompts": len(self._prompts) > 0,
                "resources": len(self._resources) > 0,
            },
        }
