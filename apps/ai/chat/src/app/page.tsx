'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('gpt-4.1-mini');

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [...messages, userMessage],
        }),
      });

      const data = await response.json();
      setMessages(prev => [...prev, data.message]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your message.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <main style={{ 
      padding: '2rem', 
      maxWidth: '800px', 
      margin: '0 auto',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <h1>AI Chat Interface</h1>
        <p>Unified chat powered by n8n and Goose AI systems</p>
        <div style={{ marginTop: '1rem' }}>
          <label htmlFor="model-select" style={{ marginRight: '0.5rem' }}>
            Model:
          </label>
          <select
            id="model-select"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            style={{ padding: '0.5rem', fontSize: '1rem' }}
          >
            <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
            <option value="gpt-4o">GPT-4o</option>
            <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
            <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash</option>
          </select>
        </div>
      </div>

      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', marginTop: '2rem' }}>
            Start a conversation! This interface consolidates chat functionality from:
            <br />• n8n AI Workflow Builder (LangChain-based)
            <br />• Goose AI Agent system
          </p>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              style={{
                marginBottom: '1rem',
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: message.role === 'user' ? '#e3f2fd' : '#fff',
                border: message.role === 'user' ? '1px solid #2196f3' : '1px solid #ddd',
              }}
            >
              <div style={{ 
                fontWeight: 'bold', 
                marginBottom: '0.25rem',
                color: message.role === 'user' ? '#1976d2' : '#666'
              }}>
                {message.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {message.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div style={{ 
            padding: '0.75rem', 
            textAlign: 'center',
            color: '#666'
          }}>
            Thinking...
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
          style={{
            flex: 1,
            padding: '0.75rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: '1px solid #ddd',
            resize: 'none',
            minHeight: '60px',
          }}
          disabled={loading}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: loading || !input.trim() ? '#ccc' : '#2196f3',
            color: '#fff',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
          }}
        >
          Send
        </button>
      </div>
    </main>
  );
}
