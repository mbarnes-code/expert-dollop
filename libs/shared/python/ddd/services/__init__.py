"""
DDD Service abstractions.

Provides abstract service classes for domain and application services
following Domain-Driven Design patterns.
"""

from .base import DomainService, ApplicationService

__all__ = [
    'DomainService',
    'ApplicationService',
]
