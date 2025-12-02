/**
 * Tests for abstract API client classes
 */

import {
  AbstractApiClient,
  FetchApiClient,
  RestResourceClient,
  ApiRequestQueue,
  createRetryWrapper,
  type IApiClientOptions,
  type IApiRequestConfig,
  type IApiResponse,
} from '../api/abstract-api-client';

// Mock fetch for testing
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('FetchApiClient', () => {
  let client: FetchApiClient;

  beforeEach(() => {
    mockFetch.mockReset();
    client = new FetchApiClient({
      baseUrl: 'https://api.example.com',
      timeout: 5000,
    });
  });

  describe('get', () => {
    it('should make GET request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'test' }),
        headers: new Map(),
      });

      const result = await client.get('/users');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual({ data: 'test' });
    });

    it('should include query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
        headers: new Map(),
      });

      await client.get('/users', { page: 1, limit: 10 });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users?page=1&limit=10',
        expect.any(Object)
      );
    });
  });

  describe('post', () => {
    it('should make POST request with body', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ id: '1' }),
        headers: new Map(),
      });

      const result = await client.post('/users', { name: 'Test' });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test' }),
        })
      );
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('put', () => {
    it('should make PUT request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: '1', name: 'Updated' }),
        headers: new Map(),
      });

      await client.put('/users/1', { name: 'Updated' });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({ method: 'PUT' })
      );
    });
  });

  describe('patch', () => {
    it('should make PATCH request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: '1', name: 'Patched' }),
        headers: new Map(),
      });

      await client.patch('/users/1', { name: 'Patched' });
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });

  describe('delete', () => {
    it('should make DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: () => Promise.resolve({}),
        headers: new Map(),
      });

      await client.delete('/users/1');
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/users/1',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('error handling', () => {
    it('should throw on HTTP error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () => Promise.resolve({ message: 'User not found' }),
        headers: new Map(),
      });

      await expect(client.get('/users/999')).rejects.toMatchObject({
        message: 'User not found',
        status: 404,
      });
    });
  });
});

describe('RestResourceClient', () => {
  let apiClient: FetchApiClient;
  let resourceClient: RestResourceClient<{ id: string; name: string }>;

  beforeEach(() => {
    mockFetch.mockReset();
    apiClient = new FetchApiClient({
      baseUrl: 'https://api.example.com',
    });
    resourceClient = new RestResourceClient(apiClient, '/users');
  });

  it('should get all resources', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve([{ id: '1', name: 'User 1' }]),
      headers: new Map(),
    });

    const result = await resourceClient.getAll();
    expect(result).toEqual([{ id: '1', name: 'User 1' }]);
  });

  it('should get resource by ID', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: '1', name: 'User 1' }),
      headers: new Map(),
    });

    const result = await resourceClient.getById('1');
    expect(result).toEqual({ id: '1', name: 'User 1' });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/users/1',
      expect.any(Object)
    );
  });

  it('should create resource', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: '2', name: 'New User' }),
      headers: new Map(),
    });

    const result = await resourceClient.create({ name: 'New User' });
    expect(result).toEqual({ id: '2', name: 'New User' });
  });

  it('should update resource', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: '1', name: 'Updated User' }),
      headers: new Map(),
    });

    const result = await resourceClient.update('1', { name: 'Updated User' });
    expect(result).toEqual({ id: '1', name: 'Updated User' });
  });

  it('should delete resource', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: () => Promise.resolve({}),
      headers: new Map(),
    });

    await resourceClient.delete('1');
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com/users/1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

describe('ApiRequestQueue', () => {
  it('should process requests in order', async () => {
    const queue = new ApiRequestQueue({ delayMs: 0, maxConcurrent: 1 });
    const results: number[] = [];

    await Promise.all([
      queue.enqueue(async () => { results.push(1); return 1; }),
      queue.enqueue(async () => { results.push(2); return 2; }),
      queue.enqueue(async () => { results.push(3); return 3; }),
    ]);

    expect(results).toEqual([1, 2, 3]);
  });

  it('should respect concurrency limit', async () => {
    const queue = new ApiRequestQueue({ delayMs: 0, maxConcurrent: 2 });
    let concurrent = 0;
    let maxConcurrent = 0;

    const makeRequest = async () => {
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      await new Promise(resolve => setTimeout(resolve, 10));
      concurrent--;
    };

    await Promise.all([
      queue.enqueue(makeRequest),
      queue.enqueue(makeRequest),
      queue.enqueue(makeRequest),
      queue.enqueue(makeRequest),
    ]);

    expect(maxConcurrent).toBeLessThanOrEqual(2);
  });
});

describe('createRetryWrapper', () => {
  it('should retry on failure', async () => {
    const withRetry = createRetryWrapper(3, 10);
    let attempts = 0;

    const result = await withRetry(async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error('Temporary failure');
      }
      return 'success';
    });

    expect(attempts).toBe(3);
    expect(result).toBe('success');
  });

  it('should throw after max retries', async () => {
    const withRetry = createRetryWrapper(2, 10);
    let attempts = 0;

    await expect(
      withRetry(async () => {
        attempts++;
        throw new Error('Permanent failure');
      })
    ).rejects.toThrow('Permanent failure');

    expect(attempts).toBe(3); // Initial + 2 retries
  });

  it('should respect shouldRetry predicate', async () => {
    const withRetry = createRetryWrapper(3, 10);
    let attempts = 0;

    await expect(
      withRetry(
        async () => {
          attempts++;
          throw new Error('Non-retriable');
        },
        () => false // Don't retry
      )
    ).rejects.toThrow('Non-retriable');

    expect(attempts).toBe(1); // No retries
  });
});
