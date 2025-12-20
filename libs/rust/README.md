# Rust Shared Libraries

Minimal shared Rust code used across multiple domains.

## Packages

- `common/` - Common utilities
- `utils/` - Utility functions

## Usage

Each crate is independently versioned and can be imported by modules:

```toml
[dependencies]
expert-dollop-rust-common = { path = "../../libs/rust/common" }
```
