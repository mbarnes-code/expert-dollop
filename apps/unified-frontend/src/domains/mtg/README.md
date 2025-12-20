# MTG Domain

Magic: The Gathering domain for combo discovery and card database integration.

## Structure

```
mtg/
├── api/                    # Data access layer
│   ├── repositories/       # Data repositories
│   ├── services/          # Business logic
│   └── clients/           # External API clients
├── components/            # UI components
├── hooks/                 # React hooks
├── stores/                # State management (Zustand)
├── types/                 # TypeScript types
├── factories/             # Factory pattern implementations
├── validators/            # Validation logic
└── utils/                 # Utility functions
```

## Integration Points

- **Source**: `features/commander-spellbook-site/` (Next.js app)
- **Backend**: `features/commander-spellbook-backend/` (Django API)

## Implementation Status

- [ ] Phase 3: Domain Implementation
- [ ] Repository pattern for combo data
- [ ] Service layer for business logic
- [ ] API clients for Django backend
- [ ] Server Components for pages
- [ ] Client Components for interactive features
- [ ] Server Actions for mutations

## Next Steps

See Phase 3 in the main implementation plan for detailed tasks.
