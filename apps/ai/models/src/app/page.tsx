'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch('/api/models');
        const data = await response.json();
        setModels(data.models || []);
      } catch (error) {
        console.error('Error fetching models:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const filteredModels = models.filter(model => {
    if (filter === 'all') return true;
    return model.registry?.provider === filter || 
           model.firecrawl?.litellm_provider?.includes(filter);
  });

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>AI Model Registry</h1>
      <p>Centralized model information from firecrawl, goose, and n8n</p>

      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <label htmlFor="provider-filter" style={{ marginRight: '1rem' }}>
          Filter by Provider:
        </label>
        <select
          id="provider-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '0.5rem', fontSize: '1rem' }}
        >
          <option value="all">All Providers</option>
          <option value="openai">OpenAI</option>
          <option value="anthropic">Anthropic</option>
          <option value="google">Google</option>
          <option value="meta">Meta</option>
        </select>
      </div>

      {loading ? (
        <p>Loading models...</p>
      ) : (
        <>
          <p style={{ marginBottom: '1rem' }}>
            Showing {filteredModels.length} of {models.length} models
          </p>
          <div style={{ 
            display: 'grid', 
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
          }}>
            {filteredModels.map((model) => (
              <div
                key={model.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: model.exists ? '#f9f9f9' : '#fff',
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                  {model.registry?.displayName || model.id}
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.25rem 0' }}>
                  <strong>ID:</strong> {model.id}
                </p>
                {model.registry && (
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.25rem 0' }}>
                    <strong>Provider:</strong> {model.registry.provider}
                  </p>
                )}
                {model.firecrawl && (
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.25rem 0' }}>
                    <strong>LiteLLM:</strong> {model.firecrawl.litellm_provider}
                  </p>
                )}
                {model.gooseContextLimit && (
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.25rem 0' }}>
                    <strong>Goose Limit:</strong> {model.gooseContextLimit.toLocaleString()} tokens
                  </p>
                )}
                {model.registry?.limits && (
                  <p style={{ fontSize: '0.9rem', color: '#666', margin: '0.25rem 0' }}>
                    <strong>Max Input:</strong> {model.registry.limits.maxInputTokens.toLocaleString()} tokens
                  </p>
                )}
                {model.firecrawl && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
                    <strong>Capabilities:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.25rem' }}>
                      {model.firecrawl.supports_vision && (
                        <span style={{ 
                          backgroundColor: '#e3f2fd', 
                          padding: '0.125rem 0.5rem', 
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}>
                          Vision
                        </span>
                      )}
                      {model.firecrawl.supports_function_calling && (
                        <span style={{ 
                          backgroundColor: '#f3e5f5', 
                          padding: '0.125rem 0.5rem', 
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}>
                          Functions
                        </span>
                      )}
                      {model.firecrawl.supports_prompt_caching && (
                        <span style={{ 
                          backgroundColor: '#e8f5e9', 
                          padding: '0.125rem 0.5rem', 
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}>
                          Caching
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
