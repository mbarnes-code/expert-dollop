# Firecrawl Multi-Language SDKs

This directory contains the Firecrawl SDKs for multiple programming languages.

## Directory Structure

```
firecrawl-sdks/
├── README.md           # Rust SDK README (original)
├── Cargo.toml          # Rust SDK manifest
├── src/                # Rust SDK source
├── tests/              # Rust SDK tests
├── examples/           # Rust SDK examples
├── js-sdk/             # JavaScript/TypeScript SDK
│   ├── package.json
│   └── firecrawl/      # Main package
└── python-sdk/         # Python SDK
    ├── pyproject.toml
    └── firecrawl/      # Main package
```

## Available SDKs

### 🦀 Rust SDK (Root Directory)
**Purpose:** Type-safe Firecrawl client for Rust applications and Goose integration

**Installation:**
```toml
[dependencies]
firecrawl = { path = "../firecrawl-sdks" }
```

**Key Features:**
- Type-safe API
- Async/await support
- Integration with Goose AI agent
- High performance

See main `README.md` for Rust SDK documentation.

### 📦 JavaScript/TypeScript SDK (`js-sdk/`)
**Purpose:** Firecrawl client for Node.js and browser environments

**Installation:**
```bash
npm install @mendable/firecrawl-js
# or
pnpm add @mendable/firecrawl-js
```

**Quick Example:**
```typescript
import Firecrawl from '@mendable/firecrawl-js';

const firecrawl = new Firecrawl({ apiKey: 'fc-YOUR_API_KEY' });
const doc = await firecrawl.scrape('https://example.com', {
  formats: ['markdown', 'html'],
});
```

### 🐍 Python SDK (`python-sdk/`)
**Purpose:** Firecrawl client for Python applications and data pipelines

**Installation:**
```bash
pip install firecrawl-py
```

**Quick Example:**
```python
from firecrawl import Firecrawl

firecrawl = Firecrawl(api_key="fc-YOUR_API_KEY")
doc = firecrawl.scrape(
    "https://example.com",
    formats=["markdown", "html"],
)
```

## Supported Features

All SDKs support:
- ✅ Single URL scraping
- ✅ Multi-page crawling
- ✅ URL mapping/discovery
- ✅ LLM-powered data extraction
- ✅ Web search with scraping
- ✅ Batch scraping
- ✅ Browser actions
- ✅ Async/await operations

## Development

### Build All SDKs

```bash
# Rust SDK
cargo build
cargo test

# JavaScript SDK
cd js-sdk
pnpm install
pnpm build

# Python SDK
cd python-sdk
pip install -e .
pytest
```

## Integration with Goose AI Agent

The Rust SDK is specifically designed for Goose integration:

```rust
use firecrawl::FirecrawlApp;

// In Goose tool implementation
let app = FirecrawlApp::new(&api_key)?;
let result = app.scrape_url(&url, None).await?;
// Use result.markdown in Goose context
```

## Documentation

- 🦀 [Rust SDK Docs](https://docs.firecrawl.dev/sdks/rust)
- 📦 [JavaScript SDK Docs](https://docs.firecrawl.dev/sdks/node)
- 🐍 [Python SDK Docs](https://docs.firecrawl.dev/sdks/python)
- 📚 [API Reference](https://docs.firecrawl.dev/api-reference/introduction)

## License

All SDKs are MIT licensed.
