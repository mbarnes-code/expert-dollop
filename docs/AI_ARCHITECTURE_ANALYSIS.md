# AI Services Architecture Analysis

**Date:** 2025-12-03  
**Purpose:** Evaluate architecture options for AI capabilities in the monorepo

## Context

The monorepo currently has:
- **Existing AI services** in `apps/ai/`: n8n, firecrawl, goose (full applications)
- **New consolidated services**: models, chat, analytics (extracted capabilities)
- **Newly discovered AI**: Dispatch (incident management), SecurityOnion (threat detection)
- **Future integration**: HELK (Hunting ELK with ML capabilities)

## The Architectural Question

**Should the AI capabilities be:**
1. **Broken down further** into granular shared services that the whole monorepo can use?
2. **Kept in their current services** and consumed by other services as-is?

---

## Current State Assessment

### Option 1: Current Structure (Monolithic Services)

```
apps/ai/
├── n8n/              # Full n8n application (200+ LangChain nodes)
├── firecrawl-api/    # Full Firecrawl service (AI web scraping)
├── goose/            # Full Goose agent runtime
├── models/           # Extracted: Model registry UI/API
├── chat/             # Extracted: Unified chat interface
└── analytics/        # Extracted: Usage tracking
```

**Pros:**
- ✅ Services are self-contained and independently deployable
- ✅ No breaking changes to existing applications
- ✅ Each service owns its complete feature set
- ✅ Clear boundaries and ownership

**Cons:**
- ❌ Code duplication across services (already identified)
- ❌ Other monorepo services can't easily use AI capabilities
- ❌ No shared AI infrastructure
- ❌ Difficult to compose AI features across services

### Option 2: Granular Shared Services (SOA Architecture)

```
apps/ai/
├── n8n/              # Full n8n application (uses libs)
├── firecrawl-api/    # Full Firecrawl service (uses libs)
├── goose/            # Full Goose agent runtime (uses libs)
├── models/           # Model registry UI/API
├── chat/             # Chat interface UI/API
├── analytics/        # Analytics dashboard UI/API
├── vector-store/     # NEW: Vector DB service
├── embeddings/       # NEW: Embedding generation service
├── extraction/       # NEW: LLM extraction service
├── agents/           # NEW: Agent orchestration service
├── prompts/          # NEW: Prompt management service
└── evaluation/       # NEW: AI quality assessment service

libs/ai/
├── model-registry/         # Already created
├── error-handling/         # Already created
├── next-app-base/         # Already created
├── llm-clients/           # NEW: LLM provider abstractions
├── vector-db-clients/     # NEW: Vector DB clients
├── langchain-core/        # NEW: LangChain utilities
├── prompt-templates/      # NEW: Shared prompt library
├── token-counter/         # NEW: Token counting utilities
└── ai-middleware/         # NEW: Common AI middleware
```

**Pros:**
- ✅ Granular, reusable AI capabilities
- ✅ Any monorepo service can use AI features
- ✅ Single source of truth for each capability
- ✅ Easier to test individual components
- ✅ Better code reuse across the monorepo

**Cons:**
- ❌ More complex architecture
- ❌ More services to maintain
- ❌ Potential performance overhead (network calls)
- ❌ Requires significant refactoring of existing services

---

## Recommendation: Hybrid Approach

**Combine both strategies for maximum flexibility:**

### 1. Keep Full Applications As-Is
```
apps/ai/
├── n8n/              # Keep as full application
├── firecrawl-api/    # Keep as full application  
├── goose/            # Keep as full application
```

**Rationale:**
- These are complete, production-ready applications
- Users may want the full n8n/Firecrawl/Goose experience
- Breaking them down would lose cohesion
- They can consume shared libraries without refactoring

### 2. Create Shared Library Layer
```
libs/ai/
├── model-registry/         ✅ Already exists
├── error-handling/         ✅ Already exists
├── next-app-base/         ✅ Already exists
├── llm-clients/           🆕 LLM provider abstractions
├── vector-db-clients/     🆕 Vector DB clients
├── prompt-manager/        🆕 Prompt storage & versioning
├── token-utils/           🆕 Token counting & cost calc
├── langchain-utils/       🆕 LangChain helpers
└── embeddings-client/     🆕 Embedding generation
```

**Rationale:**
- Libraries are consumed by both apps and services
- Zero deployment overhead (just imports)
- Easy to test and version
- Can be used by any service in the monorepo

### 3. Create Focused Microservices
```
apps/ai/
├── models/           ✅ Model registry UI/API (exists)
├── chat/             ✅ Chat interface (exists)
├── analytics/        ✅ Usage tracking (exists)
├── vector-store/     🆕 Vector operations as a service
├── extraction/       🆕 LLM extraction as a service
├── prompts/          🆕 Prompt management service
└── agents/           🆕 Agent orchestration service
```

**Rationale:**
- These require state management (databases, caching)
- Better as services than libraries
- Can be independently scaled
- Provide REST APIs for easy consumption

---

## Integration with Newly Discovered AI

### Dispatch AI (Incident Management)

**Current Location:** `features/dispatch/src/dispatch/ai/`

**Capabilities:**
- Incident summarization
- Tag recommendations
- Tactical report generation
- Prompt management system

**Recommendation:**
```
Option A: Extract to apps/ai/incident-management/
- Create dedicated service for incident AI
- Integrate with SecurityOnion for security incidents
- Use shared libs/ai/prompt-manager

Option B: Extract prompts to libs/ai/prompt-manager/
- Keep Dispatch's AI logic in Dispatch
- Share prompt templates across monorepo
- Add incident-specific prompts
```

**Best Choice:** Option B (extract prompts, keep logic in Dispatch)
- Dispatch-specific AI should stay in Dispatch
- Share the valuable prompt templates
- Less disruption to existing Dispatch service

### SecurityOnion AI (Threat Detection)

**Current Location:** `features/securityonion/salt/sensoroni/files/analyzers/`

**Capabilities:**
- EmailRep analyzer (reputation checking)
- Elasticsearch analyzer (query building)
- Threat intelligence integrations

**Recommendation:**
```
Option A: Create apps/ai/security-analysis/
- Centralize all security AI
- Integrate with HELK when ready
- Build security-specific AI pipelines

Option B: Keep in SecurityOnion, extract common utilities
- Security logic stays with security tools
- Extract reusable components to libs/ai/
```

**Best Choice:** Option B (keep in SecurityOnion)
- These analyzers are tightly coupled to SecurityOnion
- Not general-purpose AI capabilities
- Would complicate the security service to split

### HELK Integration (Future)

**Project:** `features/HELK/` - Hunting ELK with ML capabilities

**Capabilities:**
- Apache Spark for big data analytics
- Jupyter notebooks for data science
- GraphFrames for graph analysis
- Machine learning pipelines
- Elasticsearch-based threat hunting

**Recommendation:**
```
Create: apps/ai/threat-hunting/
- Dedicated service for threat hunting AI
- Integrates HELK's ML capabilities
- Uses libs/ai/vector-db-clients for Elasticsearch
- Jupyter notebooks for interactive analysis
- Connects to SecurityOnion data sources
```

**Implementation Priority:** Medium-High
- HELK provides unique ML capabilities not found elsewhere
- Perfect for analyzing SecurityOnion data
- Natural fit with vector-store service
- Wait until SecurityOnion integration is more mature

---

## Proposed Architecture (Hybrid)

```
┌─────────────────────────────────────────────────────────────┐
│                    Monorepo Services                        │
│  (Any service can import libs/ai/*)                         │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ imports
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Shared AI Libraries                      │
│  libs/ai/                                                   │
│  ├── model-registry/      (model info, pricing)            │
│  ├── llm-clients/         (OpenAI, Anthropic, etc.)        │
│  ├── vector-db-clients/   (Pinecone, Qdrant, etc.)        │
│  ├── prompt-manager/      (templates, versioning)          │
│  ├── token-utils/         (counting, cost calc)            │
│  └── embeddings-client/   (text→vectors)                   │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ uses
                            │
┌─────────────────────────────────────────────────────────────┐
│              AI Microservices (REST APIs)                   │
│  apps/ai/                                                   │
│  ├── models/         (UI + API for model registry)         │
│  ├── chat/           (UI + API for chat)                   │
│  ├── analytics/      (UI + API for usage tracking)         │
│  ├── vector-store/   (NEW: Vector operations)              │
│  ├── extraction/     (NEW: LLM extraction)                 │
│  ├── prompts/        (NEW: Prompt management)              │
│  └── agents/         (NEW: Agent orchestration)            │
└─────────────────────────────────────────────────────────────┘
                            ▲
                            │ uses
                            │
┌─────────────────────────────────────────────────────────────┐
│           Full AI Applications (Self-Contained)             │
│  apps/ai/                                                   │
│  ├── n8n/            (Full n8n - 200+ nodes)               │
│  ├── firecrawl-api/  (Full Firecrawl)                     │
│  ├── goose/          (Full Goose agent runtime)            │
│  └── dispatch/       (Incident management - stays in own)  │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Roadmap

### Phase 1: Library Extraction (Low Risk, High Value)
**Timeline:** 1-2 weeks

1. ✅ `libs/ai/model-registry` - Already done
2. ✅ `libs/ai/error-handling` - Already done
3. ✅ `libs/ai/next-app-base` - Already done
4. 🆕 `libs/ai/prompt-manager` - Extract from Dispatch
5. 🆕 `libs/ai/token-utils` - Extract from Goose
6. 🆕 `libs/ai/llm-clients` - Extract common patterns

**Benefit:** Immediate code reuse, zero deployment complexity

### Phase 2: Focused Services (Medium Risk, High Value)
**Timeline:** 4-6 weeks

1. ✅ `apps/ai/models` - Already done
2. ✅ `apps/ai/chat` - Already done
3. ✅ `apps/ai/analytics` - Already done
4. 🆕 `apps/ai/vector-store` - RAG infrastructure
5. 🆕 `apps/ai/prompts` - Prompt management UI

**Benefit:** Reusable services, independent scaling

### Phase 3: Advanced Capabilities (High Risk, High Value)
**Timeline:** 8-12 weeks

1. 🆕 `apps/ai/extraction` - LLM extraction service
2. 🆕 `apps/ai/agents` - Agent orchestration
3. 🆕 `apps/ai/threat-hunting` - HELK integration
4. 🆕 `apps/ai/embeddings` - Embedding service

**Benefit:** Advanced AI capabilities across monorepo

---

## Decision Matrix

| Capability | Keep in App | Extract to Service | Extract to Library | Recommendation |
|------------|-------------|-------------------|-------------------|----------------|
| n8n LangChain nodes | ✅ | ❌ | Partial | Keep + share libs |
| Firecrawl scraping | ✅ | ❌ | Partial | Keep + share libs |
| Goose agents | ✅ | ❌ | Partial | Keep + share libs |
| Model registry | ❌ | ✅ | ✅ | Both (service + lib) |
| Chat interface | ❌ | ✅ | Partial | Service + lib helpers |
| Analytics | ❌ | ✅ | Partial | Service + lib utils |
| Vector operations | ❌ | ✅ | ✅ | Both (service + lib) |
| LLM extraction | ❌ | ✅ | Partial | Service + lib clients |
| Prompt management | ❌ | ✅ | ✅ | Both (service + lib) |
| Token counting | ❌ | ❌ | ✅ | Library only |
| Embeddings | ❌ | ✅ | ✅ | Both (service + lib) |
| Dispatch incident AI | ✅ | ❌ | Prompts only | Keep in Dispatch |
| SecurityOnion analyzers | ✅ | ❌ | Utils only | Keep in SecurityOnion |
| HELK ML pipelines | ❌ | ✅ | Partial | New threat-hunting service |

---

## Answers to User's Questions

### Q: Should services be broken down further?
**A: Selectively yes, using a hybrid approach:**
- Keep n8n, Firecrawl, Goose as full applications
- Extract reusable components to shared libraries
- Create focused microservices for stateful operations
- Don't break down domain-specific AI (Dispatch, SecurityOnion)

### Q: Can services provide value to monorepo in current form?
**A: Yes, but limited:**
- Current services (models, chat, analytics) provide value as-is
- Full apps (n8n, Firecrawl, Goose) are useful standalone
- However, without shared libraries, code duplication remains
- Other monorepo services can't easily consume AI capabilities

### Q: What about Dispatch and SecurityOnion AI?
**A: Keep domain-specific, share primitives:**
- **Dispatch:** Extract prompt templates to `libs/ai/prompt-manager`, keep incident AI in Dispatch
- **SecurityOnion:** Extract common utilities to libs, keep analyzers in SecurityOnion
- Both can use shared AI libraries (models, LLM clients, etc.)

### Q: How does HELK fit in?
**A: Create dedicated threat-hunting service:**
- HELK provides unique ML capabilities (Spark, Jupyter, GraphFrames)
- Natural integration with SecurityOnion data
- Can leverage shared vector-store service for Elasticsearch
- Medium-high priority after core infrastructure stabilizes

---

## Recommendation Summary

**Adopt the Hybrid Architecture:**

1. **Keep full applications** (n8n, Firecrawl, Goose) as-is
2. **Create shared libraries** for common primitives (prompts, tokens, LLM clients, vector clients)
3. **Build focused microservices** for stateful operations (vector-store, extraction, agents)
4. **Leave domain-specific AI** in their respective services (Dispatch incident AI, SecurityOnion analyzers)
5. **Plan for HELK integration** as a dedicated threat-hunting service

**This approach:**
- ✅ Maximizes code reuse without breaking existing apps
- ✅ Enables monorepo-wide AI consumption
- ✅ Maintains clear boundaries and ownership
- ✅ Scales with the monorepo's needs
- ✅ Minimizes deployment complexity

---

**Next Steps:**
1. Review and approve hybrid architecture approach
2. Prioritize Phase 1 library extraction
3. Plan Phase 2 microservices implementation
4. Define integration points for Dispatch/SecurityOnion
5. Schedule HELK integration planning
