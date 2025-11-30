"""
MCP Protocol Definitions
Provides schema definitions and protocol handlers.
"""

from dataclasses import dataclass
from typing import Any, Dict, List, Literal, Optional, Union
from enum import Enum


class MCPMessageType(Enum):
    """MCP message types."""
    REQUEST = "request"
    RESPONSE = "response"
    NOTIFICATION = "notification"
    ERROR = "error"


class MCPMethod(Enum):
    """Standard MCP methods."""
    INITIALIZE = "initialize"
    LIST_TOOLS = "tools/list"
    CALL_TOOL = "tools/call"
    LIST_PROMPTS = "prompts/list"
    GET_PROMPT = "prompts/get"
    LIST_RESOURCES = "resources/list"
    READ_RESOURCE = "resources/read"
    COMPLETE = "completion/complete"


@dataclass
class MCPRequest:
    """MCP request message."""
    jsonrpc: str = "2.0"
    id: Optional[Union[str, int]] = None
    method: str = ""
    params: Optional[Dict[str, Any]] = None


@dataclass
class MCPResponse:
    """MCP response message."""
    jsonrpc: str = "2.0"
    id: Optional[Union[str, int]] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, Any]] = None


@dataclass
class MCPError:
    """MCP error structure."""
    code: int
    message: str
    data: Optional[Any] = None


# Standard MCP error codes
class MCPErrorCode:
    PARSE_ERROR = -32700
    INVALID_REQUEST = -32600
    METHOD_NOT_FOUND = -32601
    INVALID_PARAMS = -32602
    INTERNAL_ERROR = -32603


# Tool input schema types
TOOL_INPUT_SCHEMA = {
    "type": "object",
    "properties": {},
    "required": [],
    "additionalProperties": False,
}


def create_tool_schema(
    properties: Dict[str, Any],
    required: List[str] = None,
) -> Dict[str, Any]:
    """Create a tool input schema."""
    return {
        "type": "object",
        "properties": properties,
        "required": required or [],
        "additionalProperties": False,
    }


def create_string_property(description: str) -> Dict[str, Any]:
    """Create a string property for tool schema."""
    return {"type": "string", "description": description}


def create_number_property(description: str) -> Dict[str, Any]:
    """Create a number property for tool schema."""
    return {"type": "number", "description": description}


def create_boolean_property(description: str) -> Dict[str, Any]:
    """Create a boolean property for tool schema."""
    return {"type": "boolean", "description": description}


def create_array_property(item_type: str, description: str) -> Dict[str, Any]:
    """Create an array property for tool schema."""
    return {
        "type": "array",
        "items": {"type": item_type},
        "description": description,
    }
