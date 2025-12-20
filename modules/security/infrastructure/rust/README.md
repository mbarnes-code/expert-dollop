# Rust Infrastructure

Shared Rust development infrastructure and build configuration for security domain projects.

## Projects Using Rust

### YARA-X
- **Path**: `modules/security/yara-x`
- **Purpose**: YARA pattern matching reimplemented in Rust for better performance and safety
- **Components**:
  - Core library (`yara-x/lib`)
  - CLI tool (`yara-x/cli`)
  - C API (`yara-x/capi`)
  - Python bindings (`yara-x/py`)
  - Go bindings (`yara-x/go`)
  - Parser (`yara-x/parser`)
  - Formatters (`yara-x/fmt`)
  - Protocol buffers support (`yara-x/proto*`)

### VS Code (Rust components)
- **Path**: `modules/security/vscode/cli`
- **Purpose**: VS Code CLI written in Rust
- **Note**: Part of larger VS Code project, contains Rust-based tooling

## Common Configuration Files

### Cargo.toml (Workspace)
```toml
[workspace]
members = [
    "lib",
    "cli",
    "capi",
    "py",
    "parser",
    "fmt",
    "proto",
    "proto-yaml",
    "proto-json",
    "macros",
]

[workspace.package]
version = "0.1.0"
authors = ["Security Team <security@example.com>"]
edition = "2021"
rust-version = "1.70"
license = "MIT OR Apache-2.0"
repository = "https://github.com/org/project"

[workspace.dependencies]
# Common dependencies
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1", features = ["full"] }
anyhow = "1.0"
thiserror = "1.0"
log = "0.4"
env_logger = "0.11"

# CLI tools
clap = { version = "4.4", features = ["derive"] }
colored = "2.1"

# Testing
criterion = "0.5"
proptest = "1.4"

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
strip = true
```

### Cargo.toml (Binary)
```toml
[package]
name = "yara-x-cli"
version.workspace = true
edition.workspace = true
authors.workspace = true
license.workspace = true

[dependencies]
yara-x = { path = "../lib" }
clap.workspace = true
serde.workspace = true
serde_json.workspace = true
anyhow.workspace = true
colored.workspace = true

[[bin]]
name = "yara-x"
path = "src/main.rs"

[dev-dependencies]
assert_cmd = "2.0"
predicates = "3.0"
tempfile = "3.8"
```

### Cargo.toml (Library)
```toml
[package]
name = "yara-x"
version.workspace = true
edition.workspace = true
authors.workspace = true
license.workspace = true

[lib]
crate-type = ["lib", "cdylib"]

[dependencies]
# Core
regex = "1.10"
memmap2 = "0.9"
bstr = "1.8"

# Parsing
nom = "7.1"
pest = "2.7"
pest_derive = "2.7"

# Error handling
thiserror.workspace = true
anyhow.workspace = true

# Serialization
serde.workspace = true
serde_json.workspace = true
bincode = "1.3"

[features]
default = []
python-bindings = ["pyo3"]

[build-dependencies]
prost-build = "0.12"
```

## Dockerfile

```dockerfile
# Multi-stage build for Rust projects
FROM rust:1.75-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy manifests
COPY Cargo.toml Cargo.lock ./
COPY lib/Cargo.toml ./lib/
COPY cli/Cargo.toml ./cli/

# Build dependencies (cached layer)
RUN mkdir -p lib/src cli/src && \
    echo "fn main() {}" > cli/src/main.rs && \
    echo "pub fn dummy() {}" > lib/src/lib.rs && \
    cargo build --release && \
    rm -rf lib/src cli/src

# Copy source code
COPY lib ./lib
COPY cli ./cli

# Build application
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Copy binary from builder
COPY --from=builder /app/target/release/yara-x /usr/local/bin/

# Create non-root user
RUN useradd -m -u 1000 appuser
USER appuser

ENTRYPOINT ["yara-x"]
CMD ["--help"]
```

## Build Configuration

### Cross-compilation
```toml
# .cargo/config.toml
[target.x86_64-unknown-linux-musl]
linker = "x86_64-linux-musl-gcc"

[target.aarch64-unknown-linux-musl]
linker = "aarch64-linux-musl-gcc"

[target.x86_64-pc-windows-gnu]
linker = "x86_64-w64-mingw32-gcc"

[build]
target = "x86_64-unknown-linux-musl"

[profile.release]
opt-level = 3
lto = true
codegen-units = 1
strip = true
panic = "abort"
```

### CI/CD (GitHub Actions)
```yaml
name: Rust CI

on: [push, pull_request]

env:
  CARGO_TERM_COLOR: always
  RUST_BACKTRACE: 1

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      
      - name: Cache cargo registry
        uses: actions/cache@v3
        with:
          path: ~/.cargo/registry
          key: ${{ runner.os }}-cargo-registry-${{ hashFiles('**/Cargo.lock') }}
      
      - name: Cache cargo index
        uses: actions/cache@v3
        with:
          path: ~/.cargo/git
          key: ${{ runner.os }}-cargo-git-${{ hashFiles('**/Cargo.lock') }}
      
      - name: Cache target
        uses: actions/cache@v3
        with:
          path: target
          key: ${{ runner.os }}-target-${{ hashFiles('**/Cargo.lock') }}
      
      - name: Run tests
        run: cargo test --all-features
      
      - name: Run clippy
        run: cargo clippy -- -D warnings
      
      - name: Check formatting
        run: cargo fmt -- --check

  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      
      - name: Build release
        run: cargo build --release
      
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: binary-${{ matrix.os }}
          path: target/release/yara-x*
```

## Development Tools

### rustfmt.toml
```toml
# Code formatting
max_width = 100
hard_tabs = false
tab_spaces = 4
newline_style = "Unix"
use_small_heuristics = "Default"
fn_single_line = false
where_single_line = false
imports_granularity = "Crate"
group_imports = "StdExternalCrate"
```

### clippy.toml
```toml
# Linting configuration
cognitive-complexity-threshold = 30
too-many-arguments-threshold = 8
```

### .cargo/config.toml
```toml
[alias]
# Common aliases
b = "build"
c = "check"
t = "test"
r = "run"
rr = "run --release"

[build]
# Use mold linker for faster builds (Linux)
rustflags = ["-C", "link-arg=-fuse-ld=mold"]
```

## Common Dependencies

### CLI Applications
- `clap` - Command-line argument parsing
- `colored` - Terminal colors
- `indicatif` - Progress bars
- `env_logger` - Logging

### Error Handling
- `thiserror` - Error types
- `anyhow` - Error context

### Async Runtime
- `tokio` - Async runtime
- `async-trait` - Async traits

### Serialization
- `serde` - Serialization framework
- `serde_json` - JSON support
- `bincode` - Binary encoding

### Networking
- `reqwest` - HTTP client
- `hyper` - HTTP server
- `tonic` - gRPC

### Parsing
- `nom` - Parser combinators
- `pest` - PEG parser

## Testing

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_basic() {
        assert_eq!(2 + 2, 4);
    }

    #[test]
    #[ignore]
    fn expensive_test() {
        // Long-running test
    }
}

// Integration tests (tests/ directory)
// tests/integration_test.rs
use assert_cmd::Command;

#[test]
fn test_cli() {
    let mut cmd = Command::cargo_bin("yara-x").unwrap();
    cmd.arg("--version").assert().success();
}
```

### Benchmarking
```rust
// benches/benchmark.rs
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn fibonacci(n: u64) -> u64 {
    match n {
        0 => 1,
        1 => 1,
        n => fibonacci(n-1) + fibonacci(n-2),
    }
}

fn criterion_benchmark(c: &mut Criterion) {
    c.bench_function("fib 20", |b| b.iter(|| fibonacci(black_box(20))));
}

criterion_group!(benches, criterion_benchmark);
criterion_main!(benches);
```

## FFI (Foreign Function Interface)

### C Bindings
```rust
// Export to C
use std::ffi::{CStr, CString};
use std::os::raw::{c_char, c_int};

#[no_mangle]
pub extern "C" fn yara_compile_rules(
    rules: *const c_char
) -> c_int {
    let c_str = unsafe {
        assert!(!rules.is_null());
        CStr::from_ptr(rules)
    };
    
    let rules_str = c_str.to_str().unwrap();
    // Compile logic
    0 // Success
}
```

### Python Bindings (PyO3)
```rust
use pyo3::prelude::*;

#[pyclass]
struct Scanner {
    inner: InternalScanner,
}

#[pymethods]
impl Scanner {
    #[new]
    fn new(rules: &str) -> PyResult<Self> {
        Ok(Scanner {
            inner: InternalScanner::new(rules)?
        })
    }
    
    fn scan(&self, data: &[u8]) -> PyResult<Vec<String>> {
        self.inner.scan(data)
            .map_err(|e| PyErr::new::<pyo3::exceptions::PyRuntimeError, _>(e.to_string()))
    }
}

#[pymodule]
fn yara_x(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<Scanner>()?;
    Ok(())
}
```

## Security Best Practices

### Memory Safety
- Leverage Rust's ownership system
- Avoid `unsafe` unless necessary
- Use `#![forbid(unsafe_code)]` when possible
- Audit all `unsafe` blocks

### Dependency Management
```bash
# Check for security vulnerabilities
cargo audit

# Update dependencies
cargo update

# Check for outdated dependencies
cargo outdated
```

### Code Quality
```bash
# Linting
cargo clippy -- -D warnings

# Formatting
cargo fmt

# Check for common mistakes
cargo check
```

## Performance Optimization

### Profiling
```bash
# CPU profiling with flamegraph
cargo install flamegraph
cargo flamegraph --bin yara-x

# Memory profiling with valgrind
valgrind --tool=massif target/release/yara-x
```

### Optimization Tips
- Use `cargo build --release` for production
- Enable LTO (Link Time Optimization)
- Profile before optimizing
- Use `#[inline]` judiciously
- Prefer `&str` over `String` when possible
- Use `Vec::with_capacity()` when size is known

## Project Examples

### YARA-X Structure
```
yara-x/
├── Cargo.toml (workspace)
├── lib/ (core library)
├── cli/ (command-line tool)
├── capi/ (C bindings)
├── py/ (Python bindings)
├── go/ (Go bindings)
├── parser/ (YARA parser)
├── fmt/ (code formatter)
├── proto/ (protocol buffers)
├── macros/ (procedural macros)
└── tests/ (integration tests)
```

## Resources

- Rust Documentation: https://doc.rust-lang.org
- Cargo Book: https://doc.rust-lang.org/cargo
- Rust by Example: https://doc.rust-lang.org/rust-by-example
- YARA-X: See `modules/security/yara-x/` for reference implementation
