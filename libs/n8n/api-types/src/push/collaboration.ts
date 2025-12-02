/**
 * Collaboration types for real-time editing.
 */
import type { Iso8601DateTimeString } from '../datetime';
import type { MinimalUser } from '../user';

export interface Collaborator {
  user: MinimalUser;
  lastSeen: Iso8601DateTimeString;
}

export interface CollaboratorsChanged {
  type: 'collaboratorsChanged';
  data: {
    workflowId: string;
    collaborators: Collaborator[];
  };
}

export type CollaborationPushMessage = CollaboratorsChanged;
