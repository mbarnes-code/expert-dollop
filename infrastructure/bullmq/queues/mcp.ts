/**
 * MCP Queue Configurations
 * Placeholder for MCP server integrations
 * 
 * When integrating MCP servers:
 * - mcp-virustotal from features/mcp-virustotal
 * - firecrawl-mcp-server from features/firecrawl-mcp-server
 * 
 * 1. Import this configuration
 * 2. Create workers for API processing
 * 3. Update job data types as needed
 */

import { createQueue, QueueName } from '../config/queue-factory';
import type { MCPVirusTotalJobData, MCPFirecrawlJobData } from '../types';

/**
 * MCP VirusTotal Queue
 * Handles VirusTotal API scanning jobs
 */
export function createMCPVirusTotalQueue() {
  return createQueue<MCPVirusTotalJobData>(QueueName.MCP_VIRUSTOTAL, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      removeOnComplete: {
        age: 86400, // 24 hours
        count: 100,
      },
      removeOnFail: {
        age: 259200, // 3 days
        count: 500,
      },
    },
  });
}

/**
 * MCP Firecrawl Queue
 * Handles Firecrawl MCP operations
 */
export function createMCPFirecrawlQueue() {
  return createQueue<MCPFirecrawlJobData>(QueueName.MCP_FIRECRAWL, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 3000,
      },
      removeOnComplete: {
        age: 86400, // 24 hours
        count: 200,
      },
      removeOnFail: {
        age: 172800, // 2 days
        count: 1000,
      },
    },
  });
}
