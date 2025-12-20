# AI Domain

AI-powered tools including chat, MCP Inspector, and knowledge graphs.

## Structure

```
ai/
├── api/                    # Data access layer
│   ├── repositories/       # Data repositories
│   ├── services/          # Business logic
│   └── clients/           # AI service clients (Goose, MCP, NVIDIA)
├── components/            # UI components
│   ├── Chat/              # Chat interface with streaming
│   ├── KnowledgeGraph/    # 3D graph visualization
│   ├── Inspector/         # MCP protocol inspector
│   └── Agent/             # Multi-agent interface
├── hooks/                 # React hooks
├── stores/                # State management (Zustand)
├── types/                 # TypeScript types
├── factories/             # Factory pattern implementations
└── utils/                 # Utility functions
```

## Integration Points

- **Source**: `features/AI core/goose/` (AI agent)
- **Source**: `features/AI core/inspector/` (MCP Inspector)
- **Source**: `features/AI core/n8n/` (workflow automation)
- **Source**: `features/AI core/NVIDIA/` (knowledge graph tools)

## Implementation Status

- [ ] Phase 6: Domain Implementation
- [ ] Chat and message types
- [ ] Chat repository and service
- [ ] MCP protocol client
- [ ] Goose agent integration
- [ ] NVIDIA knowledge graph client
- [ ] Chat interface with streaming
- [ ] MCP Inspector UI
- [ ] Knowledge graph visualization (3D)
- [ ] Multi-agent coordination
- [ ] Server-Sent Events for streaming

## Next Steps

See Phase 6 in the main implementation plan for detailed tasks.
