# Python Infrastructure

This directory contains infrastructure documentation and common configuration patterns for Python projects in the AI module.

## Projects Using This Stack

### 1. **chroma-mcp** (`/modules/ai/chroma-mcp`)
- **Framework**: MCP Server with ChromaDB integration
- **Package Manager**: pip/uv
- **Python Version**: >=3.10
- **Purpose**: Vector database integration for LLM applications
- **Common Files**:
  - `pyproject.toml`
  - `.python-version`
  - `Dockerfile`
  - `smithery.yaml`
  - `glama.json`
  - Tests: `pytest`

### 2. **NVIDIA NeMo-Agent-Toolkit** (`/modules/ai/NVIDIA/NeMo-Agent-Toolkit/`)
Multiple Python-based examples and services:
- **Simple calculator** - Basic agent example
- **Simple web query** - Web-enabled agent
- **Simple auth** - OAuth2 authentication server
- **MCP examples** - Various MCP server implementations
- **RAG examples** - Retrieval-Augmented Generation
- **Framework**: FastAPI, Flask, UV package manager
- **Common Files**: `pyproject.toml`, `Dockerfile`, `requirements.txt`

### 3. **NVIDIA AIQ Research Assistant** (`/modules/ai/NVIDIA/aiq-research-assistant`)
- **Framework**: Custom AI research platform
- **Common Files**:
  - `pyproject.toml`
  - `requirements.txt`
  - `Dockerfile` (deploy and data processing)

### 4. **NVIDIA DGX Spark Playbooks** (`/modules/ai/NVIDIA/dgx-spark-playbooks/`)
Various AI services:
- **txt2kg** - Text to Knowledge Graph
  - GPU visualization service
  - Sentence transformers service
  - Various deployment services
- **multi-agent-chatbot** - Backend service
- **pytorch-fine-tune** - Model fine-tuning
- **Common Files**: `requirements.txt`, `Dockerfile`, `docker-compose.yml`

### 5. **Firecrawl Examples** (`/modules/ai/firecrawl/examples/`)
Multiple Python examples:
- Web crawlers (GPT-4.1, Gemini 2.5, DeepSeek V3, Llama 4)
- Company researchers
- Hacker News scraper
- OpenAI Swarm integrations
- Deep research tools
- **Common Files**: `requirements.txt`, Python scripts

## Common Configuration Files

### pyproject.toml
Modern Python project configuration:
```toml
[project]
name = "project-name"
version = "0.1.0"
description = "Project description"
requires-python = ">=3.10"
dependencies = [
    "chromadb>=1.0.16",
    "fastapi>=0.100.0",
    "uvicorn>=0.23.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.21.0",
    "pytest-cov>=4.1.0",
]

[project.scripts]
app-name = "module:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
```

### requirements.txt
Traditional dependency management:
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
python-dotenv==1.0.0
httpx==0.25.0
```

### .python-version
Python version specification:
```
3.10
```
or
```
3.11
```

### Dockerfile (Python)
```dockerfile
FROM ghcr.io/astral-sh/uv:python3.11-bookworm-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY pyproject.toml ./
COPY uv.lock ./

# Install dependencies
RUN uv sync

# Copy application code
COPY . .

# Run application
CMD ["uv", "run", "python", "-m", "app"]
```

## Package Managers

### pip
- Traditional Python package manager
- Used in most examples

### uv
- Modern, fast Python package manager
- Used in: NVIDIA NeMo-Agent-Toolkit
- Significantly faster than pip
- Better dependency resolution

### Poetry
- Not currently used but recommended for future projects

## Common Python Frameworks

### FastAPI
- Modern, high-performance web framework
- Async support
- Automatic API documentation
- Type hints support

### Flask
- Lightweight web framework
- Used in auth examples
- Simpler than FastAPI

### MCP SDK
- Model Context Protocol
- `mcp[cli]==1.6.0`
- Used in chroma-mcp

## Common Dependencies

### AI/ML Libraries
- `chromadb` - Vector database
- `openai` - OpenAI API client
- `cohere` - Cohere API client
- `voyageai` - Voyage AI embeddings
- `sentence-transformers` - Embedding models
- `pillow` - Image processing

### Web Frameworks
- `fastapi` - Modern web framework
- `flask` - Lightweight web framework
- `uvicorn` - ASGI server
- `gunicorn` - WSGI server

### Utilities
- `httpx` - Async HTTP client
- `python-dotenv` - Environment variables
- `pydantic` - Data validation
- `typing-extensions` - Type hints

## Testing Frameworks

### pytest
Standard testing framework:
```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
addopts = "-v --cov=src --cov-report=html"
```

Common plugins:
- `pytest-asyncio` - Async test support
- `pytest-cov` - Coverage reporting
- `pytest-mock` - Mocking utilities

## Docker Compose Patterns

### Basic Service
```yaml
services:
  python-service:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
      - LOG_LEVEL=info
    volumes:
      - ./:/app
```

### With UV
```yaml
services:
  app:
    image: ghcr.io/astral-sh/uv:python3.11-bookworm-slim
    working_dir: /app
    volumes:
      - ./:/app
    command: ["uv", "run", "python", "main.py"]
```

### NVIDIA GPU Support
```yaml
services:
  gpu-service:
    image: nvcr.io/nvidia/pytorch:23.10-py3
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    environment:
      - NVIDIA_VISIBLE_DEVICES=all
```

## Environment Variables

Common patterns:
```bash
# API Keys
OPENAI_API_KEY=
COHERE_API_KEY=
VOYAGE_API_KEY=

# Database
DATABASE_URL=postgresql://user:pass@localhost/db
CHROMA_HOST=localhost
CHROMA_PORT=8000

# Server
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=info
WORKERS=4

# Python
PYTHONUNBUFFERED=1
PYTHONPATH=/app
```

## Virtual Environments

### venv
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
```

### uv
```bash
uv venv
source .venv/bin/activate
uv pip install -r requirements.txt
```

## Code Quality Tools

### Black
Code formatter:
```toml
[tool.black]
line-length = 88
target-version = ['py310']
```

### Ruff
Fast linter:
```toml
[tool.ruff]
line-length = 88
target-version = "py310"
```

### mypy
Type checker:
```toml
[tool.mypy]
python_version = "3.10"
strict = true
warn_return_any = true
```

## Smithery Configuration

For MCP servers:
```yaml
# smithery.yaml
name: service-name
version: 1.0.0
runtime: python
entrypoint: python -m module
```

## Best Practices

1. **Use pyproject.toml** - Modern Python project standard
2. **Pin dependencies** - Specify exact versions for reproducibility
3. **Virtual environments** - Always use virtual environments
4. **Type hints** - Use type hints for better code quality
5. **Async/await** - Use async for I/O-bound operations
6. **Testing** - Aim for >80% code coverage
7. **Docker** - Use multi-stage builds to reduce image size
8. **UV package manager** - Consider using UV for faster builds
9. **Environment variables** - Use `.env` files for configuration
10. **Logging** - Use structured logging (JSON format)

## Python Version Support

- **Minimum**: Python 3.10
- **Recommended**: Python 3.11 or 3.12
- **EOL Warning**: Python 3.9 and below reaching end of life

## CI/CD Patterns

### GitHub Actions
```yaml
name: Python CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - run: pip install -e .[dev]
      - run: pytest --cov
      - run: ruff check .
```
