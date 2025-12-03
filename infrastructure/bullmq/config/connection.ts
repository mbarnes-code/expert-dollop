/**
 * BullMQ Redis Connection Manager
 * Provides centralized Redis connection for all BullMQ queues across Node.js projects
 * Uses Redis database 3 (job queues) as per platform architecture
 */

import IORedis from 'ioredis';

let redisConnection: IORedis | null = null;

interface RedisConnectionOptions {
  host?: string;
  port?: number;
  db?: number;
  password?: string;
  maxRetriesPerRequest?: null | number;
  enableReadyCheck?: boolean;
  retryStrategy?: (times: number) => number | void;
}

/**
 * Get or create the shared Redis connection for BullMQ
 * @param options Optional Redis connection parameters
 * @returns IORedis instance
 */
export function getBullMQRedisConnection(options?: RedisConnectionOptions): IORedis {
  if (!redisConnection) {
    const defaultOptions: RedisConnectionOptions = {
      host: process.env.REDIS_HOST || process.env.BULLMQ_REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || process.env.BULLMQ_REDIS_PORT || '6379'),
      db: parseInt(process.env.BULLMQ_REDIS_DB || '3'), // Database 3 reserved for queues
      password: process.env.REDIS_PASSWORD || process.env.BULLMQ_REDIS_PASSWORD,
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    const connectionOptions = { ...defaultOptions, ...options };
    
    // Support for Redis URL format (e.g., redis://localhost:6379/3)
    if (process.env.REDIS_URL || process.env.BULLMQ_REDIS_URL) {
      const redisUrl = process.env.BULLMQ_REDIS_URL || process.env.REDIS_URL;
      redisConnection = new IORedis(redisUrl!, {
        maxRetriesPerRequest: null,
        enableReadyCheck: true,
        retryStrategy: connectionOptions.retryStrategy,
      });
    } else {
      redisConnection = new IORedis(connectionOptions);
    }

    // Event handlers for connection monitoring
    redisConnection.on('connect', () => {
      console.log('[BullMQ] Redis connection established');
    });

    redisConnection.on('ready', () => {
      console.log('[BullMQ] Redis connection ready');
    });

    redisConnection.on('error', (err) => {
      console.error('[BullMQ] Redis connection error:', err.message);
    });

    redisConnection.on('close', () => {
      console.warn('[BullMQ] Redis connection closed');
    });

    redisConnection.on('reconnecting', () => {
      console.log('[BullMQ] Redis reconnecting...');
    });
  }

  return redisConnection;
}

/**
 * Close the Redis connection (for graceful shutdown)
 */
export async function closeBullMQRedisConnection(): Promise<void> {
  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
    console.log('[BullMQ] Redis connection closed');
  }
}

/**
 * Get connection status
 */
export function getBullMQConnectionStatus(): string {
  if (!redisConnection) {
    return 'disconnected';
  }
  return redisConnection.status;
}
