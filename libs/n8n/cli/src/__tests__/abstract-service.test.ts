/**
 * Tests for abstract service classes
 */

import {
  AbstractService,
  AbstractSingletonService,
  AbstractCachedService,
  AbstractEventService,
  ServiceRegistry,
} from '../services/abstract-service';

// Test implementation of AbstractService
class TestService extends AbstractService {
  getName(): string {
    return 'TestService';
  }

  private initializeCalled = false;
  private stopCalled = false;

  protected override async onInitialize(): Promise<void> {
    this.initializeCalled = true;
  }

  protected override async onStop(): Promise<void> {
    this.stopCalled = true;
  }

  wasInitialized(): boolean {
    return this.initializeCalled;
  }

  wasStopped(): boolean {
    return this.stopCalled;
  }
}

// Test implementation of AbstractSingletonService
class TestSingletonService extends AbstractSingletonService {
  getName(): string {
    return 'TestSingletonService';
  }
}

// Test implementation of AbstractCachedService
class TestCachedService extends AbstractCachedService {
  getName(): string {
    return 'TestCachedService';
  }

  // Expose protected methods for testing
  public testGetCached<T>(key: string): T | undefined {
    return this.getCached(key);
  }

  public testSetCached<T>(key: string, value: T, ttlMs?: number): void {
    this.setCached(key, value, ttlMs);
  }

  public testInvalidateCached(key: string): void {
    this.invalidateCached(key);
  }

  public async testGetOrSetCached<T>(
    key: string,
    factory: () => Promise<T>,
    ttlMs?: number,
  ): Promise<T> {
    return this.getOrSetCached(key, factory, ttlMs);
  }
}

// Test implementation of AbstractEventService
class TestEventService extends AbstractEventService {
  getName(): string {
    return 'TestEventService';
  }

  // Expose protected emit for testing
  public testEmit<T>(event: string, data: T): void {
    this.emit(event, data);
  }
}

describe('AbstractService', () => {
  let service: TestService;

  beforeEach(() => {
    service = new TestService();
  });

  describe('lifecycle', () => {
    it('should start in uninitialized state', () => {
      expect(service.getState()).toBe('uninitialized');
    });

    it('should transition to ready state after initialize', async () => {
      await service.initialize();
      expect(service.getState()).toBe('ready');
      expect(service.wasInitialized()).toBe(true);
    });

    it('should not reinitialize if already initialized', async () => {
      await service.initialize();
      const firstInitialized = service.wasInitialized();
      
      await service.initialize();
      
      expect(service.getState()).toBe('ready');
      expect(service.wasInitialized()).toBe(firstInitialized);
    });

    it('should transition to stopped state after stop', async () => {
      await service.initialize();
      await service.stop();
      
      expect(service.getState()).toBe('stopped');
      expect(service.wasStopped()).toBe(true);
    });

    it('should not stop if not ready', async () => {
      await service.stop();
      
      expect(service.getState()).toBe('uninitialized');
      expect(service.wasStopped()).toBe(false);
    });

    it('should report ready status correctly', async () => {
      expect(service.isReady()).toBe(false);
      
      await service.initialize();
      expect(service.isReady()).toBe(true);
      
      await service.stop();
      expect(service.isReady()).toBe(false);
    });
  });
});

describe('AbstractSingletonService', () => {
  beforeEach(() => {
    AbstractSingletonService.clearInstances();
  });

  describe('getInstance', () => {
    it('should return the same instance', () => {
      const instance1 = TestSingletonService.getInstance();
      const instance2 = TestSingletonService.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    it('should return different instances for different classes', () => {
      class AnotherSingletonService extends AbstractSingletonService {
        getName(): string {
          return 'AnotherService';
        }
      }

      const instance1 = TestSingletonService.getInstance();
      const instance2 = AnotherSingletonService.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('clearInstances', () => {
    it('should clear all singleton instances', () => {
      const instance1 = TestSingletonService.getInstance();
      AbstractSingletonService.clearInstances();
      const instance2 = TestSingletonService.getInstance();

      expect(instance1).not.toBe(instance2);
    });
  });
});

describe('AbstractCachedService', () => {
  let service: TestCachedService;

  beforeEach(() => {
    service = new TestCachedService();
  });

  describe('cache operations', () => {
    it('should store and retrieve cached values', () => {
      service.testSetCached('key1', { value: 'test' });
      
      const cached = service.testGetCached<{ value: string }>('key1');
      expect(cached).toEqual({ value: 'test' });
    });

    it('should return undefined for non-existent keys', () => {
      const cached = service.testGetCached('nonexistent');
      expect(cached).toBeUndefined();
    });

    it('should invalidate cached values', () => {
      service.testSetCached('key1', { value: 'test' });
      service.testInvalidateCached('key1');
      
      const cached = service.testGetCached('key1');
      expect(cached).toBeUndefined();
    });

    it('should respect TTL', async () => {
      service.testSetCached('key1', { value: 'test' }, 50); // 50ms TTL
      
      // Value should exist immediately
      expect(service.testGetCached('key1')).toBeDefined();
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Value should be expired
      expect(service.testGetCached('key1')).toBeUndefined();
    });
  });

  describe('getOrSetCached', () => {
    it('should return cached value if exists', async () => {
      service.testSetCached('key1', 'cached');
      const factory = jest.fn().mockResolvedValue('new');
      
      const result = await service.testGetOrSetCached('key1', factory);
      
      expect(result).toBe('cached');
      expect(factory).not.toHaveBeenCalled();
    });

    it('should call factory and cache result if not cached', async () => {
      const factory = jest.fn().mockResolvedValue('new');
      
      const result = await service.testGetOrSetCached('key1', factory);
      
      expect(result).toBe('new');
      expect(factory).toHaveBeenCalled();
      expect(service.testGetCached('key1')).toBe('new');
    });
  });
});

describe('AbstractEventService', () => {
  let service: TestEventService;

  beforeEach(() => {
    service = new TestEventService();
  });

  describe('on', () => {
    it('should subscribe to events', () => {
      const handler = jest.fn();
      service.on('test-event', handler);
      
      service.testEmit('test-event', { data: 'test' });
      
      expect(handler).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should return unsubscribe function', () => {
      const handler = jest.fn();
      const unsubscribe = service.on('test-event', handler);
      
      unsubscribe();
      service.testEmit('test-event', { data: 'test' });
      
      expect(handler).not.toHaveBeenCalled();
    });

    it('should allow multiple handlers for same event', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      
      service.on('test-event', handler1);
      service.on('test-event', handler2);
      service.testEmit('test-event', { data: 'test' });
      
      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });
  });

  describe('once', () => {
    it('should only handle event once', () => {
      const handler = jest.fn();
      service.once('test-event', handler);
      
      service.testEmit('test-event', { data: 'first' });
      service.testEmit('test-event', { data: 'second' });
      
      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith({ data: 'first' });
    });
  });
});

describe('ServiceRegistry', () => {
  let registry: ServiceRegistry;
  let service: TestService;

  beforeEach(() => {
    registry = new ServiceRegistry();
    service = new TestService();
  });

  describe('register', () => {
    it('should register a service', () => {
      registry.register(service);
      
      expect(registry.has('TestService')).toBe(true);
    });
  });

  describe('get', () => {
    it('should return registered service', () => {
      registry.register(service);
      
      expect(registry.get<TestService>('TestService')).toBe(service);
    });

    it('should return undefined for unregistered service', () => {
      expect(registry.get('Unknown')).toBeUndefined();
    });
  });

  describe('initializeAll', () => {
    it('should initialize all registered services', async () => {
      const service2 = new TestService();
      registry.register(service);
      
      // Register with different key to avoid collision
      (service2 as any).name = 'TestService2';
      jest.spyOn(service2, 'getName').mockReturnValue('TestService2');
      registry.register(service2);
      
      await registry.initializeAll();
      
      expect(service.wasInitialized()).toBe(true);
      expect(service2.wasInitialized()).toBe(true);
    });
  });

  describe('stopAll', () => {
    it('should stop all registered services', async () => {
      registry.register(service);
      await registry.initializeAll();
      await registry.stopAll();
      
      expect(service.wasStopped()).toBe(true);
    });
  });

  describe('getServiceNames', () => {
    it('should return all service names', () => {
      registry.register(service);
      
      expect(registry.getServiceNames()).toEqual(['TestService']);
    });
  });
});
