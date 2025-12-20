# Shared Libraries

This directory contains MINIMAL shared code that is used across multiple domains.

## Principle: Prefer Duplication Over Premature Abstraction

Only extract code to libs/ when:
1. The code is used by 3+ modules across DIFFERENT domains
2. The code has a clear, single purpose
3. The code is stable and unlikely to change frequently

## Structure

- `typescript/` - Shared TypeScript utilities and components
- `python/` - Shared Python utilities and modules
- `rust/` - Shared Rust crates and utilities
- `go/` - Shared Go packages and utilities

## Guidelines

- Each lib should have its own package.json/requirements.txt/Cargo.toml/go.mod
- Each lib should be independently versioned
- Each lib should have comprehensive tests
- Libs should NOT depend on other libs unless absolutely necessary
