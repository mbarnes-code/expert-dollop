"""
Base service abstractions following DDD patterns.

These abstract classes define the contract for domain and application services,
enabling clean separation of concerns in the modular monolith.
"""

from abc import ABC, abstractmethod
from typing import Any, Generic, TypeVar

T = TypeVar('T')
R = TypeVar('R')


class DomainService(ABC):
    """
    Abstract base class for Domain Services.
    
    Domain Services encapsulate domain logic that doesn't naturally fit
    within a single entity or value object. They operate on domain concepts
    and should be stateless.
    
    Example:
        class ComboValidationService(DomainService):
            def validate_combo(self, cards: List[Card]) -> bool:
                # Complex validation logic
                pass
    """
    
    @abstractmethod
    def execute(self, *args: Any, **kwargs: Any) -> Any:
        """
        Execute the domain service operation.
        
        This is the primary entry point for domain service logic.
        """
        pass


class ApplicationService(ABC, Generic[T, R]):
    """
    Abstract base class for Application Services.
    
    Application Services orchestrate domain operations and handle
    cross-cutting concerns like transactions, logging, and authorization.
    They serve as the API for use cases in the application.
    
    Type parameters:
        T: Input/Request type
        R: Output/Response type
    
    Example:
        class FindCombosUseCase(ApplicationService[FindCombosRequest, List[ComboDTO]]):
            def execute(self, request: FindCombosRequest) -> List[ComboDTO]:
                # Orchestrate domain operations
                pass
    """
    
    @abstractmethod
    def execute(self, request: T) -> R:
        """
        Execute the application service use case.
        
        Args:
            request: The input request containing use case parameters.
            
        Returns:
            The result of the use case execution.
        """
        pass


class QueryService(ABC, Generic[T, R]):
    """
    Abstract base class for Query Services.
    
    Query Services handle read operations following CQRS principles.
    They should be optimized for reading and can use read-specific models.
    """
    
    @abstractmethod
    def query(self, criteria: T) -> R:
        """
        Execute a query operation.
        
        Args:
            criteria: Query criteria/parameters.
            
        Returns:
            Query result.
        """
        pass


class CommandHandler(ABC, Generic[T, R]):
    """
    Abstract base class for Command Handlers.
    
    Command Handlers process commands that modify state following CQRS principles.
    Each handler is responsible for a single command type.
    """
    
    @abstractmethod
    def handle(self, command: T) -> R:
        """
        Handle a command.
        
        Args:
            command: The command to handle.
            
        Returns:
            Result of command execution.
        """
        pass
