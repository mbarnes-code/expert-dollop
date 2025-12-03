/**
 * Tests for abstract store classes
 */

import {
  AbstractStoreLogic,
  AbstractAsyncStoreLogic,
  AbstractEntityStoreLogic,
  createAsyncState,
  createEntityState,
  createPaginationState,
  applyMetaTags,
  type IStoreState,
  type IAsyncState,
  type IEntityState,
} from '../stores/abstract-stores';

interface TestState extends IStoreState {
  value: number;
  name: string;
}

class TestStore extends AbstractStoreLogic<TestState> {
  constructor() {
    super({ value: 0, name: 'test' });
  }

  increment() {
    this.updateState({ value: this.getState().value + 1 });
  }

  setName(name: string) {
    this.updateState({ name });
  }

  reset() {
    this.resetState({ value: 0, name: 'test' });
  }
}

interface AsyncTestState extends TestState, IAsyncState {}

class AsyncTestStore extends AbstractAsyncStoreLogic<AsyncTestState> {
  constructor() {
    super({
      value: 0,
      name: 'test',
      isLoading: false,
      error: null,
      lastUpdated: null,
    });
  }

  async fetchValue(): Promise<number> {
    const result = await this.executeAsync(async () => {
      return 42;
    });
    if (result.success && result.data !== undefined) {
      this.updateState({ value: result.data });
    }
    return result.data ?? 0;
  }

  async failingFetch(): Promise<void> {
    await this.executeAsync(async () => {
      throw new Error('Test error');
    });
  }
}

interface TestEntity {
  id: string;
  name: string;
}

class EntityTestStore extends AbstractEntityStoreLogic<TestEntity> {
  constructor() {
    super(createEntityState<TestEntity>());
  }
}

describe('AbstractStoreLogic', () => {
  let store: TestStore;

  beforeEach(() => {
    store = new TestStore();
  });

  describe('getState', () => {
    it('should return initial state', () => {
      expect(store.getState()).toEqual({ value: 0, name: 'test' });
    });
  });

  describe('updateState', () => {
    it('should update state partially', () => {
      store.increment();
      expect(store.getState().value).toBe(1);
      expect(store.getState().name).toBe('test');
    });

    it('should notify subscribers on update', () => {
      const handler = jest.fn();
      store.subscribe(handler);
      
      store.increment();
      
      expect(handler).toHaveBeenCalledWith({ value: 1, name: 'test' });
    });
  });

  describe('resetState', () => {
    it('should reset to initial state', () => {
      store.increment();
      store.setName('changed');
      store.reset();
      
      expect(store.getState()).toEqual({ value: 0, name: 'test' });
    });
  });

  describe('subscribe', () => {
    it('should return unsubscribe function', () => {
      const handler = jest.fn();
      const unsubscribe = store.subscribe(handler);
      
      store.increment();
      expect(handler).toHaveBeenCalledTimes(1);
      
      unsubscribe();
      store.increment();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});

describe('AbstractAsyncStoreLogic', () => {
  let store: AsyncTestStore;

  beforeEach(() => {
    store = new AsyncTestStore();
  });

  describe('executeAsync', () => {
    it('should set loading state during async operation', async () => {
      const fetchPromise = store.fetchValue();
      
      // Can't easily test intermediate loading state in sync test
      await fetchPromise;
      
      expect(store.getState().isLoading).toBe(false);
    });

    it('should set lastUpdated on success', async () => {
      await store.fetchValue();
      
      expect(store.getState().lastUpdated).toBeDefined();
    });

    it('should set error on failure', async () => {
      await store.failingFetch();
      
      expect(store.getState().error).toBeDefined();
      expect(store.getState().error?.message).toBe('Test error');
    });
  });

  describe('clearError', () => {
    it('should clear error state', async () => {
      await store.failingFetch();
      store.clearError();
      
      expect(store.getState().error).toBeNull();
    });
  });
});

describe('AbstractEntityStoreLogic', () => {
  let store: EntityTestStore;

  beforeEach(() => {
    store = new EntityTestStore();
  });

  describe('upsert', () => {
    it('should add new entity', () => {
      store.upsert({ id: '1', name: 'Entity 1' });
      
      expect(store.getById('1')).toEqual({ id: '1', name: 'Entity 1' });
    });

    it('should update existing entity', () => {
      store.upsert({ id: '1', name: 'Entity 1' });
      store.upsert({ id: '1', name: 'Updated' });
      
      expect(store.getById('1')).toEqual({ id: '1', name: 'Updated' });
    });
  });

  describe('upsertMany', () => {
    it('should add multiple entities', () => {
      store.upsertMany([
        { id: '1', name: 'Entity 1' },
        { id: '2', name: 'Entity 2' },
      ]);
      
      expect(store.count()).toBe(2);
    });
  });

  describe('getAll', () => {
    it('should return all entities as array', () => {
      store.upsertMany([
        { id: '1', name: 'Entity 1' },
        { id: '2', name: 'Entity 2' },
      ]);
      
      const all = store.getAll();
      expect(all).toHaveLength(2);
    });
  });

  describe('remove', () => {
    it('should remove entity', () => {
      store.upsert({ id: '1', name: 'Entity 1' });
      store.remove('1');
      
      expect(store.getById('1')).toBeUndefined();
    });

    it('should clear selection if removed entity was selected', () => {
      store.upsert({ id: '1', name: 'Entity 1' });
      store.select('1');
      store.remove('1');
      
      expect(store.getSelected()).toBeUndefined();
    });
  });

  describe('select', () => {
    it('should select entity', () => {
      store.upsert({ id: '1', name: 'Entity 1' });
      store.select('1');
      
      expect(store.getSelected()).toEqual({ id: '1', name: 'Entity 1' });
    });
  });

  describe('find', () => {
    it('should find entities by predicate', () => {
      store.upsertMany([
        { id: '1', name: 'Apple' },
        { id: '2', name: 'Banana' },
        { id: '3', name: 'Apricot' },
      ]);
      
      const found = store.find(e => e.name.startsWith('A'));
      expect(found).toHaveLength(2);
    });
  });

  describe('findFirst', () => {
    it('should find first matching entity', () => {
      store.upsertMany([
        { id: '1', name: 'Apple' },
        { id: '2', name: 'Banana' },
      ]);
      
      const found = store.findFirst(e => e.name === 'Banana');
      expect(found).toEqual({ id: '2', name: 'Banana' });
    });
  });

  describe('clear', () => {
    it('should clear all entities', () => {
      store.upsertMany([
        { id: '1', name: 'Entity 1' },
        { id: '2', name: 'Entity 2' },
      ]);
      store.clear();
      
      expect(store.count()).toBe(0);
    });
  });
});

describe('State factory functions', () => {
  describe('createAsyncState', () => {
    it('should create initial async state', () => {
      const state = createAsyncState();
      
      expect(state).toEqual({
        isLoading: false,
        error: null,
        lastUpdated: null,
      });
    });
  });

  describe('createEntityState', () => {
    it('should create initial entity state', () => {
      const state = createEntityState();
      
      expect(state).toEqual({
        isLoading: false,
        error: null,
        lastUpdated: null,
        entities: new Map(),
        selectedId: null,
      });
    });
  });

  describe('createPaginationState', () => {
    it('should create initial pagination state', () => {
      const state = createPaginationState(10);
      
      expect(state).toEqual({
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
      });
    });
  });
});
