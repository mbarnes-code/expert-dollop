# Shared DDD Library

A shared Python library providing Domain-Driven Design (DDD) abstractions for use across the modular monolith architecture.

## Overview

This library provides:

- **Entity Base Classes**: `Entity`, `AggregateRoot`, `ValueObject`
- **Repository Interfaces**: `Repository`, `ReadOnlyRepository`
- **Service Abstractions**: `DomainService`, `ApplicationService`, `QueryService`, `CommandHandler`

## Installation

From the repository root:

```bash
pip install -e libs/shared/python
```

Or add to your requirements:

```
-e ../../libs/shared/python
```

## Usage

### Entities

```python
from ddd import Entity, AggregateRoot, ValueObject

@dataclass(frozen=True)
class CardName(ValueObject):
    value: str
    unaccented: str

@dataclass
class Card(AggregateRoot[int]):
    name: CardName
    type_line: str
    
    def validate(self) -> bool:
        return bool(self.name.value)
```

### Repositories

```python
from ddd import Repository

class CardRepository(Repository[Card, int]):
    def get_by_id(self, entity_id: int) -> Optional[Card]:
        # Implementation
        pass
```

### Services

```python
from ddd import ApplicationService

class FindCombosUseCase(ApplicationService[FindCombosRequest, List[ComboDTO]]):
    def execute(self, request: FindCombosRequest) -> List[ComboDTO]:
        # Implementation
        pass
```

## Design Principles

This library follows these DDD principles:

1. **Ubiquitous Language**: All classes use domain terminology
2. **Bounded Contexts**: Designed to support multiple bounded contexts
3. **Aggregate Roots**: Clear boundaries for transactional consistency
4. **Repository Pattern**: Abstract data access from domain logic
5. **Domain Events**: Support for eventual consistency patterns
