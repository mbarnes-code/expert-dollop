/**
 * Worker message types for scaling.
 */
import type { WorkerStatus } from '../scaling';

export interface SendWorkerStatusMessage {
  type: 'sendWorkerStatusMessage';
  data: {
    workerId: string;
    status: WorkerStatus;
  };
}

export type WorkerPushMessage = SendWorkerStatusMessage;
