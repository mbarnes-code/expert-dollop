/**
 * Conversation List Component
 * 
 * Phase 4: Frontend Integration
 * Displays a list of conversations from the agent repository
 */

import React from 'react';
import type { Conversation } from '@expert-dollop/ai/agent-interface';

export interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversationId: string) => void;
  onDelete?: (conversationId: string) => void;
  onNew?: () => void;
  className?: string;
  loading?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
  onDelete,
  onNew,
  className = '',
  loading = false,
}) => {
  const getConversationTitle = (conversation: Conversation) => {
    if (conversation.title) return conversation.title;
    if (conversation.messages.length > 0) {
      const firstUserMessage = conversation.messages.find(m => m.role === 'user');
      if (firstUserMessage && typeof firstUserMessage.content === 'string') {
        return firstUserMessage.content.substring(0, 50) + '...';
      }
    }
    return 'New Conversation';
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {onNew && (
        <button
          onClick={onNew}
          className="
            mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 transition-colors
          "
        >
          + New Conversation
        </button>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8 text-gray-500">
          Loading conversations...
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-gray-500">
          No conversations yet
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-2">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`
                p-3 rounded-lg cursor-pointer transition-colors
                ${selectedId === conversation.id 
                  ? 'bg-blue-100 border-l-4 border-blue-600' 
                  : 'bg-white hover:bg-gray-50 border-l-4 border-transparent'}
              `}
              onClick={() => onSelect(conversation.id)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">
                    {getConversationTitle(conversation)}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(conversation.updatedAt)}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {conversation.messages.length} messages
                  </p>
                </div>
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Delete this conversation?')) {
                        onDelete(conversation.id);
                      }
                    }}
                    className="text-gray-400 hover:text-red-600 ml-2"
                    title="Delete conversation"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
