# Rust Infrastructure

This directory contains infrastructure documentation and common configuration patterns for Rust projects in the AI module.

## Projects Using This Stack

### 1. **goose** (`/modules/ai/goose`)
- **Framework**: Cargo workspace with multiple crates
- **Rust Version**: Specified in `rust-toolchain.toml`
- **Purpose**: AI agent platform
- **Build System**: Cargo + Cross for cross-compilation
- **Common Files**:
  - `Cargo.toml` - Workspace configuration
  - `rust-toolchain.toml` - Toolchain version
  - `Cross.toml` - Cross-compilation config
  - `Justfile` - Task automation (alternative to Makefiles)
  - `Dockerfile` - Container build
  - `.dockerignore` - Docker build optimization

### Project Structure
```
goose/
├── Cargo.toml              # Workspace root
├── rust-toolchain.toml     # Toolchain version
├── Cross.toml              # Cross-compilation
├── Justfile                # Task runner
├── Dockerfile              # Container build
├── crates/                 # Workspace crates
│   ├── goose-cli/
│   ├── goose-server/
│   ├── goose-core/
│   └── ...
├── clippy-baselines/       # Clippy lint baselines
├── .cargo/
│   └── config.toml
└── target/                 # Build artifacts (gitignored)
```

## Common Configuration Files

### Cargo.toml (Workspace)
Workspace configuration with shared settings:
```toml
[workspace]
members = ["crates/*"]
resolver = "2"

[workspace.package]
edition = "2021"
version = "1.15.0"
authors = ["Block <ai-oss-tools@block.xyz>"]
license = "Apache-2.0"
repository = "https://github.com/block/goose"
description = "An AI agent"

[workspace.lints.clippy]
uninlined_format_args = "allow"
string_slice = "warn"

[workspace.dependencies]
rmcp = { version = "0.9.1", features = ["schemars", "auth"] }

# Patch for Windows cross-compilation
[patch.crates-io]
crunchy = { git = "https://github.com/nmathewson/crunchy", branch = "cross-compilation-fix" }
```

### Cargo.toml (Crate)
Individual crate configuration:
```toml
[package]
name = "goose-cli"
version.workspace = true
edition.workspace = true
authors.workspace = true
license.workspace = true
repository.workspace = true

[dependencies]
goose-core = { path = "../goose-core" }
rmcp = { workspace = true }
tokio = { version = "1.35", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
anyhow = "1.0"

[dev-dependencies]
tokio-test = "0.4"
```

### rust-toolchain.toml
Specify Rust toolchain version:
```toml
[toolchain]
channel = "1.75.0"
components = ["rustfmt", "clippy"]
targets = ["x86_64-unknown-linux-gnu", "x86_64-apple-darwin", "x86_64-pc-windows-msvc"]
```

### Cross.toml
Cross-compilation configuration:
```toml
[build]
pre-build = [
    "apt-get update",
    "apt-get install -y libssl-dev pkg-config"
]

[target.x86_64-unknown-linux-gnu]
image = "rust-cross:x86_64-unknown-linux-gnu"

[target.aarch64-unknown-linux-gnu]
image = "rust-cross:aarch64-unknown-linux-gnu"
```

### Justfile
Task automation (modern alternative to Make):
```just
# Build the project
build:
    cargo build --release

# Run tests
test:
    cargo test --workspace

# Run clippy
lint:
    cargo clippy --workspace --all-targets -- -D warnings

# Format code
fmt:
    cargo fmt --all

# Check formatting
fmt-check:
    cargo fmt --all -- --check

# Clean build artifacts
clean:
    cargo clean

# Cross-compile for all targets
cross-build:
    cross build --target x86_64-unknown-linux-gnu --release
    cross build --target x86_64-apple-darwin --release
    cross build --target x86_64-pc-windows-msvc --release
```

### Dockerfile
Multi-stage build for Rust:
```dockerfile
# Build stage
FROM rust:1.75-slim as builder

WORKDIR /app

# Copy manifests
COPY Cargo.toml Cargo.lock ./
COPY crates/ crates/

# Build dependencies (cached layer)
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/target/release/goose /usr/local/bin/

ENTRYPOINT ["goose"]
```

## Common Rust Frameworks & Libraries

### Async Runtime
- **tokio** - Async runtime
  - `features = ["full"]` for complete feature set
  - `features = ["rt-multi-thread", "macros"]` for minimal setup

### Web Frameworks
- **axum** - Modern web framework built on tokio
- **actix-web** - High-performance web framework
- **warp** - Composable web framework

### Serialization
- **serde** - Serialization/deserialization
  - `features = ["derive"]` for derive macros
- **serde_json** - JSON support
- **toml** - TOML configuration

### Error Handling
- **anyhow** - Flexible error handling
- **thiserror** - Custom error types
- **color-eyre** - Beautiful error reports

### CLI Tools
- **clap** - Command-line argument parser
  - `features = ["derive"]` for derive API
- **indicatif** - Progress bars and spinners
- **colored** - Terminal colors

### Logging
- **tracing** - Structured logging and diagnostics
- **tracing-subscriber** - Logging implementation
- **env_logger** - Simple environment-based logging

### MCP (Model Context Protocol)
- **rmcp** - Rust MCP implementation
  - `features = ["schemars", "auth"]`

## Workspace Organization

### Crate Types

#### Binary Crates
```toml
[[bin]]
name = "goose-cli"
path = "src/main.rs"
```

#### Library Crates
```toml
[lib]
name = "goose_core"
path = "src/lib.rs"
```

### Shared Dependencies
```toml
[workspace.dependencies]
tokio = { version = "1.35", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }

# In individual crates
[dependencies]
tokio = { workspace = true }
serde = { workspace = true }
```

## Build Patterns

### Development Build
```bash
cargo build
```

### Release Build
```bash
cargo build --release
```

### Workspace Build
```bash
cargo build --workspace
cargo build --workspace --release
```

### Specific Crate
```bash
cargo build -p goose-cli
```

### With Features
```bash
cargo build --features "auth,tls"
```

## Testing

### Unit Tests
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_example() {
        assert_eq!(2 + 2, 4);
    }
}
```

### Async Tests
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_async() {
        let result = async_function().await;
        assert!(result.is_ok());
    }
}
```

### Integration Tests
```
tests/
├── integration_test.rs
└── common/
    └── mod.rs
```

### Running Tests
```bash
# All tests
cargo test --workspace

# Specific crate
cargo test -p goose-cli

# With output
cargo test -- --nocapture

# Specific test
cargo test test_name
```

## Code Quality

### Clippy
```bash
# Run clippy
cargo clippy --workspace

# Fix warnings
cargo clippy --fix --workspace

# Deny warnings
cargo clippy --workspace -- -D warnings
```

### Clippy Configuration
```toml
[workspace.lints.clippy]
# Allow specific lints
uninlined_format_args = "allow"

# Warn on specific patterns
string_slice = "warn"
```

### Rustfmt
```bash
# Format code
cargo fmt --all

# Check formatting
cargo fmt --all -- --check
```

### rustfmt.toml
```toml
edition = "2021"
max_width = 100
use_small_heuristics = "Default"
imports_granularity = "Crate"
group_imports = "StdExternalCrate"
```

## Cross-Compilation

### Using Cross
```bash
# Install cross
cargo install cross

# Build for Linux
cross build --target x86_64-unknown-linux-gnu --release

# Build for macOS
cross build --target x86_64-apple-darwin --release

# Build for Windows
cross build --target x86_64-pc-windows-msvc --release

# Build for ARM
cross build --target aarch64-unknown-linux-gnu --release
```

### Common Targets
- `x86_64-unknown-linux-gnu` - Linux 64-bit
- `x86_64-apple-darwin` - macOS Intel
- `aarch64-apple-darwin` - macOS Apple Silicon
- `x86_64-pc-windows-msvc` - Windows 64-bit
- `aarch64-unknown-linux-gnu` - Linux ARM64

## Dependency Management

### Adding Dependencies
```bash
cargo add tokio --features full
cargo add serde --features derive
```

### Updating Dependencies
```bash
# Update all
cargo update

# Update specific
cargo update -p tokio
```

### Audit Dependencies
```bash
cargo install cargo-audit
cargo audit
```

## Docker Build Optimization

### Layer Caching
```dockerfile
# Copy only manifests first
COPY Cargo.toml Cargo.lock ./
COPY crates/*/Cargo.toml crates/

# Build dependencies (cached)
RUN cargo build --release

# Then copy source
COPY . .
RUN cargo build --release
```

### Minimal Runtime Image
```dockerfile
FROM gcr.io/distroless/cc-debian12

COPY --from=builder /app/target/release/app /

ENTRYPOINT ["/app"]
```

## Environment Variables

```bash
# Compiler
RUSTC_WRAPPER=sccache     # Cache compiler output
CARGO_TARGET_DIR=/target  # Custom target directory

# Build
CARGO_BUILD_JOBS=4        # Parallel builds
RUSTFLAGS="-C target-cpu=native"  # Optimize for CPU

# Logging
RUST_LOG=info             # Log level
RUST_BACKTRACE=1          # Show backtraces
RUST_BACKTRACE=full       # Full backtraces
```

## Performance Optimization

### Compiler Flags
```toml
[profile.release]
opt-level = 3              # Maximum optimization
lto = "fat"                # Link-time optimization
codegen-units = 1          # Better optimization
strip = true               # Strip symbols
panic = "abort"            # Smaller binary
```

### Profile-Guided Optimization (PGO)
```bash
# Build with instrumentation
RUSTFLAGS="-Cprofile-generate=/tmp/pgo-data" cargo build --release

# Run program to generate profile
./target/release/app

# Build with profile
RUSTFLAGS="-Cprofile-use=/tmp/pgo-data/merged.profdata" cargo build --release
```

## Best Practices

1. **Use Workspaces** - Organize related crates
2. **Shared Dependencies** - Define common deps in workspace
3. **Clippy** - Fix all warnings before committing
4. **Rustfmt** - Always format code
5. **Error Handling** - Use `anyhow` for applications, `thiserror` for libraries
6. **Async** - Use tokio for async operations
7. **Type Safety** - Leverage Rust's type system
8. **Documentation** - Write doc comments for public APIs
9. **Testing** - Write tests for all public functions
10. **CI/CD** - Automate builds, tests, and linting

## CI/CD Patterns

### GitHub Actions
```yaml
name: Rust CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: dtolnay/rust-toolchain@stable
      
      - name: Cache cargo
        uses: actions/cache@v3
        with:
          path: |
            ~/.cargo/bin/
            ~/.cargo/registry/index/
            ~/.cargo/registry/cache/
            ~/.cargo/git/db/
            target/
          key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
      
      - name: Run tests
        run: cargo test --workspace --all-features
      
      - name: Run clippy
        run: cargo clippy --workspace -- -D warnings
      
      - name: Check formatting
        run: cargo fmt --all -- --check
```

### Cross-Platform Build
```yaml
jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v3
      - uses: dtolnay/rust-toolchain@stable
      - run: cargo build --release
```

## Security

### Cargo Deny
```bash
cargo install cargo-deny
cargo deny check
```

### cargo-deny.toml
```toml
[advisories]
vulnerability = "deny"
unmaintained = "warn"

[licenses]
allow = ["Apache-2.0", "MIT"]
deny = ["GPL-3.0"]

[bans]
multiple-versions = "warn"
```

## Documentation

### Doc Comments
```rust
/// Performs an important operation
///
/// # Examples
///
/// ```
/// use goose::important_op;
/// let result = important_op(42);
/// assert_eq!(result, 84);
/// ```
pub fn important_op(x: i32) -> i32 {
    x * 2
}
```

### Generate Docs
```bash
cargo doc --open --workspace
```

## Useful Cargo Commands

```bash
# Check without building
cargo check

# Build documentation
cargo doc

# Show dependency tree
cargo tree

# Search for packages
cargo search tokio

# Show outdated dependencies
cargo outdated

# Expand macros
cargo expand
```
