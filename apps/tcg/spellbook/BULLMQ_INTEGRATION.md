# BullMQ Integration for TCG Spellbook

This document describes the BullMQ background job processing integration for the TCG Spellbook application.

## Overview

The TCG Spellbook app integrates functionality from:
- **MTG Scripting Toolkit** - Card analysis and scripting utilities
- **Commander Spellbook** - Combo search and card interactions

BullMQ is used to handle CPU-intensive background tasks:
- Combo searches
- Card analysis (pricing, legality, synergy, meta)
- Deck optimization

## Architecture

### Queues

Three queues are configured:

1. **SPELLBOOK_COMBO_SEARCH** - Searches for card combos based on criteria
2. **MTG_CARD_ANALYSIS** - Analyzes cards for various properties
3. **MTG_DECK_OPTIMIZATION** - Optimizes deck composition

All queues use the centralized BullMQ infrastructure at `/infrastructure/bullmq/`.

### Files

- `src/lib/queue.service.ts` - Queue initialization and job management
- `scripts/worker.ts` - Background worker process
- `src/pages/api/queue-combo-search.ts` - Example API endpoint

## Usage

### Starting the Worker

The worker should run as a separate process:

```bash
# Development
npm run worker

# Production
NODE_ENV=production npm run worker
```

### Queueing Jobs

From API routes or server-side code:

```typescript
import { queueComboSearch, queueCardAnalysis } from '@/lib/queue.service';

// Queue a combo search
const job = await queueComboSearch({
  cardNames: ['Sol Ring', 'Mana Vault'],
  colorIdentity: ['W', 'U', 'B'],
  commanderFormat: true,
});

// Queue card analysis
const analysisJob = await queueCardAnalysis({
  cardIds: ['card-id-1', 'card-id-2'],
  analysisType: 'pricing',
});
```

### API Example

```bash
curl -X POST http://localhost:3000/api/queue-combo-search \
  -H "Content-Type: application/json" \
  -d '{
    "cardNames": ["Sol Ring"],
    "commanderFormat": true
  }'
```

## Environment Variables

```bash
# Redis connection for BullMQ (database 3 is reserved for queues)
BULLMQ_REDIS_URL=redis://localhost:6379/3

# Or individual settings
REDIS_HOST=localhost
REDIS_PORT=6379
BULLMQ_REDIS_DB=3
```

## Integration with MTG Scripting Toolkit

The MTG Scripting Toolkit utilities from `features/mtg-scripting-toolkit` are now available in `src/lib/scripting-toolkit.ts`. These can be used within worker jobs:

```typescript
import { searchCards, analyzeCard } from '@/lib/scripting-toolkit';

// In a worker
const worker = createWorker(QueueName.MTG_CARD_ANALYSIS, async (job) => {
  const results = await searchCards(job.data.cardIds);
  // Process results...
});
```

## Monitoring

Queue statistics can be accessed via the BullMQ infrastructure:

```typescript
import { getQueue } from '@expert-dollop/bullmq-infrastructure';

const queue = getQueue(QueueName.SPELLBOOK_COMBO_SEARCH);
const counts = await queue.getJobCounts();
console.log('Queue stats:', counts);
```

## Deployment

In production:

1. **Web Server**: Run Next.js app (`npm start`)
2. **Worker Process**: Run worker separately (`npm run worker`)
3. **Redis**: Ensure Redis is available on database 3

Consider using:
- Docker Compose to run both services
- PM2 or systemd for process management
- Multiple worker instances for scaling

## Future Enhancements

- Image generation queueing for `/api/combo/[id]/generate-image`
- Bulk import processing
- Scheduled card price updates
- Cache warming for popular combos

## Troubleshooting

### Worker not processing jobs

1. Check Redis connection: `BULLMQ_REDIS_URL` is set correctly
2. Verify worker is running: `npm run worker`
3. Check worker logs for errors

### Jobs stuck in queue

1. Check worker concurrency settings
2. Verify job processing logic doesn't hang
3. Check Redis memory limits

### Connection errors

1. Ensure Redis is running on port 6379
2. Verify database 3 is available
3. Check firewall/network settings
