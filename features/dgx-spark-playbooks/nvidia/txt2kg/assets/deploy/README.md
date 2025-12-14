# Deployment Configuration

This directory contains all deployment-related configuration for the txt2kg project.

## Structure

- **compose/**: Docker Compose files for local development and testing
  - `docker-compose.yml`: Minimal Docker Compose configuration (Ollama + ArangoDB + Next.js)
  - `docker-compose.complete.yml`: Complete stack with optional services (vLLM, Pinecone, Sentence Transformers)
  - `docker-compose.optional.yml`: Additional optional services
  - `docker-compose.vllm.yml`: Legacy vLLM configuration (use `--complete` flag instead)

- **app/**: Frontend application Docker configuration
  - Dockerfile for Next.js application

- **services/**: Containerized services
  - **ollama/**: Ollama LLM inference service with GPU support
  - **sentence-transformers/**: Sentence transformer service for embeddings (optional)
  - **vllm/**: vLLM inference service with FP8 quantization (optional)
  - **gpu-viz/**: GPU-accelerated graph visualization services (optional, run separately)
  - **gnn_model/**: Graph Neural Network model service (experimental, not in default compose files)

## Usage

**Recommended: Use the start script**

```bash
# Minimal setup (Ollama + ArangoDB + Next.js frontend)
./start.sh

# Complete stack (includes vLLM, Pinecone, Sentence Transformers)
./start.sh --complete

# Development mode (run frontend without Docker)
./start.sh --dev-frontend
```

**Manual Docker Compose commands:**

To start the minimal services:

```bash
docker compose -f deploy/compose/docker-compose.yml up -d
```

To start the complete stack:

```bash
docker compose -f deploy/compose/docker-compose.complete.yml up -d
```

## Services Included

### Minimal Stack (default)
- **Next.js App**: Web UI on port 3001
- **ArangoDB**: Graph database on port 8529
- **Ollama**: Local LLM inference on port 11434

### Complete Stack (`--complete` flag)
All minimal services plus:
- **vLLM**: Advanced LLM inference on port 8001
- **Pinecone (Local)**: Vector embeddings on port 5081
- **Sentence Transformers**: Embedding generation on port 8000

### Optional Services (run separately)
- **GPU-Viz Services**: See `services/gpu-viz/README.md` for GPU-accelerated visualization
- **GNN Model Service**: See `services/gnn_model/README.md` for experimental GNN-based RAG