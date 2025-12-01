/**
 * Theme management utilities for the modular monolith.
 * Provides dark/light/system theme support.
 */

/** Light theme constant */
export const LIGHT_THEME = 'light';
/** Dark theme constant */
export const DARK_THEME = 'dark';
/** System preference theme constant */
export const SYSTEM_THEME = 'system';
/** Cookie name for theme preference storage */
export const THEME_COOKIE_NAME = 'theme';

/** Theme type for type safety */
export type Theme = typeof LIGHT_THEME | typeof DARK_THEME | typeof SYSTEM_THEME;

/**
 * Abstract base class for theme services.
 * Provides common theme management functionality.
 */
export abstract class BaseThemeService {
  protected currentTheme: Theme = SYSTEM_THEME;

  /**
   * Get the current theme.
   */
  getTheme(): Theme {
    return this.currentTheme;
  }

  /**
   * Check if dark mode is active based on theme and system preference.
   */
  protected isDarkModeActive(theme: Theme): boolean {
    if (theme === DARK_THEME) {
      return true;
    }
    if (theme === LIGHT_THEME) {
      return false;
    }
    // System theme - check media query
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }

  /**
   * Apply theme to document.
   * @param theme - The theme to apply
   * @returns Cleanup function to remove event listeners
   */
  abstract applyTheme(theme: Theme): () => void;

  /**
   * Save theme preference.
   * @param theme - The theme to save
   */
  abstract saveTheme(theme: Theme): void;

  /**
   * Load theme preference.
   */
  abstract loadTheme(): Theme;
}

/**
 * DOM-based theme service implementation.
 * Applies themes by toggling CSS classes on document element.
 */
export class DomThemeService extends BaseThemeService {
  private static instance: DomThemeService | null = null;

  private constructor() {
    super();
  }

  /**
   * Get or create the singleton instance.
   */
  static getInstance(): DomThemeService {
    if (!DomThemeService.instance) {
      DomThemeService.instance = new DomThemeService();
    }
    return DomThemeService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    DomThemeService.instance = null;
  }

  /**
   * Apply theme to document.
   * @param theme - The theme to apply
   * @returns Cleanup function to remove event listeners
   */
  applyTheme(theme: Theme): () => void {
    this.currentTheme = theme;
    const dark = this.isDarkModeActive(theme);
    document.documentElement.classList.toggle(DARK_THEME, dark);
    
    if (theme !== SYSTEM_THEME) {
      return () => {};
    }

    function listenToMediaChange(event: MediaQueryListEvent) {
      document.documentElement.classList.toggle(DARK_THEME, event.matches);
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', listenToMediaChange);

    return () => {
      mediaQuery.removeEventListener('change', listenToMediaChange);
    };
  }

  /**
   * Save theme preference to localStorage.
   * @param theme - The theme to save
   */
  saveTheme(theme: Theme): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_COOKIE_NAME, theme);
    }
  }

  /**
   * Load theme preference from localStorage.
   */
  loadTheme(): Theme {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(THEME_COOKIE_NAME);
      if (stored === LIGHT_THEME || stored === DARK_THEME || stored === SYSTEM_THEME) {
        return stored;
      }
    }
    return SYSTEM_THEME;
  }
}

// Legacy functional export for backward compatibility
export function applyTheme(theme: string): () => void {
  const service = DomThemeService.getInstance();
  return service.applyTheme(theme as Theme);
}
