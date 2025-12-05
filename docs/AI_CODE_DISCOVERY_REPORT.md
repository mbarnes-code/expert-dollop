# AI Code Discovery Report

**Date:** 2025-12-03  
**Purpose:** Comprehensive inventory of AI-related code in the features directory that could be integrated into apps/ai

## Executive Summary

This report documents all AI-related code found in the `features/` directory, organized by project and capability. The analysis identified significant AI infrastructure across three main projects (n8n, Firecrawl, Goose) and one additional project (Dispatch) that wasn't previously analyzed.

**Key Finding:** Beyond the already-migrated code, there are extensive LangChain/LangGraph implementations, vector databases, embeddings, RAG systems, and AI agent frameworks that could be integrated into `apps/ai`.

---

## 1. n8n - Enterprise LangChain Infrastructure

### Location
`features/n8n/packages/@n8n/nodes-langchain/`

### Description
Comprehensive LangChain node ecosystem for visual AI workflow building. This is a production-grade implementation with 100+ specialized nodes.

### Categories of AI Capabilities

#### 1.1 Language Models (LLMs)
**Location:** `nodes/llms/`

**Providers Supported:**
- **OpenAI**: Chat GPT-4, GPT-3.5, standard completion models
- **Anthropic**: Claude (all variants)
- **Google**: Gemini, Vertex AI
- **AWS Bedrock**: Multi-model support
- **Azure OpenAI**: Enterprise integration
- **Cohere**: Chat and completion
- **Ollama**: Local model hosting
- **Groq**: Fast inference
- **DeepSeek**: Chinese LLM provider
- **MistralCloud**: Mistral models
- **OpenRouter**: Multi-provider routing
- **Vercel AI Gateway**: Gateway integration
- **X.AI Grok**: Grok models
- **Lemonade**: Custom provider
- **HuggingFace Inference**: Open-source models

**Files:** 20+ LLM node implementations

**Potential Integration:**
- Could power `apps/ai/chat` with actual LLM backends (currently simulated)
- Multi-provider model switching in real-time
- Enterprise-grade error handling and retries

#### 1.2 Embeddings & Vector Operations
**Location:** `nodes/embeddings/`

**Providers Supported:**
- OpenAI (text-embedding-ada-002, text-embedding-3-small/large)
- Cohere
- Google Gemini/Vertex
- AWS Bedrock
- Azure OpenAI
- HuggingFace Inference
- Ollama (local embeddings)
- MistralCloud
- Lemonade

**Files:** 11 embedding implementations

**Potential Integration:**
- New service: `apps/ai/embeddings` for vector generation
- Support for semantic search
- Document similarity calculations

#### 1.3 Vector Stores & Databases
**Location:** `nodes/vector_store/`

**Databases Supported:**
- **Pinecone**: Cloud vector DB with insert/load/retrieve
- **Supabase**: PostgreSQL-based with vector extension
- **Redis**: Vector similarity search
- **Qdrant**: High-performance vector search
- **Weaviate**: ML-native vector DB
- **Milvus**: Open-source vector DB
- **MongoDB Atlas**: Vector search in MongoDB
- **PostgreSQL (PGVector)**: PostgreSQL extension
- **Azure AI Search**: Microsoft's vector search
- **Zep**: Memory and vector store
- **In-Memory**: For testing/development

**Files:** 25+ vector store implementations

**Potential Integration:**
- New service: `apps/ai/vector-store` for RAG applications
- Document storage and retrieval
- Semantic search capabilities

#### 1.4 AI Agents
**Location:** `nodes/agents/`

**Agent Types:**
- **Generic Agent**: LangChain ReAct agent with tools
- **OpenAI Assistant**: OpenAI's assistant API integration

**Location:** `features/n8n/packages/@n8n/ai-workflow-builder.ee/`

**Advanced Agent System:**
- **AI Workflow Builder Agent**: Full LangChain agent for building n8n workflows
- **Tool Executor**: Custom tool execution framework
- **Session Manager**: Manages agent conversations
- **Stream Processor**: Handles streaming responses

**Files:** 30+ agent-related files

**Potential Integration:**
- Extend `apps/ai/chat` with real agentic capabilities
- New service: `apps/ai/agents` for autonomous AI agents
- Tool calling and function execution

#### 1.5 Chains & Workflows
**Location:** `nodes/chains/`

**Chain Types:**
- **LLM Chain**: Basic prompt → LLM → response
- **Retrieval QA**: Question answering over documents (RAG)
- **Summarization**: Document summarization
- **Information Extractor**: Structured data extraction
- **Sentiment Analysis**: Sentiment classification
- **Text Classifier**: General text classification

**Files:** 6 chain implementations

**Potential Integration:**
- Pre-built AI workflows for common tasks
- RAG system implementation
- New service: `apps/ai/chains` for workflow templates

#### 1.6 Memory Systems
**Location:** `nodes/memory/`

**Memory Types:**
- **Buffer Window**: Last N messages
- **Chat Retriever**: RAG-based memory
- **MongoDB Chat**: Persistent chat history
- **PostgreSQL Chat**: SQL-based memory
- **Redis Chat**: Fast cache-based memory
- **Motorhead**: Managed memory service
- **Xata**: Serverless database memory
- **Zep**: Long-term memory
- **Memory Manager**: Orchestrates multiple memories

**Files:** 9 memory implementations

**Potential Integration:**
- Extend `apps/ai/chat` with persistent conversation history
- Multi-session memory management
- Long-term context retention

#### 1.7 Document Processing
**Location:** `nodes/document_loaders/`, `nodes/text_splitters/`

**Document Loaders:**
- **Binary Input**: PDFs, Word docs, etc.
- **JSON Input**: JSON data as documents
- **GitHub Loader**: Load from GitHub repos
- **Default Data Loader**: Generic data loading

**Text Splitters:**
- **Character Text Splitter**: Split by character count
- **Recursive Character Splitter**: Smart splitting with recursion
- **Token Splitter**: Split by token count (for LLMs)

**Files:** 7 document processing nodes

**Potential Integration:**
- New service: `apps/ai/documents` for document processing
- RAG system prerequisites
- Smart document chunking

#### 1.8 Tools & Integrations
**Location:** `nodes/tools/`

**Tool Types:**
- **Calculator**: Math operations
- **Code**: Execute code (JavaScript/Python)
- **HTTP Request**: API calls as tools
- **SearXng**: Privacy-focused search
- **SerpApi**: Google search API
- **Think**: Chain-of-thought reasoning
- **Vector Store**: Search vector databases
- **Wikipedia**: Wikipedia lookup
- **Wolfram Alpha**: Computational knowledge
- **Workflow**: Call other n8n workflows as tools

**Files:** 10+ tool implementations

**Potential Integration:**
- Tool library for AI agents
- Extend `apps/ai/chat` with tool calling
- Function calling infrastructure

#### 1.9 MCP (Model Context Protocol)
**Location:** `nodes/mcp/`

**MCP Components:**
- **MCP Client**: Connect to MCP servers
- **MCP Client Tool**: Use MCP as LangChain tool
- **MCP Trigger**: Trigger workflows from MCP events

**Files:** 6+ MCP-related files

**Potential Integration:**
- New service: `apps/ai/mcp` for Model Context Protocol
- Tool discovery and execution
- Integration with external AI systems

#### 1.10 Output Parsers
**Location:** `nodes/output_parser/`

**Parser Types:**
- **Structured Output**: Parse into structured format
- **Autofix**: Automatic fixing of malformed output
- **Item List**: Parse lists of items

**Files:** 3 parser implementations

**Potential Integration:**
- Reliable structured output from LLMs
- Data validation and correction
- Integration with `apps/ai/chat` for structured responses

#### 1.11 Guardrails
**Location:** `nodes/Guardrails/`

**Description:** Safety and validation for AI outputs

**Files:** 10+ guardrail files (v1, v2, actions, tests)

**Potential Integration:**
- New service: `apps/ai/guardrails` for AI safety
- Content filtering
- Output validation

#### 1.12 Retrievers
**Location:** `nodes/retrievers/`

**Retriever Types:**
- **Vector Store Retriever**: Search vector stores
- **Contextual Compression**: Compress retrieved context
- **Multi-Query**: Generate multiple queries for better retrieval
- **Workflow Retriever**: Use workflows as retrievers

**Files:** 4 retriever implementations

**Potential Integration:**
- RAG system components
- Improved search relevance

---

## 2. Firecrawl - LLM Content Extraction

### Location
`features/firecrawl/apps/api/src/`

### Description
AI-powered web scraping with LLM-based content extraction and transformation.

### AI Capabilities

#### 2.1 LLM Extract System
**Location:** `scraper/scrapeURL/transformers/llmExtract.ts`, `lib/extract/fire-0/llmExtract-f0.ts`

**Description:**
- Schema-based data extraction using LLMs
- Uses Vercel AI SDK for model interactions
- Supports multiple LLM providers
- Structured output generation with Zod schemas

**Models Supported:**
- All models in firecrawl's model-prices.ts (100+ models)
- Dynamic model selection
- Fallback strategies

**Files:** 
- `llmExtract.ts` - Main extraction logic
- `llmExtract-f0.ts` - Fire-0 version
- `llmExtract.test.ts` - Tests

**Potential Integration:**
- New service: `apps/ai/extraction` for structured data extraction
- Web scraping with AI
- Document understanding

#### 2.2 Agent-Based Scraping
**Location:** `scraper/scrapeURL/transformers/agent.ts`

**Description:**
- Autonomous scraping agent
- Dynamic decision-making for data extraction
- Multi-step scraping workflows

**Potential Integration:**
- Extend `apps/ai/agents` with scraping capabilities
- Autonomous data collection

#### 2.3 Smart Scrape
**Location:** `scraper/scrapeURL/lib/extractSmartScrape.ts`

**Description:**
- Intelligent content extraction
- Automatic schema inference
- Context-aware data extraction

**Potential Integration:**
- Auto-extraction without manual schema definition
- Smart content understanding

#### 2.4 LLM.txt Generation
**Location:** `controllers/v1/generate-llmstxt.ts`, `lib/generate-llmstxt/`

**Description:**
- Generate LLM-readable website summaries
- Optimized content for AI consumption
- Structured site information

**Files:**
- `generate-llmstxt-service.ts`
- `generate-llmstxt-redis.ts` (caching)
- `generate-llmstxt-supabase.ts` (storage)

**Potential Integration:**
- New feature for `apps/ai/extraction`
- Website summarization for LLMs

---

## 3. Goose - AI Agent Runtime

### Location
`features/goose/crates/goose/src/`

### Description
Rust-based AI agent system with sophisticated prompt management, tool execution, and multi-agent orchestration.

### AI Capabilities

#### 3.1 Agent System
**Location:** `agents/`

**Components:**
- **agent.rs**: Main agent implementation
- **subagent_handler.rs**: Sub-agent orchestration
- **prompt_manager.rs**: Dynamic prompt construction
- **router_tool_selector.rs**: Intelligent tool selection
- **extension.rs**: Agent extension system
- **mcp_client.rs**: Model Context Protocol client

**Files:** 15+ agent implementation files

**Potential Integration:**
- New service: `apps/ai/agents` for production agent runtime
- Multi-agent workflows
- Autonomous task execution

#### 3.2 Prompt Management
**Location:** `prompts/`, `prompt_template.rs`

**Description:**
- Dynamic prompt templates
- Context-aware prompt construction
- Prompt versioning and management

**Potential Integration:**
- New service: `apps/ai/prompts` for prompt management
- Template library
- A/B testing of prompts

#### 3.3 Tool System
**Location:** `agents/recipe_tools/`

**Components:**
- **dynamic_task_tools.rs**: Runtime tool creation
- **sub_recipe_tools.rs**: Nested tool workflows
- **param_utils**: Parameter handling

**Potential Integration:**
- Tool library for agents
- Dynamic tool generation

#### 3.4 Providers
**Location:** `providers/`

**Description:**
- Multiple LLM provider integrations
- Provider abstraction layer
- Model routing

**Potential Integration:**
- Already integrated via `apps/ai/models`
- Provider failover logic

#### 3.5 Execution Engine
**Location:** `execution/`

**Description:**
- Safe code execution
- Sandboxed environments
- Result validation

**Potential Integration:**
- Code execution for agents
- Sandbox for untrusted code

#### 3.6 Context Management
**Location:** `context_mgmt/`

**Description:**
- Context window optimization
- Intelligent context pruning
- Memory management

**Potential Integration:**
- Improve `apps/ai/chat` context handling
- Long conversation support

#### 3.7 Token Counter
**Location:** `token_counter.rs`

**Description:**
- Accurate token counting
- Model-specific tokenization
- Cost estimation

**Potential Integration:**
- Already integrated in `apps/ai/analytics`
- Enhanced accuracy

#### 3.8 Recipes System
**Location:** `recipe/`

**Description:**
- Reusable agent workflows
- Task templates
- Parameterized agents

**Potential Integration:**
- New service: `apps/ai/recipes` for workflow templates
- Pre-built agent tasks

---

## 4. Dispatch - AI Service Layer (NEW DISCOVERY)

### Location
`features/dispatch/src/dispatch/ai/`

### Description
Python-based AI service layer for incident management with OpenAI integration. This wasn't previously analyzed.

### AI Capabilities

#### 4.1 AI Service
**Location:** `service.py`

**Features:**
- **Token Management**: Accurate token counting with tiktoken
- **Model Selection**: Support for GPT-4o, Claude 3.5/3.7 Sonnet
- **Prompt Templates**: Structured prompts for various tasks
- **Tag Recommendations**: AI-powered tag suggestion
- **Incident Summarization**: Auto-generate incident summaries
- **Read-in Summaries**: Briefings for on-call engineers
- **Signal Analysis**: Analyze security signals
- **Tactical Reports**: Generate incident reports

**Code Size:** 30KB+ of AI logic

**Potential Integration:**
- New service: `apps/ai/incidents` for incident management AI
- Template library for specialized prompts
- Production-tested prompt engineering

#### 4.2 OpenAI Plugin
**Location:** `plugins/dispatch_openai/plugin.py`

**Features:**
- **Structured Output**: Parse responses into Pydantic models
- **Chat Completion**: Standard chat interface
- **Error Handling**: Production-grade error handling
- **Metrics**: Counter and timer decorators

**Potential Integration:**
- Plugin architecture for `apps/ai/chat`
- Structured output parsing
- Metrics collection

#### 4.3 Prompt Management
**Location:** `prompt/service.py`, `prompt/models.py`, `prompt/views.py`

**Features:**
- Database-backed prompt storage
- Versioning
- Prompt templates by type
- API for prompt CRUD

**Potential Integration:**
- New service: `apps/ai/prompts` for enterprise prompt management
- Version control for prompts
- API for prompt access

#### 4.4 AI Models & Enums
**Location:** `models.py`, `enums.py`

**Features:**
- Data models for AI responses
- Type safety with Pydantic
- Enums for AI event types

**Potential Integration:**
- Type definitions for AI services
- Event tracking

---

## 5. Additional AI Components

### 5.1 LangSmith Integration (n8n)
**Location:** `features/n8n/packages/@n8n/ai-workflow-builder.ee/evaluations/langsmith/`

**Description:**
- LangSmith tracing and evaluation
- Workflow quality assessment
- Performance monitoring

**Files:**
- `runner.ts` - LangSmith runner
- `evaluator.ts` - Evaluation logic
- `pairwise-runner.ts` - A/B testing

**Potential Integration:**
- New service: `apps/ai/evaluation` for AI quality assessment
- A/B testing infrastructure
- Performance monitoring

### 5.2 Evaluation Chains (n8n)
**Location:** `features/n8n/packages/@n8n/ai-workflow-builder.ee/evaluations/chains/`

**Evaluators:**
- **Functionality**: Does it work correctly?
- **Maintainability**: Is it maintainable?
- **Efficiency**: Is it performant?
- **Best Practices**: Follows guidelines?
- **Data Flow**: Proper data handling?
- **Connections**: Correct node connections?
- **Expressions**: Valid expressions?
- **Node Configuration**: Proper config?

**Files:** 10+ evaluation chain files

**Potential Integration:**
- AI quality assurance system
- Automated testing for AI outputs

### 5.3 Reference Workflows (n8n)
**Location:** `features/n8n/packages/@n8n/ai-workflow-builder.ee/evaluations/reference-workflows/`

**Example Workflows:**
- Email summary automation
- Lead qualification
- RAG assistant
- Daily weather report
- Multi-agent research
- AI news digest
- YouTube auto-chapters
- Invoice pipeline

**Potential Integration:**
- Template library for `apps/ai/workflows`
- Best practices examples

---

## Integration Recommendations

### Priority 1: High-Value, Low-Effort

1. **LangChain LLM Nodes** → `apps/ai/chat`
   - Replace simulated responses with real LLMs
   - Multi-provider support
   - **Effort:** Medium | **Value:** High

2. **Dispatch Prompt Management** → New `apps/ai/prompts`
   - Database-backed prompts
   - Versioning
   - **Effort:** Low | **Value:** Medium

3. **Token Counting** → Enhance `apps/ai/analytics`
   - More accurate than current implementation
   - Model-specific tokenization
   - **Effort:** Low | **Value:** Medium

### Priority 2: High-Value, Medium-Effort

4. **Vector Stores** → New `apps/ai/vector-store`
   - RAG system foundation
   - Multiple database options
   - **Effort:** High | **Value:** High

5. **LLM Extract** → New `apps/ai/extraction`
   - Structured data extraction
   - Web scraping with AI
   - **Effort:** Medium | **Value:** High

6. **Memory Systems** → Enhance `apps/ai/chat`
   - Persistent conversations
   - Long-term context
   - **Effort:** Medium | **Value:** High

### Priority 3: Advanced Capabilities

7. **AI Agents** → New `apps/ai/agents`
   - Autonomous task execution
   - Tool calling
   - **Effort:** Very High | **Value:** Very High

8. **Embeddings** → New `apps/ai/embeddings`
   - Vector generation service
   - Semantic search
   - **Effort:** Medium | **Value:** Medium

9. **Evaluation System** → New `apps/ai/evaluation`
   - Quality assessment
   - A/B testing
   - **Effort:** High | **Value:** Medium

10. **MCP Integration** → New `apps/ai/mcp`
    - Model Context Protocol
    - Tool discovery
    - **Effort:** High | **Value:** Medium

---

## Detailed File Inventory

### n8n LangChain Nodes
```
Total Files: 200+
Categories: 14 (LLMs, Embeddings, Vector Stores, Agents, Chains, Memory, etc.)
Lines of Code: ~50,000+
Language: TypeScript
```

### Firecrawl AI
```
Total Files: 15+
Key Components: LLM Extract, Agent Scraper, Smart Scrape
Lines of Code: ~5,000+
Language: TypeScript
```

### Goose Agents
```
Total Files: 50+
Key Components: Agent Runtime, Tools, Prompts, Execution
Lines of Code: ~15,000+
Language: Rust
```

### Dispatch AI
```
Total Files: 10+
Key Components: AI Service, OpenAI Plugin, Prompt Management
Lines of Code: ~3,000+
Language: Python
```

---

## Technology Stack Summary

### LangChain Ecosystem
- **LangChain JS**: Full implementation in n8n
- **LangGraph**: Multi-agent workflows
- **LangSmith**: Tracing and evaluation

### LLM Providers
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude)
- Google (Gemini, Vertex)
- AWS Bedrock
- Azure OpenAI
- Cohere
- Ollama (local)
- Groq
- DeepSeek
- Mistral
- HuggingFace
- And 10+ more

### Vector Databases
- Pinecone
- Supabase
- Redis
- Qdrant
- Weaviate
- Milvus
- MongoDB Atlas
- PostgreSQL (PGVector)
- Azure AI Search
- Zep

### Frameworks
- LangChain (TypeScript)
- Vercel AI SDK
- OpenAI SDK
- Custom Rust agents

---

## Migration Complexity Assessment

### Low Complexity (1-2 weeks)
- Prompt management (Dispatch)
- Token counting improvements
- LLM provider integration (basic)

### Medium Complexity (3-4 weeks)
- Memory systems
- Document processing
- LLM extract
- Output parsers

### High Complexity (1-2 months)
- Vector stores
- RAG system
- AI agents
- Evaluation system

### Very High Complexity (2-3 months)
- Full LangChain integration
- Multi-agent orchestration
- MCP protocol
- Complete workflow system

---

## Recommended Next Steps

1. **Review this report** and prioritize which capabilities to migrate
2. **Start with Priority 1** items for quick wins
3. **Create proof-of-concept** for one high-value item (e.g., vector store)
4. **Incremental integration** - don't try to migrate everything at once
5. **Maintain feature parity** with source implementations
6. **Document APIs** as you build
7. **Test thoroughly** - AI systems are complex

---

## Conclusion

The features directory contains a **treasure trove of production-ready AI code**:

- **200+ LangChain nodes** (n8n)
- **15+ AI extraction tools** (Firecrawl)
- **50+ agent components** (Goose)
- **10+ AI service components** (Dispatch - new discovery)

**Total Lines of AI Code: ~70,000+**

This represents **years of development effort** and **battle-tested implementations**. Integrating even a fraction of this code into `apps/ai` would create a comprehensive AI platform.

The current `apps/ai/models`, `apps/ai/chat`, and `apps/ai/analytics` services are just the beginning. The code discovered in this report could support 10+ additional AI services covering embeddings, vector stores, agents, prompts, extraction, evaluation, and more.

---

**Report Generated:** 2025-12-03  
**Next Action:** Review and select specific components for integration based on business priorities
