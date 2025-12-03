/**
 * Chat Message Component
 * 
 * Phase 4: Frontend Integration
 * Displays a conversation message from the agent interface
 */

import React from 'react';
import type { Message, MessageRole } from '@expert-dollop/ai/agent-interface';

export interface ChatMessageProps {
  message: Message;
  className?: string;
  onRetry?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  className = '',
  onRetry 
}) => {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isSystem = message.role === 'system';
  const isTool = message.role === 'tool';

  const getMessageContent = () => {
    if (typeof message.content === 'string') {
      return message.content;
    }
    
    // Handle complex content (images, tool use, etc.)
    return message.content.map((content, idx) => {
      if (content.type === 'text' && content.text) {
        return <p key={idx}>{content.text}</p>;
      }
      if (content.type === 'image' && content.imageUrl) {
        return <img key={idx} src={content.imageUrl} alt="Message attachment" className="max-w-md rounded" />;
      }
      if (content.type === 'tool_use' && content.toolName) {
        return (
          <div key={idx} className="bg-gray-100 p-2 rounded text-sm">
            <strong>Tool:</strong> {content.toolName}
            {content.toolInput && (
              <pre className="mt-1 text-xs">{JSON.stringify(content.toolInput, null, 2)}</pre>
            )}
          </div>
        );
      }
      if (content.type === 'tool_result' && content.toolResult) {
        return (
          <div key={idx} className="bg-green-50 p-2 rounded text-sm">
            <strong>Result:</strong>
            <pre className="mt-1 text-xs">{JSON.stringify(content.toolResult, null, 2)}</pre>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 ${className}`}
    >
      <div
        className={`
          max-w-3xl px-4 py-3 rounded-lg
          ${isUser ? 'bg-blue-600 text-white' : ''}
          ${isAssistant ? 'bg-gray-100 text-gray-900' : ''}
          ${isSystem ? 'bg-yellow-50 text-yellow-900 text-sm' : ''}
          ${isTool ? 'bg-purple-50 text-purple-900 text-sm' : ''}
        `}
      >
        {isSystem && <div className="font-semibold mb-1">System</div>}
        {isTool && <div className="font-semibold mb-1">Tool Response</div>}
        
        <div className="whitespace-pre-wrap break-words">
          {getMessageContent()}
        </div>

        {message.metadata && Object.keys(message.metadata).length > 0 && (
          <div className="mt-2 text-xs opacity-70">
            {message.metadata.model && <span>Model: {message.metadata.model}</span>}
            {message.metadata.tokens && <span className="ml-2">Tokens: {message.metadata.tokens}</span>}
          </div>
        )}

        <div className="text-xs opacity-70 mt-2">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>

        {isAssistant && onRetry && (
          <button
            onClick={onRetry}
            className="text-xs mt-2 underline opacity-70 hover:opacity-100"
          >
            Regenerate
          </button>
        )}
      </div>
    </div>
  );
};
