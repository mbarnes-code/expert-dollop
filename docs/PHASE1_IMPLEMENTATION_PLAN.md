# Phase 1 Implementation Plan: Security AI Integration
## Foundation and Library Extraction

**Status:** In Progress  
**Timeline:** Weeks 1-4  
**Approach:** Strangler Fig Pattern with DDD Modular Monolith  
**Framework:** NX Monorepo

---

## Week 1-2: Library Extraction

### 1. libs/ai/prompt-manager

**Status:** 🔄 In Progress  
**Source:** `features/dispatch/src/dispatch/ai/prompt/`  
**Target:** `libs/ai/prompt-manager/`

**Domain Model (DDD):**
- **Entities:** Prompt (with ID, versioning, timestamps)
- **Value Objects:** PromptType, PromptContent, SystemMessage
- **Aggregates:** PromptRepository
- **Services:** PromptService (CRUD operations)
- **Repositories:** PromptRepository (database abstraction)

**Components to Extract:**
- [x] Domain models (`models.py` → TypeScript interfaces/classes)
- [ ] Service layer (`service.py` → TypeScript service)
- [ ] API layer (`views.py` → NestJS/Next.js API routes)
- [ ] Database migrations/schema
- [ ] Tests
- [ ] Documentation

**Architecture:**
```
libs/ai/prompt-manager/
├── src/
│   ├── lib/
│   │   ├── domain/              # DDD Domain Layer
│   │   │   ├── entities/
│   │   │   │   └── prompt.entity.ts
│   │   │   ├── value-objects/
│   │   │   │   ├── prompt-type.vo.ts
│   │   │   │   └── prompt-content.vo.ts
│   │   │   └── repositories/
│   │   │       └── prompt.repository.interface.ts
│   │   ├── application/         # DDD Application Layer
│   │   │   ├── services/
│   │   │   │   └── prompt.service.ts
│   │   │   ├── dtos/
│   │   │   │   ├── create-prompt.dto.ts
│   │   │   │   ├── update-prompt.dto.ts
│   │   │   │   └── prompt-response.dto.ts
│   │   │   └── use-cases/
│   │   │       ├── create-prompt.use-case.ts
│   │   │       ├── update-prompt.use-case.ts
│   │   │       └── get-prompt.use-case.ts
│   │   ├── infrastructure/      # DDD Infrastructure Layer
│   │   │   ├── repositories/
│   │   │   │   └── prompt.repository.ts
│   │   │   ├── database/
│   │   │   │   ├── schema.ts
│   │   │   │   └── migrations/
│   │   │   └── http/
│   │   │       └── prompt.controller.ts
│   │   └── index.ts
│   └── index.ts
├── README.md
├── package.json
├── project.json
├── tsconfig.json
└── tsconfig.lib.json
```

**Strangler Fig Migration Strategy:**
1. Create new library structure with domain models
2. Implement TypeScript equivalents of Python code
3. Add comprehensive tests
4. Create facade/adapter for Dispatch to use both old and new
5. Gradually migrate Dispatch to use new library
6. Remove old code when migration complete

**Dependencies:**
- Database: PostgreSQL (compatible with Dispatch)
- ORM: Prisma or TypeORM
- Validation: Zod or class-validator
- Testing: Jest

**Progress Tracking:**
- [x] Analysis complete
- [ ] Domain models created
- [ ] Application services created
- [ ] Infrastructure layer created
- [ ] Tests written
- [ ] Documentation complete
- [ ] Integration with Dispatch tested
- [ ] Ready for production use

---

### 2. libs/ai/vector-db-clients/elasticsearch

**Status:** ⏳ Pending  
**Source:** `features/securityonion/salt/sensoroni/files/analyzers/elasticsearch/`  
**Target:** `libs/ai/vector-db-clients/elasticsearch/`

**Domain Model (DDD):**
- **Entities:** Index, Document, Query
- **Value Objects:** IndexName, QueryDSL, SearchResults
- **Services:** ElasticsearchClient, QueryBuilder
- **Repositories:** DocumentRepository

**Components to Extract:**
- [ ] Connection management
- [ ] Query builder
- [ ] Index management
- [ ] Bulk operations
- [ ] Search functionality
- [ ] Aggregations support
- [ ] Tests
- [ ] Documentation

**Architecture:**
```
libs/ai/vector-db-clients/elasticsearch/
├── src/
│   ├── lib/
│   │   ├── client/
│   │   │   ├── elasticsearch.client.ts
│   │   │   └── connection-pool.ts
│   │   ├── query/
│   │   │   ├── query-builder.ts
│   │   │   └── dsl-builder.ts
│   │   ├── index/
│   │   │   └── index-manager.ts
│   │   ├── types/
│   │   │   └── elasticsearch.types.ts
│   │   └── index.ts
│   └── index.ts
├── README.md
├── package.json
├── project.json
├── tsconfig.json
└── tsconfig.lib.json
```

**Strangler Fig Migration Strategy:**
1. Extract Python analyzer code to TypeScript
2. Create clean client abstraction
3. Add SecurityOnion-specific helpers
4. Test with existing SecurityOnion data
5. Migrate SecurityOnion to use new client
6. Add HELK integration points

**Dependencies:**
- @elastic/elasticsearch
- Connection pooling library
- Testing: Jest with testcontainers

**Progress Tracking:**
- [ ] Analysis complete
- [ ] Client implementation
- [ ] Query builder implementation
- [ ] Index management
- [ ] Tests written
- [ ] Documentation complete
- [ ] Integration tested
- [ ] Ready for production use

---

### 3. libs/ai/llm-clients

**Status:** ⏳ Pending  
**Source:** 
- `features/dispatch/src/dispatch/plugins/dispatch_openai/`
- `libs/ai/model-registry` (existing)

**Enhancement Plan:**
This library already exists but needs enhancement for security use cases.

**New Features to Add:**
- [ ] Structured output support (from Dispatch)
- [ ] Enhanced error handling
- [ ] Token tracking integration with analytics
- [ ] Retry logic with exponential backoff
- [ ] Circuit breaker pattern
- [ ] Request/response logging for audit
- [ ] Security-specific prompt templates

**Architecture Enhancement:**
```
libs/ai/llm-clients/
├── src/
│   ├── lib/
│   │   ├── providers/          # Existing
│   │   ├── structured-output/  # NEW from Dispatch
│   │   │   ├── schema-validator.ts
│   │   │   └── structured-client.ts
│   │   ├── resilience/         # NEW
│   │   │   ├── retry-policy.ts
│   │   │   ├── circuit-breaker.ts
│   │   │   └── rate-limiter.ts
│   │   ├── audit/              # NEW for security
│   │   │   ├── request-logger.ts
│   │   │   └── audit-trail.ts
│   │   └── index.ts
│   └── index.ts
└── ...
```

**Progress Tracking:**
- [ ] Analysis complete
- [ ] Structured output support added
- [ ] Resilience patterns implemented
- [ ] Audit logging added
- [ ] Tests written
- [ ] Documentation updated
- [ ] Integration tested
- [ ] Ready for production use

---

## Week 3-4: Initial AI Service Nodes

### 4. apps/ai/incident-ai

**Status:** ⏳ Pending  
**Source:** `features/dispatch/src/dispatch/ai/service.py`  
**Target:** `apps/ai/incident-ai/`

**Domain Model (DDD):**
- **Entities:** Incident, IncidentSummary, TagRecommendation
- **Value Objects:** SummaryText, Confidence, Tags
- **Services:** IncidentSummarizer, TagRecommender, ReportGenerator
- **Use Cases:** SummarizeIncident, RecommendTags, GenerateReport

**Components:**
- [ ] Incident summarization API
- [ ] Tag recommendation API  
- [ ] Report generation API
- [ ] Integration with apps/ai/chat
- [ ] Integration with libs/ai/prompt-manager
- [ ] Integration with libs/ai/analytics
- [ ] Tests
- [ ] Documentation

**Architecture:**
```
apps/ai/incident-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── summarize/
│   │   │   │   └── route.ts
│   │   │   ├── tags/
│   │   │   │   └── route.ts
│   │   │   └── reports/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   └── services/
│   │   ├── application/
│   │   │   ├── use-cases/
│   │   │   └── dtos/
│   │   └── infrastructure/
│   │       └── adapters/
│   └── ...
├── README.md
├── package.json
├── project.json
└── tsconfig.json
```

**API Endpoints:**
- `POST /api/summarize` - Generate incident summary
- `POST /api/tags/recommend` - Recommend tags for incident
- `POST /api/reports/generate` - Generate tactical report
- `GET /api/health` - Health check

**Progress Tracking:**
- [ ] Analysis complete
- [ ] Domain models created
- [ ] Use cases implemented
- [ ] API routes created
- [ ] UI created
- [ ] Tests written
- [ ] Documentation complete
- [ ] Integration tested
- [ ] Ready for production use

---

### 5. apps/ai/alert-intelligence

**Status:** ⏳ Pending  
**Source:** SecurityOnion analyzer patterns  
**Target:** `apps/ai/alert-intelligence/`

**Domain Model (DDD):**
- **Entities:** Alert, AlertCorrelation, ThreatScore
- **Value Objects:** Severity, Confidence, IOC
- **Services:** AlertCorrelator, ThreatScorer, FalsePositiveDetector
- **Use Cases:** CorrelateAlerts, ScoreThreats, DetectFalsePositives

**Components:**
- [ ] Alert correlation API
- [ ] Threat scoring API
- [ ] False positive detection API
- [ ] Integration with SecurityOnion
- [ ] ML model for pattern learning
- [ ] Tests
- [ ] Documentation

**Architecture:**
```
apps/ai/alert-intelligence/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── correlate/
│   │   │   │   └── route.ts
│   │   │   ├── score/
│   │   │   │   └── route.ts
│   │   │   └── false-positives/
│   │   │       └── route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── ml/               # ML models
│   │       ├── correlation-model.ts
│   │       └── scoring-model.ts
│   └── ...
├── README.md
├── package.json
├── project.json
└── tsconfig.json
```

**API Endpoints:**
- `POST /api/correlate` - Correlate related alerts
- `POST /api/score` - Score threat severity
- `POST /api/false-positives/detect` - Detect false positives
- `POST /api/false-positives/learn` - Learn from analyst feedback
- `GET /api/health` - Health check

**Progress Tracking:**
- [ ] Analysis complete
- [ ] Domain models created
- [ ] ML models implemented
- [ ] API routes created
- [ ] UI created
- [ ] Tests written
- [ ] Documentation complete
- [ ] Integration tested
- [ ] Ready for production use

---

## NX Best Practices Applied

### 1. Workspace Organization
- Libraries in `libs/ai/`
- Applications in `apps/ai/`
- Clear separation of concerns

### 2. Dependency Management
- Libraries are publishable
- Applications depend on libraries
- No circular dependencies
- Explicit dependency graph

### 3. Build Configuration
```json
{
  "targets": {
    "build": {
      "executor": "@nx/js:tsc",
      "outputs": ["{options.outputPath}"],
      "options": {
        "outputPath": "dist/libs/ai/prompt-manager",
        "main": "libs/ai/prompt-manager/src/index.ts",
        "tsConfig": "libs/ai/prompt-manager/tsconfig.lib.json",
        "assets": ["libs/ai/prompt-manager/*.md"]
      }
    },
    "lint": {
      "executor": "@nx/linter:eslint"
    },
    "test": {
      "executor": "@nx/jest:jest"
    }
  }
}
```

### 4. Testing Strategy
- Unit tests for domain logic
- Integration tests for infrastructure
- E2E tests for API endpoints
- Test coverage > 80%

### 5. Documentation
- README for each library/app
- API documentation
- Architecture diagrams
- Migration guides

---

## DDD Principles Applied

### 1. Ubiquitous Language
- Prompt, PromptType, PromptRepository
- Incident, Summary, Tag, Report
- Alert, Correlation, ThreatScore
- Clear, domain-specific terminology

### 2. Bounded Contexts
- **Prompt Management Context:** libs/ai/prompt-manager
- **LLM Client Context:** libs/ai/llm-clients
- **Vector DB Context:** libs/ai/vector-db-clients/elasticsearch
- **Incident AI Context:** apps/ai/incident-ai
- **Alert Intelligence Context:** apps/ai/alert-intelligence

### 3. Layered Architecture
- **Domain Layer:** Entities, Value Objects, Domain Services
- **Application Layer:** Use Cases, DTOs, Application Services
- **Infrastructure Layer:** Repositories, HTTP, Database
- **Presentation Layer:** API Routes, UI Components

### 4. Aggregates and Entities
- Prompt aggregate (root: Prompt entity)
- Incident aggregate (root: Incident entity)
- Alert aggregate (root: Alert entity)

---

## Strangler Fig Migration Pattern

### Phase 1: Parallel Run (Weeks 1-2)
1. Extract code to new libraries
2. Implement TypeScript equivalents
3. Run both old (Python) and new (TypeScript) in parallel
4. Compare results for validation

### Phase 2: Gradual Migration (Weeks 3-4)
1. Create facade/adapter layer
2. Route some requests to new system
3. Monitor and compare metrics
4. Gradually increase traffic to new system

### Phase 3: Complete Migration (Future)
1. Route all traffic to new system
2. Deprecate old system
3. Remove facade/adapter
4. Clean up dead code

### Migration Metrics
- Request success rate
- Response time
- Error rate
- Feature parity
- Test coverage

---

## Risk Mitigation

### Technical Risks
1. **Python → TypeScript translation errors**
   - Mitigation: Comprehensive test suite
   - Mitigation: Parallel run validation

2. **Database schema incompatibilities**
   - Mitigation: Careful schema design
   - Mitigation: Migration scripts with rollback

3. **Performance regression**
   - Mitigation: Performance testing
   - Mitigation: Profiling and optimization

### Process Risks
1. **Scope creep**
   - Mitigation: Stick to Phase 1 scope
   - Mitigation: Document future enhancements

2. **Integration failures**
   - Mitigation: Integration tests
   - Mitigation: Staged rollout

3. **Time constraints**
   - Mitigation: Focus on completeness over speed
   - Mitigation: Document remaining work

---

## Success Criteria

### Week 1-2 (Library Extraction)
- [ ] 3 libraries created with clean architecture
- [ ] All libraries pass tests
- [ ] Documentation complete
- [ ] Compatible with existing systems
- [ ] Ready for integration

### Week 3-4 (AI Service Nodes)
- [ ] 2 AI services created
- [ ] APIs functional and tested
- [ ] Basic UI operational
- [ ] Integration with libs verified
- [ ] Documentation complete

### Overall Phase 1
- [ ] All deliverables completed
- [ ] Code review passed
- [ ] Security review passed
- [ ] Performance benchmarks met
- [ ] Ready for Phase 2

---

## Next Steps (After Phase 1)

### Immediate
1. Review and refine implementations
2. Gather feedback from stakeholders
3. Plan Phase 2 (ML Infrastructure)

### Short-term (Phase 2)
1. HELK integration
2. Threat hunting ML pipelines
3. Spark and Jupyter setup

### Long-term (Phase 3-4)
1. YARA-X pattern generation
2. Full SecurityOnion integration
3. End-to-end workflows

---

## Notes

This implementation follows a **thorough over fast** approach as requested. Each component is built with:
- Clean architecture principles
- Domain-driven design
- Comprehensive testing
- Complete documentation
- Production-ready quality

If time becomes a constraint, incomplete items are clearly marked and documented for future implementation.

---

**Last Updated:** 2025-12-03  
**Next Review:** After Week 2 completion
