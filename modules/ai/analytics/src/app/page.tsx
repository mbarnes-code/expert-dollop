'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  byModel: Record<string, {
    requests: number;
    tokens: number;
    cost: number;
  }>;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [topModels, setTopModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        setStats(data.stats);
        setTopModels(data.topModels || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const formatCost = (cost: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    }).format(cost);
  };

  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>AI Analytics Dashboard</h1>
      <p>Token usage and cost tracking across all AI operations</p>
      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '2rem' }}>
        Based on Firecrawl's cost tracking system
      </p>

      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '8px',
              border: '1px solid #2196f3'
            }}>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                Total Requests
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1976d2' }}>
                {stats?.totalRequests || 0}
              </div>
            </div>

            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: '#f3e5f5', 
              borderRadius: '8px',
              border: '1px solid #9c27b0'
            }}>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                Total Tokens
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#7b1fa2' }}>
                {(stats?.totalTokens || 0).toLocaleString()}
              </div>
            </div>

            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: '#e8f5e9', 
              borderRadius: '8px',
              border: '1px solid #4caf50'
            }}>
              <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>
                Total Cost
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#388e3c' }}>
                {formatCost(stats?.totalCost || 0)}
              </div>
            </div>
          </div>

          {/* Top Models */}
          {topModels.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2>Top Models by Cost</h2>
              <div style={{ 
                overflowX: 'auto',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}>
                <table style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse'
                }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ 
                        padding: '1rem', 
                        textAlign: 'left',
                        borderBottom: '2px solid #ddd'
                      }}>
                        Model
                      </th>
                      <th style={{ 
                        padding: '1rem', 
                        textAlign: 'right',
                        borderBottom: '2px solid #ddd'
                      }}>
                        Requests
                      </th>
                      <th style={{ 
                        padding: '1rem', 
                        textAlign: 'right',
                        borderBottom: '2px solid #ddd'
                      }}>
                        Tokens
                      </th>
                      <th style={{ 
                        padding: '1rem', 
                        textAlign: 'right',
                        borderBottom: '2px solid #ddd'
                      }}>
                        Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topModels.map((model, index) => (
                      <tr key={model.model} style={{ 
                        backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9'
                      }}>
                        <td style={{ 
                          padding: '1rem',
                          borderBottom: '1px solid #eee'
                        }}>
                          {model.model}
                        </td>
                        <td style={{ 
                          padding: '1rem', 
                          textAlign: 'right',
                          borderBottom: '1px solid #eee'
                        }}>
                          {model.requests}
                        </td>
                        <td style={{ 
                          padding: '1rem', 
                          textAlign: 'right',
                          borderBottom: '1px solid #eee'
                        }}>
                          {model.tokens.toLocaleString()}
                        </td>
                        <td style={{ 
                          padding: '1rem', 
                          textAlign: 'right',
                          borderBottom: '1px solid #eee',
                          fontWeight: 'bold'
                        }}>
                          {formatCost(model.cost)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Usage by Model */}
          {stats && Object.keys(stats.byModel).length > 0 && (
            <div>
              <h2>Usage by Model</h2>
              <div style={{ 
                display: 'grid', 
                gap: '1rem',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
              }}>
                {Object.entries(stats.byModel).map(([model, data]) => (
                  <div
                    key={model}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '1rem',
                      backgroundColor: '#f9f9f9',
                    }}
                  >
                    <h3 style={{ marginTop: 0, marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                      {model}
                    </h3>
                    <div style={{ fontSize: '0.9rem', color: '#666' }}>
                      <div style={{ marginBottom: '0.25rem' }}>
                        <strong>Requests:</strong> {data.requests}
                      </div>
                      <div style={{ marginBottom: '0.25rem' }}>
                        <strong>Tokens:</strong> {data.tokens.toLocaleString()}
                      </div>
                      <div>
                        <strong>Cost:</strong> {formatCost(data.cost)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats?.totalRequests === 0 && (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: '#666'
            }}>
              <p>No usage data yet. Start using the Chat or Models services to see analytics here.</p>
              <p style={{ fontSize: '0.9rem', marginTop: '1rem' }}>
                This dashboard tracks token usage and costs from Firecrawl-style LLM operations.
              </p>
            </div>
          )}
        </>
      )}
    </main>
  );
}
