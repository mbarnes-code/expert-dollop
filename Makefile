# Expert Dollop - Docker Management Makefile
# Provides convenient commands for managing Docker services

.PHONY: help
help: ## Show this help message
	@echo "Expert Dollop Docker Management"
	@echo "================================"
	@echo ""
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2}'
	@echo ""

.PHONY: validate
validate: ## Validate Docker configuration
	@./validate-docker.sh

.PHONY: env
env: ## Create .env from .env.example
	@if [ -f .env ]; then \
		echo "⚠️  .env already exists. Use 'make env-force' to overwrite."; \
	else \
		cp .env.example .env; \
		echo "✓ Created .env from .env.example"; \
		echo "  Please edit .env with your configuration"; \
	fi

.PHONY: env-force
env-force: ## Force create .env from .env.example (overwrites existing)
	cp .env.example .env
	@echo "✓ Overwrote .env from .env.example"
	@echo "  Please edit .env with your configuration"

# Infrastructure targets
.PHONY: infra-up
infra-up: ## Start infrastructure services (postgres, redis, rabbitmq)
	docker compose up -d postgres redis rabbitmq

.PHONY: infra-down
infra-down: ## Stop infrastructure services
	docker compose stop postgres redis rabbitmq

.PHONY: infra-logs
infra-logs: ## View infrastructure logs
	docker compose logs -f postgres redis rabbitmq

# Backend targets
.PHONY: backend-up
backend-up: ## Start all backend services
	docker compose --profile backend up -d

.PHONY: backend-down
backend-down: ## Stop all backend services
	docker compose --profile backend down

.PHONY: backend-logs
backend-logs: ## View backend service logs
	docker compose --profile backend logs -f

.PHONY: django-up
django-up: ## Start Django services only
	docker compose --profile django up -d

.PHONY: fastapi-up
fastapi-up: ## Start FastAPI services only
	docker compose --profile fastapi up -d

# Frontend targets
.PHONY: frontend-up
frontend-up: ## Start frontend services
	docker compose --profile frontend up -d

.PHONY: frontend-down
frontend-down: ## Stop frontend services
	docker compose --profile frontend down

.PHONY: frontend-logs
frontend-logs: ## View frontend logs
	docker compose --profile frontend logs -f

# Worker targets
.PHONY: workers-up
workers-up: ## Start Celery workers
	docker compose --profile workers up -d

.PHONY: workers-down
workers-down: ## Stop Celery workers
	docker compose --profile workers down

.PHONY: workers-logs
workers-logs: ## View worker logs
	docker compose --profile workers logs -f

# AI/ML targets
.PHONY: ai-up
ai-up: ## Start all AI/ML services
	docker compose -f docker-compose-models.yml --profile all up -d

.PHONY: ai-down
ai-down: ## Stop all AI/ML services
	docker compose -f docker-compose-models.yml --profile all down

.PHONY: ai-logs
ai-logs: ## View AI/ML service logs
	docker compose -f docker-compose-models.yml --profile all logs -f

.PHONY: llm-up
llm-up: ## Start LLM services (Ollama)
	docker compose -f docker-compose-models.yml --profile llm up -d

.PHONY: firecrawl-up
firecrawl-up: ## Start Firecrawl services
	docker compose -f docker-compose-models.yml --profile firecrawl up -d

.PHONY: n8n-up
n8n-up: ## Start N8N workflow automation
	docker compose -f docker-compose-models.yml --profile n8n up -d

# ELK Stack targets
.PHONY: elk-up
elk-up: ## Start Elasticsearch, Kibana, Logstash stack
	docker compose --profile elk up -d

.PHONY: elk-down
elk-down: ## Stop ELK stack
	docker compose stop elasticsearch kibana logstash

.PHONY: elk-logs
elk-logs: ## View ELK stack logs
	docker compose logs -f elasticsearch kibana logstash

.PHONY: elasticsearch-up
elasticsearch-up: ## Start only Elasticsearch
	docker compose up -d elasticsearch

.PHONY: kibana-up
kibana-up: ## Start Kibana (requires Elasticsearch)
	docker compose up -d kibana

# Combined targets
.PHONY: up
up: infra-up backend-up frontend-up ## Start all main services (infra + backend + frontend)

.PHONY: down
down: ## Stop all services
	docker compose --profile all down
	docker compose -f docker-compose-models.yml --profile all down

.PHONY: up-all
up-all: ## Start everything (main + AI services)
	docker compose --profile all up -d
	docker compose -f docker-compose-models.yml --profile all up -d

.PHONY: logs
logs: ## View all service logs
	docker compose --profile all logs -f

.PHONY: ps
ps: ## Show status of all services
	@echo "Main Services:"
	@docker compose ps
	@echo ""
	@echo "AI/ML Services:"
	@docker compose -f docker-compose-models.yml ps

# Build targets
.PHONY: build
build: ## Build all Docker images
	docker compose --profile all build
	docker compose -f docker-compose-models.yml --profile all build

.PHONY: build-frontend
build-frontend: ## Build frontend images
	docker compose build frontend-main n8n-frontend

.PHONY: build-backend
build-backend: ## Build backend images
	docker compose --profile backend build

.PHONY: rebuild
rebuild: ## Rebuild all images (no cache)
	docker compose --profile all build --no-cache
	docker compose -f docker-compose-models.yml --profile all build --no-cache

# Cleanup targets
.PHONY: clean
clean: ## Remove stopped containers
	docker compose --profile all down
	docker compose -f docker-compose-models.yml --profile all down

.PHONY: clean-volumes
clean-volumes: ## Remove all volumes (WARNING: deletes data)
	@echo "⚠️  WARNING: This will delete all data in Docker volumes!"
	@echo "Press Ctrl+C to cancel, or Enter to continue..."
	@read
	docker compose --profile all down -v
	docker compose -f docker-compose-models.yml --profile all down -v

.PHONY: clean-all
clean-all: clean clean-volumes ## Remove everything including volumes

# Database targets
.PHONY: db-shell
db-shell: ## Open PostgreSQL shell
	docker compose exec postgres psql -U postgres -d expert_dollop

.PHONY: db-migrate
db-migrate: ## Run Django migrations
	docker compose exec django-spellbook python manage.py migrate

.PHONY: redis-cli
redis-cli: ## Open Redis CLI
	docker compose exec redis redis-cli

# Development targets
.PHONY: dev-backend
dev-backend: ## Start backend in development mode
	docker compose up django-spellbook fastapi-core

.PHONY: dev-frontend
dev-frontend: ## Start frontend in development mode
	docker compose up frontend-main

.PHONY: shell-backend
shell-backend: ## Open shell in backend container
	docker compose exec fastapi-core /bin/bash

.PHONY: shell-frontend
shell-frontend: ## Open shell in frontend container
	docker compose exec frontend-main /bin/sh

# Health check targets
.PHONY: health
health: ## Check health of all services
	@echo "Checking service health..."
	@docker compose ps --format json | jq -r '.[] | "\(.Name): \(.Health)"'

# Documentation targets
.PHONY: docs
docs: ## Open Docker documentation
	@if command -v xdg-open > /dev/null; then \
		xdg-open DOCKER.md; \
	elif command -v open > /dev/null; then \
		open DOCKER.md; \
	else \
		echo "Please open DOCKER.md in your editor"; \
	fi

.PHONY: inventory
inventory: ## View Docker files inventory
	@cat DOCKER_INVENTORY.md

# Default target
.DEFAULT_GOAL := help
