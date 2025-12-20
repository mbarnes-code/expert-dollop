# Security Domain

Security analysis, YARA rule management, and reporting tools.

## Structure

```
security/
├── api/                    # Data access layer
│   ├── repositories/       # Data repositories
│   ├── services/          # Business logic
│   └── clients/           # External API clients (GraphQL/REST)
├── components/            # UI components
│   ├── FileBrowser/       # File browsing interface
│   ├── FileViewer/        # Multi-format file viewer
│   ├── YaraEditor/        # YARA rule editor
│   └── ReportBuilder/     # Report generation
├── hooks/                 # React hooks
├── stores/                # State management (Zustand)
├── types/                 # TypeScript types
├── factories/             # Factory pattern implementations
├── validators/            # Validation logic
└── utils/                 # Utility functions
```

## Integration Points

- **Source**: `features/security/` patterns
- **Patterns**: Nemesis + Ghostwriter integration

## Implementation Status

- [ ] Phase 4: Domain Implementation
- [ ] File repository and analysis service
- [ ] GraphQL client for backend
- [ ] File browser and viewer components
- [ ] Findings triage interface
- [ ] YARA rule editor with Monaco
- [ ] Report builder system
- [ ] WebSocket for real-time updates

## Next Steps

See Phase 4 in the main implementation plan for detailed tasks.
