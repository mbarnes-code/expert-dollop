# Goose Phase 4: Frontend Integration - Implementation Guide

## Overview

**Phase**: 4 - Frontend Integration  
**Status**: Complete ✅  
**Completion Date**: 2025-12-03  
**Library**: `@expert-dollop/ai/ui`

## What Was Accomplished

Phase 4 successfully created shared React components and hooks for AI chat interfaces, enabling:

1. **Reusable UI Components** - ChatMessage, ChatInput, ConversationList
2. **React Hooks** - Integration with DAPR backend via SWR
3. **Real-time Updates** - WebSocket support for agent events
4. **Type Safety** - Full TypeScript integration with agent-interface types
5. **Developer Experience** - Comprehensive documentation and examples

## Components Created

### 1. Shared UI Library Structure

**Package**: `@expert-dollop/ai/ui`

```
libs/ai/ui/
├── src/
│   ├── components/
│   │   ├── ChatMessage.tsx       # Message display component
│   │   ├── ChatInput.tsx         # Message input component
│   │   └── ConversationList.tsx  # Conversation sidebar
│   ├── hooks/
│   │   └── useConversation.ts    # React hooks for DAPR integration
│   └── index.ts                  # Main exports
├── package.json
├── tsconfig.json
├── project.json
└── README.md
```

### 2. UI Components

#### ChatMessage Component

Displays conversation messages with rich content support.

**Features**:
- Multiple content types (text, images, tool use, tool results)
- Role-based styling (user, assistant, system, tool)
- Timestamp display
- Message metadata (model, tokens)
- Regenerate button for assistant messages

**Usage**:
```tsx
import { ChatMessage } from '@expert-dollop/ai/ui';

<ChatMessage
  message={{
    id: 'msg-1',
    role: 'user',
    content: 'Hello!',
    timestamp: new Date(),
  }}
  onRetry={() => handleRetry()}
/>
```

**Styling**:
- User messages: Blue background, right-aligned
- Assistant messages: Gray background, left-aligned
- System messages: Yellow tint, small text
- Tool messages: Purple tint, monospace for code

#### ChatInput Component

Auto-resizing textarea with keyboard shortcuts.

**Features**:
- Auto-resize based on content
- Enter to send, Shift+Enter for new line
- Character limit enforcement (default 5000)
- Disabled state handling
- Submit button with loading state

**Usage**:
```tsx
import { ChatInput } from '@expert-dollop/ai/ui';

<ChatInput
  onSend={(message) => handleSend(message)}
  placeholder="Ask me anything..."
  disabled={isSending}
  maxLength={5000}
/>
```

#### ConversationList Component

Sidebar component for managing conversations.

**Features**:
- Smart titles (uses first user message if no title set)
- Relative timestamps (Today, Yesterday, X days ago)
- Message count display
- Selection highlighting
- Delete with confirmation
- Create new conversation button
- Empty state handling
- Loading state

**Usage**:
```tsx
import { ConversationList } from '@expert-dollop/ai/ui';

<ConversationList
  conversations={conversations}
  selectedId={currentId}
  onSelect={(id) => setCurrentId(id)}
  onDelete={(id) => handleDelete(id)}
  onNew={() => handleNew()}
  loading={isLoading}
/>
```

### 3. React Hooks

#### useConversations Hook

Manages conversation list with SWR caching.

```typescript
const { 
  conversations,    // Conversation[] - List of conversations
  isLoading,       // boolean - Loading state
  error,           // any - Error if fetch failed
  createConversation,  // () => Promise<Conversation>
  deleteConversation,  // (id: string) => Promise<void>
} = useConversations('/api/conversations');

// Create new conversation
const newConv = await createConversation();

// Delete conversation
await deleteConversation('conv-123');
```

**Features**:
- Automatic caching via SWR
- Automatic revalidation on focus/reconnect
- Optimistic updates
- Error handling

#### useConversation Hook

Manages single conversation with messages.

```typescript
const { 
  conversation,        // Conversation | undefined
  isLoading,          // boolean - Loading state
  error,              // any - Error if fetch failed
  isSending,          // boolean - True when sending message
  sendMessage,        // (content: string) => Promise<any>
  updateConversation, // (updates: Partial<Conversation>) => Promise<void>
} = useConversation(conversationId);

// Send message
await sendMessage('Hello, agent!');

// Update conversation title
await updateConversation({ title: 'New Chat' });
```

**Features**:
- Real-time message updates
- Automatic cache invalidation
- Loading states for better UX
- Null-safe (conversationId can be null)

#### useStreamingAgent Hook

Enables streaming responses from the agent.

```typescript
const { 
  streamingMessage,  // string - Accumulated streaming response
  isStreaming,       // boolean - True when streaming
  streamMessage,     // (content: string) => Promise<void>
} = useStreamingAgent(conversationId);

// Start streaming
await streamMessage('Explain quantum computing');

// Display streaming response
{isStreaming && (
  <div className="text-gray-500 italic">
    {streamingMessage}
  </div>
)}
```

**Features**:
- Chunk-by-chunk streaming
- ReadableStream API support
- Automatic cleanup
- Real-time UI updates

#### useAgentEvents Hook

Subscribes to real-time events via WebSocket.

```typescript
useAgentEvents(conversationId, (event) => {
  console.log('Event received:', event);
  
  if (event.eventType === 'goose.conversation.updated') {
    // Refresh conversation
    mutate(`/api/conversations/${conversationId}`);
  }
});
```

**Features**:
- WebSocket connection management
- Automatic reconnection
- Event filtering by conversation
- Cleanup on unmount

## Integration Architecture

### Data Flow

```
┌─────────────────┐
│  React Component│
│  (apps/ai/chat) │
└────────┬────────┘
         │ uses
         ▼
┌─────────────────┐
│  @expert-dollop │
│  /ai/ui         │  (Components + Hooks)
└────────┬────────┘
         │ fetches from
         ▼
┌─────────────────┐
│  Express/Next   │
│  API Routes     │  (/api/conversations)
└────────┬────────┘
         │ uses
         ▼
┌─────────────────┐
│  @expert-dollop │
│  /ai/agent-dapr │  (DAPR Repositories)
└────────┬────────┘
         │ calls
         ▼
┌─────────────────┐
│  DAPR Sidecar   │
│  (State + Pub)  │
└────────┬────────┘
         │ persists to
         ▼
┌─────────────────┐
│  PostgreSQL +   │
│  RabbitMQ       │
└─────────────────┘
```

### Technology Stack

**Frontend**:
- React 18.3
- TypeScript 5.9
- SWR 2.2 (data fetching)
- Tailwind CSS (styling)

**Backend**:
- Express or Next.js API routes
- DAPR client for state/pub-sub
- WebSocket for real-time events

**Data**:
- PostgreSQL (via DAPR state store)
- RabbitMQ (via DAPR pub/sub)

## Complete Integration Example

### 1. Update apps/ai/chat Package

```json
// apps/ai/chat/package.json
{
  "dependencies": {
    "@expert-dollop/ai/ui": "*",
    "@expert-dollop/ai/agent-dapr": "*",
    "swr": "^2.2.0"
  }
}
```

### 2. Create Chat Interface

```tsx
// apps/ai/chat/src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { SWRConfig } from 'swr';
import { 
  ChatMessage, 
  ChatInput, 
  ConversationList,
  useConversations, 
  useConversation,
  useStreamingAgent 
} from '@expert-dollop/ai/ui';

// SWR fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ChatPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Fetch conversations
  const { 
    conversations, 
    isLoading: loadingList,
    createConversation,
    deleteConversation 
  } = useConversations();
  
  // Manage current conversation
  const { 
    conversation, 
    isLoading: loadingConv,
    isSending,
    sendMessage 
  } = useConversation(selectedId);
  
  // Streaming support
  const { streamingMessage, isStreaming, streamMessage } = useStreamingAgent(selectedId);

  const handleNewConversation = async () => {
    const newConv = await createConversation();
    setSelectedId(newConv.id);
  };

  const handleSendMessage = async (content: string) => {
    if (conversation?.metadata?.streaming) {
      await streamMessage(content);
    } else {
      await sendMessage(content);
    }
  };

  return (
    <SWRConfig value={{ fetcher }}>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r shadow-sm">
          <div className="h-full p-4">
            <h1 className="text-2xl font-bold mb-4">AI Chat</h1>
            <ConversationList
              conversations={conversations}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onDelete={deleteConversation}
              onNew={handleNewConversation}
              loading={loadingList}
            />
          </div>
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col">
          {conversation ? (
            <>
              {/* Header */}
              <div className="bg-white border-b p-4 shadow-sm">
                <h2 className="text-lg font-semibold">
                  {conversation.title || 'New Conversation'}
                </h2>
                <p className="text-sm text-gray-500">
                  {conversation.messages.length} messages
                </p>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingConv ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-gray-500">Loading conversation...</div>
                  </div>
                ) : (
                  <>
                    {conversation.messages.map((message) => (
                      <ChatMessage 
                        key={message.id} 
                        message={message}
                        onRetry={() => {
                          // Implement retry logic
                        }}
                      />
                    ))}
                    
                    {/* Show streaming message */}
                    {isStreaming && streamingMessage && (
                      <div className="max-w-3xl bg-gray-100 px-4 py-3 rounded-lg">
                        <div className="whitespace-pre-wrap">{streamingMessage}</div>
                        <div className="mt-2 text-xs text-gray-500">Streaming...</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Input */}
              <div className="bg-white border-t p-4 shadow-sm">
                <ChatInput
                  onSend={handleSendMessage}
                  disabled={isSending || isStreaming}
                  placeholder="Type your message..."
                />
                {isSending && (
                  <div className="text-xs text-gray-500 mt-2">
                    Sending message...
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg">Select a conversation or create a new one</p>
              <button
                onClick={handleNewConversation}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start New Conversation
              </button>
            </div>
          )}
        </div>
      </div>
    </SWRConfig>
  );
}
```

### 3. Create API Routes

```typescript
// apps/ai/chat/src/app/api/conversations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DaprConversationRepository, AgentEventPublisher, AgentEventType } from '@expert-dollop/ai/agent-dapr';

const repo = new DaprConversationRepository();
const events = new AgentEventPublisher();

// GET /api/conversations - List conversations
export async function GET() {
  const conversations = await repo.list({ limit: 100 });
  return NextResponse.json(conversations);
}

// POST /api/conversations - Create conversation
export async function POST() {
  const conversation = {
    id: generateId(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  await repo.save(conversation);
  
  await events.publishConversationEvent(
    AgentEventType.ConversationCreated,
    conversation.id
  );
  
  return NextResponse.json(conversation);
}
```

```typescript
// apps/ai/chat/src/app/api/conversations/[id]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DaprConversationRepository, AgentEventPublisher, AgentEventType } from '@expert-dollop/ai/agent-dapr';
import { MessageRole } from '@expert-dollop/ai/agent-interface';

const repo = new DaprConversationRepository();
const events = new AgentEventPublisher();

// POST /api/conversations/:id/messages - Send message
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { content } = await request.json();
  const conversation = await repo.findById(params.id);
  
  if (!conversation) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  
  // Add user message
  const userMessage = {
    id: generateId(),
    role: MessageRole.User,
    content,
    timestamp: new Date(),
  };
  
  conversation.messages.push(userMessage);
  
  // Call agent and get response
  const agentResponse = await callAgent(content, conversation);
  
  const assistantMessage = {
    id: generateId(),
    role: MessageRole.Assistant,
    content: agentResponse,
    timestamp: new Date(),
  };
  
  conversation.messages.push(assistantMessage);
  
  // Save conversation
  await repo.update(params.id, { 
    messages: conversation.messages,
    updatedAt: new Date(),
  });
  
  // Publish events
  await events.publishMessageEvent(userMessage.id, params.id);
  await events.publishMessageEvent(assistantMessage.id, params.id);
  
  return NextResponse.json({
    userMessage,
    assistantMessage,
  });
}
```

## Benefits Achieved

### 1. Developer Experience

**Before Phase 4**:
```tsx
// Manual implementation required
const [messages, setMessages] = useState<Message[]>([]);
const [loading, setLoading] = useState(false);

const sendMessage = async (content: string) => {
  setLoading(true);
  try {
    const response = await fetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    const data = await response.json();
    setMessages([...messages, data]);
  } finally {
    setLoading(false);
  }
};
```

**After Phase 4**:
```tsx
// Single hook handles everything
const { conversation, sendMessage, isSending } = useConversation(id);

// One line to send message
await sendMessage('Hello!');
```

### 2. Type Safety

All components and hooks are fully typed:
```typescript
// Autocomplete works everywhere
const conversation: Conversation = { ... };
const message: Message = { ... };

// TypeScript catches errors at compile time
<ChatMessage message={message} /> // ✓ Correct
<ChatMessage message={123} />      // ✗ Type error
```

### 3. Reusability

Components can be used across multiple apps:
- `apps/ai/chat` - Main chat interface
- `apps/ai/models` - Model playground
- `apps/ai/training` - Training interface
- Future AI apps

### 4. Performance

**SWR Features**:
- Automatic caching (no duplicate fetches)
- Background revalidation
- Focus revalidation
- Automatic retry on error
- Optimistic updates

**Example**:
```tsx
// Both components share the same cached data
function ConversationSidebar() {
  const { conversations } = useConversations(); // Fetches once
  return <ConversationList conversations={conversations} />;
}

function ConversationHeader() {
  const { conversations } = useConversations(); // Uses cache
  return <div>{conversations.length} total</div>;
}
```

### 5. Real-time Updates

WebSocket integration for live updates:
```tsx
// Component automatically updates when events arrive
useAgentEvents(conversationId, (event) => {
  if (event.eventType === 'goose.conversation.updated') {
    // SWR automatically revalidates
    mutate(`/api/conversations/${conversationId}`);
  }
});
```

## Styling & Customization

### Tailwind CSS

Components use Tailwind utility classes:
```tsx
<ChatMessage className="shadow-lg" /> // Add shadow
<ChatInput className="border-2" />    // Custom border
```

### Custom Styling

Override component styles:
```css
/* global.css */
.chat-message {
  @apply rounded-xl shadow-md;
}

.chat-message.user {
  @apply bg-gradient-to-r from-blue-500 to-blue-600;
}
```

### Dark Mode

Add dark mode support:
```tsx
<div className="dark:bg-gray-900">
  <ChatMessage 
    className="dark:bg-gray-800 dark:text-white"
    message={message}
  />
</div>
```

## Testing

### Component Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from '@expert-dollop/ai/ui';

describe('ChatInput', () => {
  it('calls onSend when message is submitted', () => {
    const handleSend = jest.fn();
    render(<ChatInput onSend={handleSend} />);
    
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    const button = screen.getByText('Send');
    fireEvent.click(button);
    
    expect(handleSend).toHaveBeenCalledWith('Hello');
  });

  it('handles Enter key to submit', () => {
    const handleSend = jest.fn();
    render(<ChatInput onSend={handleSend} />);
    
    const input = screen.getByPlaceholderText(/type a message/i);
    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: false });
    
    expect(handleSend).toHaveBeenCalledWith('Test');
  });
});
```

### Hook Testing

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { useConversations } from '@expert-dollop/ai/ui';
import { SWRConfig } from 'swr';

describe('useConversations', () => {
  const wrapper = ({ children }) => (
    <SWRConfig value={{ provider: () => new Map() }}>
      {children}
    </SWRConfig>
  );

  it('fetches conversations', async () => {
    const { result } = renderHook(() => useConversations(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.conversations).toBeInstanceOf(Array);
  });
});
```

## Accessibility

- Semantic HTML elements (`<button>`, `<textarea>`)
- ARIA labels where needed
- Keyboard navigation support
- Screen reader friendly
- Focus management

## Performance Optimization

1. **Memoization**: Components use React.memo where appropriate
2. **Lazy Loading**: Conversations loaded on demand
3. **Virtual Scrolling**: For large message lists (future enhancement)
4. **Debouncing**: Input debounced for search/filter (future)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- ES2020 features
- WebSocket API
- ReadableStream API

## Next Steps: Phase 5

With frontend integration complete, Phase 5 will:

1. **Replace symlinks** with native implementations
2. **Full DAPR integration** across all services
3. **Unified testing** strategy
4. **Remove features/goose** dependency
5. **Production deployment** optimizations

## Summary

Phase 4 successfully created a production-ready UI library:

- ✅ 3 reusable React components
- ✅ 4 custom hooks for DAPR integration
- ✅ Full TypeScript type safety
- ✅ SWR for data fetching and caching
- ✅ WebSocket for real-time updates
- ✅ Comprehensive documentation
- ✅ Integration patterns for apps/ai/chat

**Library**: `@expert-dollop/ai/ui`  
**Status**: Production Ready ✅  
**Next Phase**: Complete Migration (Phase 5)

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-03  
**Phase**: 4 Complete ✅
