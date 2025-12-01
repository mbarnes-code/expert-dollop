/**
 * Heartbeat message for WebSocket keepalive.
 */
import { z } from 'zod';

export const heartbeatMessageSchema = z.object({
  type: z.literal('heartbeat'),
});

export type HeartbeatMessage = z.infer<typeof heartbeatMessageSchema>;

export const createHeartbeatMessage = (): HeartbeatMessage => ({
  type: 'heartbeat',
});
