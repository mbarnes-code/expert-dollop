/**
 * Chat Input Component
 * 
 * Phase 4: Frontend Integration
 * Input component for sending messages to the agent
 */

import React, { useState, useRef, useEffect } from 'react';

export interface ChatInputProps {
  onSend: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxLength?: number;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  placeholder = 'Type a message...',
  disabled = false,
  className = '',
  maxLength = 5000,
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={1}
        className="
          flex-1 px-4 py-3 rounded-lg border border-gray-300 
          resize-none overflow-hidden
          focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
        "
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        className="
          px-6 py-3 bg-blue-600 text-white rounded-lg
          hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
          transition-colors
        "
      >
        Send
      </button>
    </form>
  );
};
