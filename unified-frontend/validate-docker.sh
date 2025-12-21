#!/bin/bash
# Docker Setup Validation Script
# This script validates the Docker configuration without requiring full builds

set -e

echo "========================================"
echo "Expert Dollop Docker Validation"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Docker is installed
echo -n "Checking Docker installation... "
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
    docker --version
else
    echo -e "${RED}✗${NC}"
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

echo ""

# Check Docker Compose is installed
echo -n "Checking Docker Compose installation... "
if docker compose version &> /dev/null; then
    echo -e "${GREEN}✓${NC}"
    docker compose version
else
    echo -e "${RED}✗${NC}"
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo ""

# Validate docker-compose.yml
echo -n "Validating docker-compose.yml... "
if docker compose -f docker-compose.yml config --quiet 2>&1; then
    VALIDATION_OUTPUT=$(docker compose -f docker-compose.yml config --quiet 2>&1)
    if echo "$VALIDATION_OUTPUT" | grep -q "obsolete"; then
        echo -e "${YELLOW}⚠${NC}  (version field is obsolete but ignored)"
    else
        echo -e "${GREEN}✓${NC}"
    fi
else
    echo -e "${RED}✗${NC}"
    echo "Validation failed. Run: docker compose -f docker-compose.yml config"
    exit 1
fi

# Validate docker-compose-models.yml
echo -n "Validating docker-compose-models.yml... "
if docker compose -f docker-compose-models.yml config --quiet 2>&1; then
    VALIDATION_OUTPUT=$(docker compose -f docker-compose-models.yml config --quiet 2>&1)
    if echo "$VALIDATION_OUTPUT" | grep -q "obsolete"; then
        echo -e "${YELLOW}⚠${NC}  (version field is obsolete but ignored)"
    else
        echo -e "${GREEN}✓${NC}"
    fi
else
    echo -e "${RED}✗${NC}"
    echo "Validation failed. Run: docker compose -f docker-compose-models.yml config"
    exit 1
fi

echo ""

# Check for .env file
echo -n "Checking for .env file... "
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} Found"
else
    echo -e "${YELLOW}⚠${NC}  Not found"
    echo "  Run: cp .env.example .env"
    echo "  Then edit .env with your configuration"
fi

echo ""

# List available profiles
echo "Available Docker Compose Profiles:"
echo ""
echo "Main Services (docker-compose.yml):"
echo "  - backend     : All backend services"
echo "  - django      : Django services only"
echo "  - fastapi     : FastAPI services only"
echo "  - frontend    : Frontend services"
echo "  - workers     : Celery workers"
echo "  - proxy       : Nginx reverse proxy"
echo "  - all         : All main services"
echo ""
echo "AI/ML Services (docker-compose-models.yml):"
echo "  - llm         : Ollama LLM service"
echo "  - embeddings  : Chroma vector database"
echo "  - firecrawl   : Web scraping services"
echo "  - goose       : AI development assistant"
echo "  - n8n         : Workflow automation"
echo "  - mcp         : MCP servers"
echo "  - analytics   : AI analytics"
echo "  - chat        : AI chat interface"
echo "  - all         : All AI/ML services"
echo ""

# List available services
echo "Infrastructure Services (always available):"
echo "  - postgres    : PostgreSQL database"
echo "  - redis       : Redis cache"
echo "  - rabbitmq    : RabbitMQ message broker"
echo ""

echo "========================================"
echo "Validation Complete!"
echo "========================================"
echo ""
echo "Quick Start Commands:"
echo ""
echo "1. Start infrastructure only:"
echo "   docker compose up -d postgres redis rabbitmq"
echo ""
echo "2. Start all backend services:"
echo "   docker compose --profile backend up -d"
echo ""
echo "3. Start all frontend services:"
echo "   docker compose --profile frontend up -d"
echo ""
echo "4. Start AI/ML services:"
echo "   docker compose -f docker-compose-models.yml --profile all up -d"
echo ""
echo "5. Start everything:"
echo "   docker compose --profile all up -d"
echo "   docker compose -f docker-compose-models.yml --profile all up -d"
echo ""
echo "For more information, see DOCKER.md"
echo ""
