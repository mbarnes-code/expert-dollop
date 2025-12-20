# Finance Domain

Budget management and financial tracking powered by Actual Budget.

## Structure

```
finance/
├── api/                    # Data access layer
│   ├── repositories/       # Data repositories
│   ├── services/          # Business logic
│   └── clients/           # Actual Budget API client
├── components/            # UI components
│   ├── AccountList/       # Account management
│   ├── TransactionTable/  # Transaction tracking
│   ├── BudgetEditor/      # Budget management
│   └── Reports/           # Financial reports
├── hooks/                 # React hooks
├── stores/                # State management (Zustand)
├── types/                 # TypeScript types
├── factories/             # Factory pattern implementations
├── validators/            # Validation logic
└── utils/                 # Utility functions
```

## Integration Points

- **Source**: `features/actual/` (Actual Budget app)

## Implementation Status

- [ ] Phase 5: Domain Implementation
- [ ] Analyze Actual Budget data structures
- [ ] Account and transaction repositories
- [ ] Budget service with calculations
- [ ] Account list and detail components
- [ ] Transaction table with virtualization
- [ ] Budget editor interface
- [ ] Financial reports and charts
- [ ] Sync service for data

## Next Steps

See Phase 5 in the main implementation plan for detailed tasks.
