unified-frontend/
├── app/                              # Next.js 15 App Router
│   ├── layout.tsx                    # Root layout with providers
│   ├── page.tsx                      # Landing/dashboard (Server Component)
│   ├── loading.tsx                   # Global loading UI
│   ├── error.tsx                     # Global error boundary
│   ├── not-found.tsx                 # 404 page
│   ├── global.css                    # Global styles
│   │
│   ├── (marketing)/                  # Route group for public pages (no auth)
│   │   ├── layout.tsx                # Marketing layout
│   │   ├── page.tsx                  # Home page
│   │   ├── about/
│   │   │   └── page.tsx
│   │   └── docs/
│   │       └── page.tsx
│   │
│   ├── (domains)/                    # Route group for authenticated domain routes
│   │   ├── layout.tsx                # Domains layout with navigation
│   │   │
│   │   ├── mtg/                      # MTG domain routes
│   │   │   ├── layout.tsx            # MTG domain layout
│   │   │   ├── page.tsx              # MTG dashboard (Server Component)
│   │   │   ├── loading.tsx           # MTG loading state
│   │   │   ├── error.tsx             # MTG error boundary
│   │   │   │
│   │   │   ├── combo/
│   │   │   │   ├── page.tsx          # Combo list (Server Component with RSC)
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx      # Combo detail (Server Component)
│   │   │   │       └── loading.tsx
│   │   │   │
│   │   │   ├── search/
│   │   │   │   └── page.tsx          # Search page (Server Component)
│   │   │   │
│   │   │   └── submit/
│   │   │       └── page.tsx          # Submit combo form
│   │   │
│   │   ├── security/                 # Security domain routes (Nemesis + Ghostwriter)
│   │   │   ├── layout.tsx            # Security layout
│   │   │   ├── page.tsx              # Security dashboard (Client Component)
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   │
│   │   │   ├── files/
│   │   │   │   ├── page.tsx          # File browser (Client Component)
│   │   │   │   ├── upload/
│   │   │   │   │   └── page.tsx      # File upload page
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # File viewer (Client Component)
│   │   │   │
│   │   │   ├── findings/
│   │   │   │   ├── page.tsx          # Findings list (Client Component)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Finding detail
│   │   │   │
│   │   │   ├── yara/
│   │   │   │   ├── page.tsx          # YARA rules manager (Client Component)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # YARA rule editor
│   │   │   │
│   │   │   └── reports/
│   │   │       ├── page.tsx          # Reports list (from Ghostwriter)
│   │   │       ├── new/
│   │   │       │   └── page.tsx      # New report
│   │   │       └── [id]/
│   │   │           └── page.tsx      # Report editor
│   │   │
│   │   ├── finance/                  # Finance domain routes (Actual Budget)
│   │   │   ├── layout.tsx            # Finance layout
│   │   │   ├── page.tsx              # Finance dashboard
│   │   │   │
│   │   │   ├── accounts/
│   │   │   │   ├── page.tsx          # Accounts list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Account detail
│   │   │   │
│   │   │   ├── budget/
│   │   │   │   └── page.tsx          # Budget editor (Client Component)
│   │   │   │
│   │   │   ├── transactions/
│   │   │   │   └── page.tsx          # Transactions table (Client Component)
│   │   │   │
│   │   │   └── reports/
│   │   │       └── page.tsx          # Financial reports
│   │   │
│   │   ├── ai/                       # AI domain routes (Goose, MCP, NVIDIA)
│   │   │   ├── layout.tsx            # AI layout
│   │   │   ├── page.tsx              # AI dashboard
│   │   │   │
│   │   │   ├── chat/
│   │   │   │   ├── page.tsx          # Chat interface (Client Component)
│   │   │   │   └── [sessionId]/
│   │   │   │       └── page.tsx      # Chat session
│   │   │   │
│   │   │   ├── inspector/
│   │   │   │   ├── page.tsx          # MCP Inspector (Client Component)
│   │   │   │   └── [toolId]/
│   │   │   │       └── page.tsx      # Tool detail
│   │   │   │
│   │   │   ├── knowledge-graph/
│   │   │   │   ├── page.tsx          # Knowledge graph viewer (Client Component)
│   │   │   │   └── [graphId]/
│   │   │   │       └── page.tsx      # Graph detail
│   │   │   │
│   │   │   └── multi-agent/
│   │   │       └── page.tsx          # Multi-agent chatbot
│   │   │
│   │   └── ingestion/                # Ingestion domain routes (Firecrawl)
│   │       ├── layout.tsx            # Ingestion layout
│   │       ├── page.tsx              # Ingestion dashboard
│   │       │
│   │       ├── crawl/
│   │       │   ├── page.tsx          # Crawler config
│   │       │   └── [jobId]/
│   │       │       └── page.tsx      # Crawl job status
│   │       │
│   │       └── history/
│   │           └── page.tsx          # Crawl history
│   │
│   ├── api/                          # Next.js API Routes & Route Handlers
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts          # NextAuth.js handler
│   │   │
│   │   ├── domains/                  # Domain-specific API routes
│   │   │   ├── mtg/
│   │   │   │   ├── combos/
│   │   │   │   │   └── route.ts      # Combos API
│   │   │   │   └── search/
│   │   │   │       └── route.ts      # Search API
│   │   │   │
│   │   │   ├── security/
│   │   │   │   ├── files/
│   │   │   │   │   └── route.ts      # Files API
│   │   │   │   └── findings/
│   │   │   │       └── route.ts      # Findings API
│   │   │   │
│   │   │   ├── finance/
│   │   │   │   ├── budget/
│   │   │   │   │   └── route.ts
│   │   │   │   └── transactions/
│   │   │   │       └── route.ts
│   │   │   │
│   │   │   ├── ai/
│   │   │   │   ├── chat/
│   │   │   │   │   └── route.ts      # Chat API (streaming)
│   │   │   │   └── mcp/
│   │   │   │       └── route.ts      # MCP protocol API
│   │   │   │
│   │   │   └── ingestion/
│   │   │       └── crawl/
│   │   │           └── route.ts      # Crawl API
│   │   │
│   │   └── webhooks/                 # Webhook handlers
│   │       └── route.ts
│   │
│   └── actions/                      # Server Actions (organized by domain)
│       ├── mtg/
│       │   ├── combo-actions.ts      # Create, update combo actions
│       │   └── search-actions.ts     # Search actions
│       │
│       ├── security/
│       │   ├── file-actions.ts       # File upload, delete actions
│       │   ├── finding-actions.ts    # Finding triage actions
│       │   └── report-actions.ts     # Report actions
│       │
│       ├── finance/
│       │   ├── budget-actions.ts     # Budget CRUD actions
│       │   └── transaction-actions.ts
│       │
│       ├── ai/
│       │   ├── chat-actions.ts       # Chat message actions
│       │   └── graph-actions.ts      # Knowledge graph actions
│       │
│       └── ingestion/
│           └── crawl-actions.ts      # Crawl start/stop actions
│
├── src/
│   ├── domains/                      # CORE: Domain-specific modules (DDD Bounded Contexts)
│   │   ├── mtg/                      # Magic: The Gathering domain
│   │   │   ├── api/                  # Domain API layer (Repository & Service patterns)
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── combo.repository.ts
│   │   │   │   │   └── card.repository.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── combo.service.ts      # Business logic
│   │   │   │   │   └── search.service.ts     # Search logic
│   │   │   │   ├── clients/
│   │   │   │   │   ├── spellbook.client.ts   # External API client
│   │   │   │   │   └── scryfall.client.ts    # Scryfall API client
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   ├── components/           # Domain UI components
│   │   │   │   ├── ComboCard/
│   │   │   │   │   ├── ComboCard.tsx         # Client Component
│   │   │   │   │   ├── ComboCard.test.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── CardDisplay/
│   │   │   │   │   ├── CardDisplay.tsx       # Server Component
│   │   │   │   │   ├── CardDisplayClient.tsx # Client version
│   │   │   │   │   └── index.ts
│   │   │   │   ├── SearchBar/
│   │   │   │   │   ├── SearchBar.tsx         # Client Component
│   │   │   │   │   ├── SearchFilters.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── hooks/                # Domain-specific hooks (Client-side only)
│   │   │   │   ├── useComboSearch.ts
│   │   │   │   ├── useCardData.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── stores/               # Domain state (Zustand for Client Components)
│   │   │   │   ├── combo.store.ts
│   │   │   │   └── search.store.ts
│   │   │   │
│   │   │   ├── types/                # Domain types (shared between client/server)
│   │   │   │   ├── combo.types.ts
│   │   │   │   ├── card.types.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── factories/            # DDD Factory pattern
│   │   │   │   └── combo.factory.ts  # Create domain objects from DTOs
│   │   │   │
│   │   │   ├── validators/           # Domain validation rules
│   │   │   │   └── combo.validator.ts
│   │   │   │
│   │   │   └── utils/                # Domain utilities
│   │   │       ├── card-parser.ts
│   │   │       └── mana-cost.ts
│   │   │
│   │   ├── security/                 # Security domain (Nemesis + Ghostwriter merged)
│   │   │   ├── api/
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── file.repository.ts
│   │   │   │   │   ├── finding.repository.ts
│   │   │   │   │   ├── yara.repository.ts
│   │   │   │   │   └── report.repository.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── analysis.service.ts   # File analysis business logic
│   │   │   │   │   ├── triage.service.ts     # Finding triage logic
│   │   │   │   │   └── report.service.ts     # Report generation
│   │   │   │   ├── clients/
│   │   │   │   │   ├── graphql/
│   │   │   │   │   │   ├── client.ts         # Apollo/GraphQL client
│   │   │   │   │   │   ├── queries.ts
│   │   │   │   │   │   └── mutations.ts
│   │   │   │   │   └── rest/
│   │   │   │   │       └── nemesis.client.ts
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── FileBrowser/
│   │   │   │   │   ├── FileBrowser.tsx       # Client Component
│   │   │   │   │   ├── FileTree.tsx
│   │   │   │   │   ├── FilePreview.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── FileUpload/
│   │   │   │   │   ├── FileUpload.tsx        # Client Component with drag-drop
│   │   │   │   │   ├── UploadProgress.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── FileViewer/
│   │   │   │   │   ├── FileViewer.tsx        # Multi-format viewer
│   │   │   │   │   ├── CodeViewer.tsx        # Monaco integration
│   │   │   │   │   ├── PDFViewer.tsx
│   │   │   │   │   ├── ImageViewer.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── FindingsList/
│   │   │   │   │   ├── FindingsList.tsx      # Client Component
│   │   │   │   │   ├── FindingCard.tsx
│   │   │   │   │   ├── FindingFilters.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── YaraEditor/
│   │   │   │   │   ├── YaraEditor.tsx        # Client Component with Monaco
│   │   │   │   │   ├── YaraRulesList.tsx
│   │   │   │   │   ├── YaraValidator.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── ReportBuilder/            # From Ghostwriter
│   │   │   │   │   ├── ReportBuilder.tsx     # Client Component
│   │   │   │   │   ├── ReportEditor.tsx      # TipTap integration
│   │   │   │   │   ├── ReportTemplates.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useFileAnalysis.ts
│   │   │   │   ├── useFileUpload.ts
│   │   │   │   ├── useFindings.ts
│   │   │   │   ├── useTriage.ts
│   │   │   │   ├── useYaraRules.ts
│   │   │   │   ├── useReports.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── stores/
│   │   │   │   ├── files.store.ts
│   │   │   │   ├── findings.store.ts
│   │   │   │   ├── yara.store.ts
│   │   │   │   ├── reports.store.ts
│   │   │   │   └── triage.store.ts
│   │   │   │
│   │   │   ├── types/
│   │   │   │   ├── file.types.ts
│   │   │   │   ├── finding.types.ts
│   │   │   │   ├── yara.types.ts
│   │   │   │   ├── report.types.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── factories/
│   │   │   │   ├── finding.factory.ts
│   │   │   │   └── report.factory.ts
│   │   │   │
│   │   │   ├── validators/
│   │   │   │   └── yara.validator.ts
│   │   │   │
│   │   │   └── utils/
│   │   │       ├── file-parser.ts
│   │   │       ├── hash-calculator.ts
│   │   │       └── severity-calculator.ts
│   │   │
│   │   ├── finance/                  # Finance domain (Actual Budget)
│   │   │   ├── api/
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── account.repository.ts
│   │   │   │   │   ├── transaction.repository.ts
│   │   │   │   │   ├── budget.repository.ts
│   │   │   │   │   └── category.repository.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── budget.service.ts     # Budget calculations
│   │   │   │   │   ├── reconciliation.service.ts
│   │   │   │   │   └── sync.service.ts       # Data sync logic
│   │   │   │   ├── clients/
│   │   │   │   │   ├── actual.client.ts      # Actual Budget API
│   │   │   │   │   └── bank.client.ts        # Bank integration
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── AccountList/
│   │   │   │   │   ├── AccountList.tsx       # Client Component
│   │   │   │   │   ├── AccountCard.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── TransactionTable/
│   │   │   │   │   ├── TransactionTable.tsx  # Client Component (virtualized)
│   │   │   │   │   ├── TransactionRow.tsx
│   │   │   │   │   ├── TransactionFilters.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── BudgetEditor/
│   │   │   │   │   ├── BudgetEditor.tsx      # Client Component
│   │   │   │   │   ├── CategoryRow.tsx
│   │   │   │   │   ├── BudgetChart.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Reports/
│   │   │   │   │   ├── IncomeExpenseChart.tsx
│   │   │   │   │   ├── NetWorthChart.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useBudget.ts
│   │   │   │   ├── useTransactions.ts
│   │   │   │   ├── useAccounts.ts
│   │   │   │   ├── useCategories.ts
│   │   │   │   ├── useReconciliation.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── stores/
│   │   │   │   ├── budget.store.ts
│   │   │   │   ├── transactions.store.ts
│   │   │   │   ├── accounts.store.ts
│   │   │   │   └── sync.store.ts
│   │   │   │
│   │   │   ├── types/
│   │   │   │   ├── account.types.ts
│   │   │   │   ├── transaction.types.ts
│   │   │   │   ├── budget.types.ts
│   │   │   │   ├── category.types.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── factories/
│   │   │   │   ├── transaction.factory.ts
│   │   │   │   └── budget.factory.ts
│   │   │   │
│   │   │   ├── validators/
│   │   │   │   └── transaction.validator.ts
│   │   │   │
│   │   │   └── utils/
│   │   │       ├── currency.ts
│   │   │       ├── date-helpers.ts
│   │   │       └── budget-calculations.ts
│   │   │
│   │   ├── ai/                       # AI domain (Goose, MCP Inspector, NVIDIA)
│   │   │   ├── api/
│   │   │   │   ├── repositories/
│   │   │   │   │   ├── chat.repository.ts
│   │   │   │   │   ├── session.repository.ts
│   │   │   │   │   ├── tool.repository.ts
│   │   │   │   │   └── graph.repository.ts
│   │   │   │   ├── services/
│   │   │   │   │   ├── chat.service.ts       # Chat orchestration
│   │   │   │   │   ├── agent.service.ts      # Agent coordination
│   │   │   │   │   ├── kg.service.ts         # Knowledge graph logic
│   │   │   │   │   └── mcp.service.ts        # MCP protocol handling
│   │   │   │   ├── clients/
│   │   │   │   │   ├── goose/
│   │   │   │   │   │   ├── goose.client.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── mcp/
│   │   │   │   │   │   ├── inspector.client.ts
│   │   │   │   │   │   ├── protocol.client.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   └── nvidia/
│   │   │   │   │       ├── txt2kg.client.ts
│   │   │   │   │       ├── chatbot.client.ts
│   │   │   │   │       └── types.ts
│   │   │   │   └── types.ts
│   │   │   │
│   │   │   ├── components/
│   │   │   │   ├── Chat/
│   │   │   │   │   ├── ChatWindow.tsx        # Client Component
│   │   │   │   │   ├── MessageList.tsx       # With useOptimistic
│   │   │   │   │   ├── Message.tsx
│   │   │   │   │   ├── InputBar.tsx
│   │   │   │   │   ├── StreamingMessage.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── KnowledgeGraph/
│   │   │   │   │   ├── GraphViewer.tsx       # Client Component (3D)
│   │   │   │   │   ├── NodeDetails.tsx
│   │   │   │   │   ├── GraphControls.tsx
│   │   │   │   │   ├── EntityCard.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Inspector/
│   │   │   │   │   ├── Inspector.tsx         # Client Component
│   │   │   │   │   ├── ProtocolViewer.tsx
│   │   │   │   │   ├── ToolsPanel.tsx
│   │   │   │   │   ├── LogViewer.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Agent/
│   │   │   │   │   ├── AgentCard.tsx
│   │   │   │   │   ├── AgentStatus.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── hooks/
│   │   │   │   ├── useChat.ts
│   │   │   │   ├── useChatStream.ts
│   │   │   │   ├── useKnowledgeGraph.ts
│   │   │   │   ├── useMCPInspector.ts
│   │   │   │   ├── useAgents.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── stores/
│   │   │   │   ├── chat.store.ts
│   │   │   │   ├── sessions.store.ts
│   │   │   │   ├── graph.store.ts
│   │   │   │   ├── mcp.store.ts
│   │   │   │   └── agents.store.ts
│   │   │   │
│   │   │   ├── types/
│   │   │   │   ├── chat.types.ts
│   │   │   │   ├── message.types.ts
│   │   │   │   ├── agent.types.ts
│   │   │   │   ├── graph.types.ts
│   │   │   │   ├── mcp.types.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── factories/
│   │   │   │   ├── message.factory.ts
│   │   │   │   └── graph-node.factory.ts
│   │   │   │
│   │   │   └── utils/
│   │   │       ├── stream-parser.ts
│   │   │       ├── markdown-renderer.ts
│   │   │       └── syntax-highlighter.ts
│   │   │
│   │   └── ingestion/                # Data ingestion domain (Firecrawl)
│   │       ├── api/
│   │       │   ├── repositories/
│   │       │   │   ├── crawl-job.repository.ts
│   │       │   │   └── crawl-config.repository.ts
│   │       │   ├── services/
│   │       │   │   ├── crawler.service.ts    # Crawl orchestration
│   │       │   │   └── parser.service.ts     # Content parsing
│   │       │   ├── clients/
│   │       │   │   └── firecrawl.client.ts
│   │       │   └── types.ts
│   │       │
│   │       ├── components/
│   │       │   ├── CrawlerConfig/
│   │       │   │   ├── CrawlerConfig.tsx     # Client Component
│   │       │   │   ├── UrlInput.tsx
│   │       │   │   ├── OptionsForm.tsx
│   │       │   │   └── index.ts
│   │       │   ├── IngestionStatus/
│   │       │   │   ├── IngestionStatus.tsx   # Client Component
│   │       │   │   ├── ProgressBar.tsx
│   │       │   │   ├── JobCard.tsx
│   │       │   │   └── index.ts
│   │       │   ├── CrawlHistory/
│   │       │   │   ├── CrawlHistory.tsx
│   │       │   │   └── index.ts
│   │       │   └── index.ts
│   │       │
│   │       ├── hooks/
│   │       │   ├── useCrawler.ts
│   │       │   ├── useCrawlJob.ts
│   │       │   └── index.ts
│   │       │
│   │       ├── stores/
│   │       │   ├── ingestion.store.ts
│   │       │   └── jobs.store.ts
│   │       │
│   │       ├── types/
│   │       │   ├── crawler.types.ts
│   │       │   ├── job.types.ts
│   │       │   └── index.ts
│   │       │
│   │       ├── factories/
│   │       │   └── crawl-job.factory.ts
│   │       │
│   │       └── utils/
│   │           └── url-validator.ts
│   │
│   ├── shared/                       # SHARED KERNEL: Cross-domain code (Anti-Corruption Layer)
│   │   ├── components/               # Shared UI components
│   │   │   ├── ui/                   # shadcn/ui primitives (Server & Client)
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   └── ...
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── AppShell.tsx              # Root layout wrapper
│   │   │   │   ├── DomainLayout.tsx          # Domain-specific layout
│   │   │   │   ├── Sidebar.tsx               # Client Component
│   │   │   │   ├── Header.tsx                # Server Component with actions
│   │   │   │   ├── Footer.tsx                # Server Component
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── navigation/
│   │   │   │   ├── MainNav.tsx               # Client Component
│   │   │   │   ├── DomainNav.tsx             # Domain switcher
│   │   │   │   ├── Breadcrumbs.tsx           # Server Component
│   │   │   │   ├── BackButton.tsx            # Client Component
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── editors/                      # Shared complex editors
│   │   │   │   ├── MonacoEditor/
│   │   │   │   │   ├── MonacoEditor.tsx      # Client Component (dynamic)
│   │   │   │   │   ├── use-monaco.ts
│   │   │   │   │   └── index.ts
│   │   │   │   ├── MarkdownEditor/
│   │   │   │   │   ├── MarkdownEditor.tsx    # Client Component
│   │   │   │   │   ├── Toolbar.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── RichTextEditor/
│   │   │   │       ├── RichTextEditor.tsx    # TipTap based
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   ├── data-display/
│   │   │   │   ├── DataTable/
│   │   │   │   │   ├── DataTable.tsx         # Client Component
│   │   │   │   │   ├── DataTablePagination.tsx
│   │   │   │   │   ├── DataTableFilters.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── VirtualList/
│   │   │   │   │   ├── VirtualList.tsx       # Client Component (virtualized)
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Chart/
│   │   │   │   │   ├── LineChart.tsx         # Client Component
│   │   │   │   │   ├── BarChart.tsx
│   │   │   │   │   ├── PieChart.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── EmptyState/
│   │   │   │       ├── EmptyState.tsx
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   ├── forms/
│   │   │   │   ├── FormField.tsx             # Server Action compatible
│   │   │   │   ├── FormError.tsx
│   │   │   │   ├── SubmitButton.tsx          # Client Component with useFormStatus
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   └── feedback/
│   │   │       ├── LoadingSpinner.tsx
│   │   │       ├── SkeletonLoader.tsx
│   │   │       ├── ErrorMessage.tsx
│   │   │       └── index.ts
│   │   │
│   │   ├── hooks/                            # Shared hooks (Client-side only)
│   │   │   ├── useAuth.ts
│   │   │   ├── useUser.ts
│   │   │   ├── useTheme.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useSessionStorage.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useThrottle.ts
│   │   │   ├── useWebSocket.ts
│   │   │   ├── useMediaQuery.ts
│   │   │   ├── useKeyPress.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── stores/                           # Global state (Zustand)
│   │   │   ├── auth.store.ts
│   │   │   ├── user.store.ts
│   │   │   ├── theme.store.ts
│   │   │   ├── navigation.store.ts
│   │   │   ├── notifications.store.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── api/                              # Shared API utilities
│   │   │   ├── client.ts                     # Base API client
│   │   │   ├── fetch-wrapper.ts              # Fetch with auth & error handling
│   │   │   ├── interceptors.ts
│   │   │   ├── websocket.ts                  # WebSocket client
│   │   │   └── stream-reader.ts              # SSE/Stream utilities
│   │   │
│   │   ├── lib/                              # Third-party library configs
│   │   │   ├── apollo-client.ts              # Apollo GraphQL client
│   │   │   ├── tanstack-query.ts             # React Query config
│   │   │   ├── next-auth.ts                  # NextAuth.js config
│   │   │   └── zod-schemas.ts                # Shared Zod schemas
│   │   │
│   │   ├── types/                            # Shared types (Server & Client)
│   │   │   ├── common.types.ts
│   │   │   ├── api.types.ts
│   │   │   ├── user.types.ts
│   │   │   ├── pagination.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── constants/                        # Shared constants
│   │   │   ├── routes.ts                     # Route paths
│   │   │   ├── domains.ts                    # Domain configs
│   │   │   ├── api-endpoints.ts
│   │   │   └── index.ts
│   │   │
│   │   └── utils/                            # Shared utilities (Server & Client)
│   │       ├── formatting.ts
│   │       ├── validation.ts
│   │       ├── date.ts
│   │       ├── crypto.ts
│   │       ├── string-helpers.ts
│   │       ├── array-helpers.ts
│   │       ├── cn.ts                         # Tailwind class merger
│   │       └── index.ts
│   │
│   ├── infrastructure/               # INFRASTRUCTURE LAYER (Cross-cutting concerns)
│   │   ├── auth/
│   │   │   ├── providers/
│   │   │   │   ├── AuthProvider.tsx          # Client Component wrapper
│   │   │   │   ├── SessionProvider.tsx       # NextAuth.js wrapper
│   │   │   │   └── index.ts
│   │   │   ├── guards/
│   │   │   │   ├── AuthGuard.tsx             # Client Component
│   │   │   │   ├── RoleGuard.tsx
│   │   │   │   └── index.ts
│   │   │   ├── server/
│   │   │   │   ├── get-session.ts            # Server-side session
│   │   │   │   ├── get-user.ts
│   │   │   │   └── verify-token.ts
│   │   │   └── config/
│   │   │       └── next-auth.config.ts
│   │   │
│   │   ├── routing/
│   │   │   ├── middleware.ts                 # Next.js middleware
│   │   │   ├── route-guards.ts
│   │   │   └── redirect-helpers.ts
│   │   │
│   │   ├── error-handling/
│   │   │   ├── ErrorBoundary.tsx             # React Error Boundary
│   │   │   ├── DomainErrorBoundary.tsx       # Domain-specific errors
│   │   │   ├── GlobalError.tsx               # Next.js global-error
│   │   │   ├── NotFound.tsx
│   │   │   ├── error-logger.ts               # Server-side logging
│   │   │   └── error-reporter.ts             # Client error reporting
│   │   │
│   │   ├── monitoring/
│   │   │   ├── analytics.ts                  # Analytics tracking
│   │   │   ├── performance.ts                # Web Vitals tracking
│   │   │   ├── sentry.ts                     # Error monitoring
│   │   │   └── logger.ts                     # Structured logging
│   │   │
│   │   ├── database/
│   │   │   ├── prisma/                       # If using Prisma
│   │   │   │   ├── client.ts
│   │   │   │   └── schema.prisma
│   │   │   └── drizzle/                      # If using Drizzle
│   │   │       ├── client.ts
│   │   │       └── schema.ts
│   │   │
│   │   ├── cache/
│   │   │   ├── redis.ts                      # Redis client
│   │   │   └── next-cache.ts                 # Next.js cache utilities
│   │   │
│   │   └── events/
│   │       ├── event-bus.ts                  # Domain events bus
│   │       ├── event-types.ts
│   │       └── subscribers/
│   │           └── domain-events.subscriber.ts
│   │
│   ├── providers/                            # React Context Providers
│   │   ├── RootProviders.tsx                 # Combines all providers
│   │   ├── ThemeProvider.tsx                 # Theme context
│   │   ├── QueryProvider.tsx                 # TanStack Query
│   │   ├── ToastProvider.tsx                 # Toast notifications
│   │   └── index.ts
│   │
│   └── config/                               # Configuration
│       ├── env.ts                            # Environment variables
│       ├── site.ts                           # Site metadata
│       ├── domains.ts                        # Domain configurations
│       ├── navigation.ts                     # Navigation structure
│       └── features.ts                       # Feature flags
│
├── public/                                   # Static assets
│   ├── images/
│   ├── fonts/
│   └── favicons/
│
├── tests/                                    # Tests
│   ├── unit/                                 # Unit tests
│   │   └── domains/
│   │       ├── mtg/
│   │       ├── security/
│   │       └── ...
│   ├── integration/                          # Integration tests
│   │   └── api/
│   ├── e2e/                                  # E2E tests (Playwright)
│   │   ├── mtg.spec.ts
│   │   ├── security.spec.ts
│   │   └── ...
│   └── fixtures/                             # Test fixtures
│
├── docs/                                     # Documentation
│   ├── architecture/
│   │   ├── ddd-principles.md
│   │   ├── domain-boundaries.md
│   │   └── tech-stack.md
│   ├── domains/
│   │   ├── mtg.md
│   │   ├── security.md
│   │   └── ...
│   └── contributing.md
│
├── scripts/                                  # Build & dev scripts
│   ├── setup.sh
│   ├── migrate.sh
│   └── generate-types.ts
│
├── .env.example                              # Environment template
├── .env.local                                # Local environment (gitignored)
├── .eslintrc.json                            # ESLint config
├── .prettierrc                               # Prettier config
├── components.json                           # shadcn/ui config
├── middleware.ts                             # Next.js middleware
├── next.config.js                            # Next.js configuration
├── package.json
├── postcss.config.js                         # PostCSS config
├── tailwind.config.ts                        # Tailwind configuration
├── tsconfig.json                             # TypeScript config
└── vitest.config.ts                          # Vitest config

---

## Key DDD & Next.js 15 Principles Applied:

### 1. **Bounded Contexts (Domains)**
Each domain (`mtg`, `security`, `finance`, `ai`, `ingestion`) is a separate bounded context with:
- Own API layer (repositories, services, clients)
- Own components and UI logic
- Own types and business rules
- Clear boundaries and minimal coupling

### 2. **Layered Architecture**
- **Presentation Layer**: `app/` routes and `src/domains/*/components/`
- **Application Layer**: `src/domains/*/services/` (orchestration)
- **Domain Layer**: `src/domains/*/types/`, `factories/`, `validators/`
- **Infrastructure Layer**: `src/infrastructure/` (cross-cutting)
- **Shared Kernel**: `src/shared/` (common across domains)

### 3. **Server Components by Default**
- Routes in `app/` are Server Components by default
- Use `'use client'` only when needed (interactivity, hooks, browser APIs)
- Data fetching in Server Components for better performance

### 4. **Server Actions for Mutations**
- Located in `app/actions/` organized by domain
- Use `'use server'` directive
- Type-safe with TypeScript
- Integrated with React 19's `useActionState`, `useFormStatus`, `useOptimistic`

### 5. **Repository Pattern**
Each domain has repositories for data access abstraction:
```typescript
// src/domains/mtg/api/repositories/combo.repository.ts
export class ComboRepository {
  async findAll() { }
  async findById(id: string) { }
  async create(data: CreateComboDTO) { }
}
```

### 6. **Service Layer**
Business logic lives in services:
```typescript
// src/domains/security/api/services/analysis.service.ts
export class AnalysisService {
  async analyzeFile(file: File): Promise<Finding[]> {
    // Complex business logic here
  }
}
```

### 7. **Factory Pattern**
Transform DTOs to domain objects:
```typescript
// src/domains/mtg/factories/combo.factory.ts
export class ComboFactory {
  static fromDTO(dto: ComboDTO): Combo { }
}
```

### 8. **Anti-Corruption Layer**
`src/shared/` acts as ACL between domains
- Prevents domain coupling
- Shared components are generic
- Shared types are minimal

### 9. **Domain Events**
Cross-domain communication via events:
```typescript
// src/infrastructure/events/event-bus.ts
domainEvents.emit('security:finding-created', { findingId });
```

### 10. **Route Groups**
- `(marketing)` - Public pages
- `(domains)` - Authenticated domain routes
- Each with their own layouts