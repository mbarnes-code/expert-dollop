/**
 * Abstract composable patterns for Vue.js applications.
 * Provides common patterns for building reusable composables following DDD principles.
 */

import { ref, computed, watch, onMounted, onUnmounted, type Ref, type ComputedRef, type WatchSource } from 'vue';

/**
 * Composable state options
 */
export interface ComposableStateOptions<T> {
  /** Initial state value */
  initialValue: T;
  /** Whether to persist state to storage */
  persist?: boolean;
  /** Storage key for persistence */
  storageKey?: string;
  /** Storage type ('local' or 'session') */
  storageType?: 'local' | 'session';
}

/**
 * Creates a reactive state with optional persistence
 * @param options State options
 */
export function usePersistedState<T>(options: ComposableStateOptions<T>): {
  state: Ref<T>;
  reset: () => void;
  clear: () => void;
} {
  const { initialValue, persist = false, storageKey, storageType = 'local' } = options;

  const getStorage = () => {
    if (typeof window === 'undefined') return null;
    return storageType === 'session' ? sessionStorage : localStorage;
  };

  const loadFromStorage = (): T => {
    if (!persist || !storageKey) return initialValue;
    const storage = getStorage();
    if (!storage) return initialValue;
    
    try {
      const stored = storage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored) as T;
      }
    } catch {
      // Ignore parsing errors
    }
    return initialValue;
  };

  const state = ref<T>(loadFromStorage()) as Ref<T>;

  if (persist && storageKey) {
    watch(state, (newValue) => {
      const storage = getStorage();
      if (storage) {
        try {
          storage.setItem(storageKey, JSON.stringify(newValue));
        } catch {
          // Ignore storage errors
        }
      }
    }, { deep: true });
  }

  const reset = () => {
    state.value = initialValue;
  };

  const clear = () => {
    state.value = initialValue;
    if (persist && storageKey) {
      const storage = getStorage();
      if (storage) {
        storage.removeItem(storageKey);
      }
    }
  };

  return { state, reset, clear };
}

/**
 * Loading state configuration
 */
export interface LoadingStateOptions {
  /** Initial loading state */
  initialLoading?: boolean;
  /** Minimum loading time in ms to prevent flashing */
  minLoadingTime?: number;
}

/**
 * Creates a loading state composable with error handling
 * @param options Loading state options
 */
export function useLoadingState(options: LoadingStateOptions = {}): {
  isLoading: Ref<boolean>;
  error: Ref<Error | null>;
  startLoading: () => void;
  stopLoading: () => void;
  setError: (error: Error | null) => void;
  clearError: () => void;
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
} {
  const { initialLoading = false, minLoadingTime = 0 } = options;
  
  const isLoading = ref(initialLoading);
  const error = ref<Error | null>(null);
  let loadingStartTime: number | null = null;

  const startLoading = () => {
    isLoading.value = true;
    error.value = null;
    loadingStartTime = Date.now();
  };

  const stopLoading = async () => {
    if (minLoadingTime > 0 && loadingStartTime) {
      const elapsed = Date.now() - loadingStartTime;
      if (elapsed < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsed));
      }
    }
    isLoading.value = false;
    loadingStartTime = null;
  };

  const setError = (err: Error | null) => {
    error.value = err;
    isLoading.value = false;
  };

  const clearError = () => {
    error.value = null;
  };

  const withLoading = async <T>(fn: () => Promise<T>): Promise<T> => {
    startLoading();
    try {
      const result = await fn();
      await stopLoading();
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  return {
    isLoading,
    error,
    startLoading,
    stopLoading: () => { stopLoading(); },
    setError,
    clearError,
    withLoading,
  };
}

/**
 * Debounce options
 */
export interface DebounceOptions {
  /** Debounce delay in ms */
  delay: number;
  /** Whether to trigger immediately on first call */
  immediate?: boolean;
}

/**
 * Creates a debounced ref
 * @param value Source ref to debounce
 * @param options Debounce options
 */
export function useDebouncedRef<T>(
  value: Ref<T>,
  options: DebounceOptions,
): ComputedRef<T> {
  const { delay, immediate = false } = options;
  const debouncedValue = ref(value.value) as Ref<T>;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let isFirstCall = true;

  watch(value, (newValue) => {
    if (immediate && isFirstCall) {
      debouncedValue.value = newValue;
      isFirstCall = false;
      return;
    }

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      debouncedValue.value = newValue;
    }, delay);
  });

  onUnmounted(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });

  return computed(() => debouncedValue.value);
}

/**
 * Throttle options
 */
export interface ThrottleOptions {
  /** Throttle interval in ms */
  interval: number;
  /** Whether to trigger on leading edge */
  leading?: boolean;
  /** Whether to trigger on trailing edge */
  trailing?: boolean;
}

/**
 * Creates a throttled function
 * @param fn Function to throttle
 * @param options Throttle options
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: ThrottleOptions,
): T {
  const { interval, leading = true, trailing = true } = options;
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const throttled = ((...args: Parameters<T>) => {
    const now = Date.now();
    const remaining = interval - (now - lastCall);

    if (remaining <= 0 || remaining > interval) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      lastCall = now;
      if (leading) {
        return fn(...args);
      }
    }

    lastArgs = args;

    if (trailing && !timeout) {
      timeout = setTimeout(() => {
        lastCall = leading ? Date.now() : 0;
        timeout = null;
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, remaining);
    }
  }) as T;

  onUnmounted(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });

  return throttled;
}

/**
 * Device support information
 */
export interface DeviceSupport {
  isTouchDevice: boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: Ref<number>;
  screenHeight: Ref<number>;
  orientation: Ref<'portrait' | 'landscape'>;
}

/**
 * Creates a device support composable
 */
export function useDeviceSupport(): DeviceSupport {
  const screenWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 0);
  const screenHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 0);
  const orientation = ref<'portrait' | 'landscape'>(
    screenWidth.value > screenHeight.value ? 'landscape' : 'portrait'
  );

  const isTouchDevice = typeof window !== 'undefined' && 
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const updateDimensions = () => {
    if (typeof window !== 'undefined') {
      screenWidth.value = window.innerWidth;
      screenHeight.value = window.innerHeight;
      orientation.value = screenWidth.value > screenHeight.value ? 'landscape' : 'portrait';
    }
  };

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateDimensions);
    }
  });

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', updateDimensions);
    }
  });

  const isMobile = computed(() => screenWidth.value < 768);
  const isTablet = computed(() => screenWidth.value >= 768 && screenWidth.value < 1024);
  const isDesktop = computed(() => screenWidth.value >= 1024);

  return {
    isTouchDevice,
    isMobile: isMobile.value,
    isTablet: isTablet.value,
    isDesktop: isDesktop.value,
    screenWidth,
    screenHeight,
    orientation,
  };
}

/**
 * Short key press detection options
 */
export interface ShortKeyPressOptions {
  /** Maximum duration in ms to consider a "short" press */
  maxDuration?: number;
  /** Key to detect */
  key: string;
  /** Callback on short press */
  onShortPress: () => void;
}

/**
 * Creates a short key press detection composable
 * @param options Key press options
 */
export function useShortKeyPress(options: ShortKeyPressOptions): {
  isPressed: Ref<boolean>;
  cleanup: () => void;
} {
  const { maxDuration = 200, key, onShortPress } = options;
  const isPressed = ref(false);
  let pressStartTime: number | null = null;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === key && !isPressed.value) {
      isPressed.value = true;
      pressStartTime = Date.now();
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === key && isPressed.value) {
      isPressed.value = false;
      if (pressStartTime && Date.now() - pressStartTime <= maxDuration) {
        onShortPress();
      }
      pressStartTime = null;
    }
  };

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }
  });

  const cleanup = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    }
  };

  onUnmounted(cleanup);

  return { isPressed, cleanup };
}

/**
 * Event listener options
 */
export interface EventListenerOptions<T extends Event = Event> {
  /** Target element or window */
  target?: EventTarget | Ref<EventTarget | null>;
  /** Event type */
  event: string;
  /** Event handler */
  handler: (event: T) => void;
  /** Event options */
  options?: boolean | AddEventListenerOptions;
}

/**
 * Creates an event listener that auto-cleans up
 * @param options Event listener options
 */
export function useEventListener<T extends Event = Event>(
  options: EventListenerOptions<T>,
): { cleanup: () => void } {
  const { target = window, event, handler, options: eventOptions } = options;

  const getTarget = (): EventTarget | null => {
    if (target && typeof target === 'object' && 'value' in target) {
      return target.value;
    }
    return target as EventTarget;
  };

  const cleanup = () => {
    const t = getTarget();
    if (t) {
      t.removeEventListener(event, handler as EventListener, eventOptions);
    }
  };

  onMounted(() => {
    const t = getTarget();
    if (t) {
      t.addEventListener(event, handler as EventListener, eventOptions);
    }
  });

  onUnmounted(cleanup);

  // Watch for target changes if it's a ref
  if (target && typeof target === 'object' && 'value' in target) {
    watch(target as Ref<EventTarget | null>, (newTarget, oldTarget) => {
      if (oldTarget) {
        oldTarget.removeEventListener(event, handler as EventListener, eventOptions);
      }
      if (newTarget) {
        newTarget.addEventListener(event, handler as EventListener, eventOptions);
      }
    });
  }

  return { cleanup };
}

/**
 * Interval options
 */
export interface IntervalOptions {
  /** Interval duration in ms */
  interval: number;
  /** Whether to start immediately */
  immediate?: boolean;
  /** Callback function */
  callback: () => void;
}

/**
 * Creates a managed interval that auto-cleans up
 * @param options Interval options
 */
export function useInterval(options: IntervalOptions): {
  start: () => void;
  stop: () => void;
  isActive: Ref<boolean>;
} {
  const { interval, immediate = false, callback } = options;
  const isActive = ref(false);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const start = () => {
    if (isActive.value) return;
    
    isActive.value = true;
    if (immediate) {
      callback();
    }
    intervalId = setInterval(callback, interval);
  };

  const stop = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    isActive.value = false;
  };

  onUnmounted(stop);

  return { start, stop, isActive };
}

/**
 * Clipboard operations composable
 */
export function useClipboard(): {
  copy: (text: string) => Promise<boolean>;
  paste: () => Promise<string>;
  isSupported: boolean;
} {
  const isSupported = typeof navigator !== 'undefined' && 'clipboard' in navigator;

  const copy = async (text: string): Promise<boolean> => {
    if (!isSupported) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        const result = document.execCommand('copy');
        document.body.removeChild(textArea);
        return result;
      } catch {
        return false;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const paste = async (): Promise<string> => {
    if (!isSupported) {
      return '';
    }

    try {
      return await navigator.clipboard.readText();
    } catch {
      return '';
    }
  };

  return { copy, paste, isSupported };
}
