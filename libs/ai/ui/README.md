# AI UI Library

Shared UI components and React hooks for AI applications across the Expert-Dollop platform.

**Phase 4** of the Goose AI Agent strangler fig integration.

## Overview

This library provides reusable React components and hooks for building AI chat interfaces. It integrates with:

1. `@expert-dollop/ai/agent-interface` - Shared type definitions
2. `@expert-dollop/ai/agent-dapr` - DAPR backend repositories
3. SWR for data fetching and caching
4. Real-time updates via WebSockets

## Installation

This library is part of the Expert-Dollop monorepo:

```typescript
import { ChatMessage, ChatInput, useConversation } from '@expert-dollop/ai/ui';
```

## Components

### ChatMessage

Displays a conversation message with support for text, images, and tool interactions.

```tsx
import { ChatMessage } from '@expert-dollop/ai/ui';

<ChatMessage
  message={message}
  onRetry={() => handleRetry()}
/>
```

**Props**:
- `message: Message` - The message to display
- `className?: string` - Additional CSS classes
- `onRetry?: () => void` - Callback for regenerating assistant messages

**Features**:
- Supports multiple content types (text, images, tool use, tool results)
- Different styling for user/assistant/system/tool messages
- Displays timestamps and metadata
- Regenerate button for assistant messages

### ChatInput

Text input component for sending messages with auto-resize and keyboard shortcuts.

```tsx
import { ChatInput } from '@expert-dollop/ai/ui';

<ChatInput
  onSend={(message) => handleSend(message)}
  placeholder="Ask me anything..."
  disabled={isLoading}
/>
```

**Props**:
- `onSend: (message: string) => void` - Callback when message is sent
- `placeholder?: string` - Input placeholder text
- `disabled?: boolean` - Disable input
- `className?: string` - Additional CSS classes
- `maxLength?: number` - Maximum message length (default: 5000)

**Features**:
- Auto-resizing textarea
- Enter to send, Shift+Enter for new line
- Submit button with disabled state
- Character limit enforcement

### ConversationList

Displays a list of conversations with selection, creation, and deletion.

```tsx
import { ConversationList } from '@expert-dollop/ai/ui';

<ConversationList
  conversations={conversations}
  selectedId={currentId}
  onSelect={(id) => setCurrentId(id)}
  onDelete={(id) => handleDelete(id)}
  onNew={() => handleNew()}
/>
```

**Props**:
- `conversations: Conversation[]` - List of conversations
- `selectedId?: string` - Currently selected conversation ID
- `onSelect: (id: string) => void` - Callback when conversation is selected
- `onDelete?: (id: string) => void` - Optional delete callback
- `onNew?: () => void` - Optional new conversation callback
- `className?: string` - Additional CSS classes
- `loading?: boolean` - Show loading state

**Features**:
- Smart conversation titles (uses first user message)
- Relative timestamps (Today, Yesterday, X days ago)
- Message count display
- Delete confirmation
- Empty state handling

## Hooks

### useConversations

Fetches and manages the list of conversations.

```tsx
import { useConversations } from '@expert-dollop/ai/ui';

const { 
  conversations, 
  isLoading, 
  error, 
  createConversation, 
  deleteConversation 
} = useConversations('/api/conversations');

// Create new conversation
const newConv = await createConversation();

// Delete conversation
await deleteConversation(id);
```

**Parameters**:
- `apiUrl?: string` - API endpoint (default: '/api/conversations')

**Returns**:
- `conversations: Conversation[]` - Array of conversations
- `isLoading: boolean` - Loading state
- `error: any` - Error if fetch failed
- `createConversation: () => Promise<Conversation>` - Create new conversation
- `deleteConversation: (id: string) => Promise<void>` - Delete conversation

### useConversation

Manages a single conversation with messages.

```tsx
import { useConversation } from '@expert-dollop/ai/ui';

const { 
  conversation, 
  isLoading, 
  isSending, 
  sendMessage, 
  updateConversation 
} = useConversation(conversationId);

// Send user message
await sendMessage('Hello, agent!');

// Update conversation title
await updateConversation({ title: 'New Title' });
```

**Parameters**:
- `conversationId: string | null` - Conversation ID (null disables the hook)
- `apiUrl?: string` - API endpoint (default: '/api/conversations')

**Returns**:
- `conversation?: Conversation` - The conversation object
- `isLoading: boolean` - Loading state
- `error: any` - Error if fetch failed
- `isSending: boolean` - True when sending a message
- `sendMessage: (content: string) => Promise<any>` - Send message
- `updateConversation: (updates: Partial<Conversation>) => Promise<void>` - Update conversation

### useStreamingAgent

Enables streaming responses from the agent.

```tsx
import { useStreamingAgent } from '@expert-dollop/ai/ui';

const { 
  streamingMessage, 
  isStreaming, 
  streamMessage 
} = useStreamingAgent(conversationId);

// Start streaming
await streamMessage('Explain quantum computing');

// Display streaming response
{isStreaming && <div>{streamingMessage}</div>}
```

**Parameters**:
- `conversationId: string | null` - Conversation ID
- `apiUrl?: string` - API endpoint (default: '/api/agent/stream')

**Returns**:
- `streamingMessage: string` - Accumulated streaming response
- `isStreaming: boolean` - True when streaming
- `streamMessage: (content: string) => Promise<void>` - Start streaming

### useAgentEvents

Subscribes to real-time agent events via WebSocket.

```tsx
import { useAgentEvents } from '@expert-dollop/ai/ui';

useAgentEvents(conversationId, (event) => {
  console.log('Event received:', event);
  // Handle conversation updates, tool executions, etc.
});
```

**Parameters**:
- `conversationId: string | null` - Conversation ID
- `onEvent?: (event: any) => void` - Event callback

## Usage Example: Complete Chat Interface

```tsx
import React, { useState } from 'react';
import { 
  ChatMessage, 
  ChatInput, 
  ConversationList,
  useConversations, 
  useConversation 
} from '@expert-dollop/ai/ui';

export function ChatApp() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const { 
    conversations, 
    isLoading: loadingList,
    createConversation,
    deleteConversation 
  } = useConversations();
  
  const { 
    conversation, 
    isLoading: loadingConv,
    isSending,
    sendMessage 
  } = useConversation(selectedId);

  const handleNewConversation = async () => {
    const newConv = await createConversation();
    setSelectedId(newConv.id);
  };

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 border-r p-4">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDelete={deleteConversation}
          onNew={handleNewConversation}
          loading={loadingList}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {conversation ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {conversation.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>

            {/* Input */}
            <div className="border-t p-4">
              <ChatInput
                onSend={handleSendMessage}
                disabled={isSending}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation or create a new one
          </div>
        )}
      </div>
    </div>
  );
}
```

## Styling

Components use Tailwind CSS classes. To customize:

```tsx
<ChatMessage 
  message={message} 
  className="my-custom-class" 
/>
```

Or override in your CSS:

```css
/* Change user message background */
.bg-blue-600 {
  background-color: your-color;
}
```

## Integration with apps/ai/chat

To integrate with the existing chat app:

1. **Update package.json**:
```json
{
  "dependencies": {
    "@expert-dollop/ai/ui": "*"
  }
}
```

2. **Use components in pages**:
```tsx
// apps/ai/chat/src/app/page.tsx
import { ChatMessage, ChatInput } from '@expert-dollop/ai/ui';
```

3. **Configure API endpoints**:
```tsx
const conversations = useConversations('/api/goose/conversations');
```

## Backend Integration

The hooks expect these API endpoints:

### Conversations

```typescript
GET    /api/conversations           - List conversations
POST   /api/conversations           - Create conversation
GET    /api/conversations/:id       - Get conversation
PATCH  /api/conversations/:id       - Update conversation
DELETE /api/conversations/:id       - Delete conversation
POST   /api/conversations/:id/messages - Send message
```

### Example Express Routes

```typescript
import { DaprConversationRepository, AgentEventPublisher } from '@expert-dollop/ai/agent-dapr';

const repo = new DaprConversationRepository();
const events = new AgentEventPublisher();

app.get('/api/conversations', async (req, res) => {
  const conversations = await repo.list({ limit: 100 });
  res.json(conversations);
});

app.post('/api/conversations/:id/messages', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  const conversation = await repo.findById(id);
  const message = {
    id: generateId(),
    role: 'user',
    content,
    timestamp: new Date(),
  };
  
  conversation.messages.push(message);
  await repo.update(id, { messages: conversation.messages });
  
  await events.publishMessageEvent(message.id, id);
  
  res.json(message);
});
```

## WebSocket Support

For real-time updates, components can connect to DAPR pub/sub via WebSocket:

```typescript
// Connect to DAPR WebSocket
const ws = new WebSocket('ws://localhost:3500/pubsub/goose.conversation.updated');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Update UI based on event
};
```

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from '@expert-dollop/ai/ui';

test('sends message on submit', () => {
  const handleSend = jest.fn();
  render(<ChatInput onSend={handleSend} />);
  
  const input = screen.getByPlaceholderText('Type a message...');
  fireEvent.change(input, { target: { value: 'Hello' } });
  
  const button = screen.getByText('Send');
  fireEvent.click(button);
  
  expect(handleSend).toHaveBeenCalledWith('Hello');
});
```

## Performance

- Uses SWR for automatic caching and revalidation
- Components are memoized where appropriate
- Lazy loading for conversation lists
- Optimistic updates for better UX

## Accessibility

- Semantic HTML elements
- Keyboard navigation support
- ARIA labels where needed
- Screen reader friendly

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES2020+ features
- WebSocket support for real-time updates

## License

Apache-2.0 (inherited from Goose AI Agent project)

## Related Documentation

- [Phase 4 Implementation Guide](../../../docs/goose-phase4-frontend-integration.md)
- [Agent Interface Library](../agent-interface/README.md)
- [DAPR Library](../agent-dapr/README.md)
- [Goose Integration Guide](../../../docs/goose-integration.md)
