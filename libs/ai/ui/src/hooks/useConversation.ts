/**
 * React Hooks for Agent Conversations
 * 
 * Phase 4: Frontend Integration
 * Custom hooks for managing conversations with DAPR backend
 */

import { useState, useEffect, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import type { 
  Conversation, 
  Message, 
  MessageRole 
} from '@expert-dollop/ai/agent-interface';

/**
 * Hook to fetch and manage conversations
 */
export function useConversations(apiUrl: string = '/api/conversations') {
  const { data, error, isLoading } = useSWR<Conversation[]>(apiUrl);

  const createConversation = useCallback(async (): Promise<Conversation> => {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [],
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }

    const conversation = await response.json();
    mutate(apiUrl); // Revalidate list
    return conversation;
  }, [apiUrl]);

  const deleteConversation = useCallback(async (id: string) => {
    const response = await fetch(`${apiUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete conversation');
    }

    mutate(apiUrl); // Revalidate list
  }, [apiUrl]);

  return {
    conversations: data || [],
    isLoading,
    error,
    createConversation,
    deleteConversation,
  };
}

/**
 * Hook to manage a single conversation
 */
export function useConversation(conversationId: string | null, apiUrl: string = '/api/conversations') {
  const url = conversationId ? `${apiUrl}/${conversationId}` : null;
  const { data, error, isLoading } = useSWR<Conversation>(url);
  const [isSending, setIsSending] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!conversationId) return;

    setIsSending(true);
    try {
      const response = await fetch(`${apiUrl}/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      mutate(url); // Revalidate conversation
      return result;
    } finally {
      setIsSending(false);
    }
  }, [conversationId, apiUrl, url]);

  const updateConversation = useCallback(async (updates: Partial<Conversation>) => {
    if (!conversationId) return;

    const response = await fetch(`${apiUrl}/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update conversation');
    }

    mutate(url); // Revalidate conversation
  }, [conversationId, apiUrl, url]);

  return {
    conversation: data,
    isLoading,
    error,
    isSending,
    sendMessage,
    updateConversation,
  };
}

/**
 * Hook for streaming agent responses
 */
export function useStreamingAgent(conversationId: string | null, apiUrl: string = '/api/agent/stream') {
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

  const streamMessage = useCallback(async (content: string) => {
    if (!conversationId) return;

    setIsStreaming(true);
    setStreamingMessage('');

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, content }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to start stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        setStreamingMessage(prev => prev + chunk);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [conversationId, apiUrl]);

  return {
    streamingMessage,
    isStreaming,
    streamMessage,
  };
}

/**
 * Hook for agent events (via WebSocket or SSE)
 */
export function useAgentEvents(conversationId: string | null, onEvent?: (event: any) => void) {
  useEffect(() => {
    if (!conversationId) return;

    // Connect to WebSocket or SSE endpoint
    const ws = new WebSocket(`ws://localhost:3500/pubsub/goose.conversation.updated`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.entityId === conversationId && onEvent) {
          onEvent(data);
        }
      } catch (e) {
        console.error('Failed to parse event:', e);
      }
    };

    return () => {
      ws.close();
    };
  }, [conversationId, onEvent]);
}
