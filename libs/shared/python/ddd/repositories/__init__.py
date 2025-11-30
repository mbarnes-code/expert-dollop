"""
DDD Repository interfaces.

Provides abstract repository interfaces for data access following
the Repository pattern from Domain-Driven Design.
"""

from .base import Repository, ReadOnlyRepository

__all__ = [
    'Repository',
    'ReadOnlyRepository',
]
