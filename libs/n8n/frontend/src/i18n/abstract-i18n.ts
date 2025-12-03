/**
 * Abstract i18n patterns for Vue.js applications.
 * Provides common patterns for internationalization following DDD principles.
 */

import { ref, computed, type Ref, type ComputedRef } from 'vue';

/**
 * Locale configuration
 */
export interface ILocaleConfig {
  /** Locale code (e.g., 'en', 'de', 'fr') */
  code: string;
  /** Display name */
  name: string;
  /** Native display name */
  nativeName?: string;
  /** Text direction */
  direction?: 'ltr' | 'rtl';
  /** Fallback locale code */
  fallback?: string;
}

/**
 * Translation messages type
 */
export interface TranslationMessages {
  [key: string]: string | TranslationMessages;
}

/**
 * Interpolation values type
 */
export type InterpolationValues = Record<string, string | number | boolean>;

/**
 * Plural rules configuration
 */
export interface IPluralRules {
  /** Zero form */
  zero?: string;
  /** One form */
  one?: string;
  /** Two form */
  two?: string;
  /** Few form */
  few?: string;
  /** Many form */
  many?: string;
  /** Other form (required) */
  other: string;
}

/**
 * Date format options
 */
export interface IDateFormatOptions {
  dateStyle?: 'full' | 'long' | 'medium' | 'short';
  timeStyle?: 'full' | 'long' | 'medium' | 'short';
  year?: 'numeric' | '2-digit';
  month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
  day?: 'numeric' | '2-digit';
  hour?: 'numeric' | '2-digit';
  minute?: 'numeric' | '2-digit';
  second?: 'numeric' | '2-digit';
  weekday?: 'long' | 'short' | 'narrow';
  hour12?: boolean;
  timeZone?: string;
}

/**
 * Number format options
 */
export interface INumberFormatOptions {
  style?: 'decimal' | 'currency' | 'percent' | 'unit';
  currency?: string;
  currencyDisplay?: 'symbol' | 'narrowSymbol' | 'code' | 'name';
  unit?: string;
  unitDisplay?: 'short' | 'narrow' | 'long';
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
}

/**
 * Abstract i18n service
 */
export abstract class AbstractI18nService {
  protected currentLocale: Ref<string>;
  protected messages: Map<string, TranslationMessages> = new Map();
  protected availableLocales: ILocaleConfig[] = [];

  constructor(defaultLocale: string) {
    this.currentLocale = ref(defaultLocale);
  }

  /**
   * Get the current locale
   */
  getLocale(): string {
    return this.currentLocale.value;
  }

  /**
   * Get the current locale as a reactive ref
   */
  getLocaleRef(): Ref<string> {
    return this.currentLocale;
  }

  /**
   * Set the current locale
   * @param locale Locale code
   */
  async setLocale(locale: string): Promise<void> {
    if (!this.messages.has(locale)) {
      await this.loadLocale(locale);
    }
    this.currentLocale.value = locale;
    this.onLocaleChange(locale);
  }

  /**
   * Load locale messages
   * Override to implement locale loading
   */
  protected abstract loadLocale(locale: string): Promise<void>;

  /**
   * Called when locale changes
   * Override to add custom behavior
   */
  protected onLocaleChange(locale: string): void {
    // Update document lang attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
      const direction = this.getLocaleConfig(locale)?.direction ?? 'ltr';
      document.documentElement.dir = direction;
    }
  }

  /**
   * Register locale messages
   * @param locale Locale code
   * @param messages Translation messages
   */
  registerMessages(locale: string, messages: TranslationMessages): void {
    const existing = this.messages.get(locale) ?? {};
    this.messages.set(locale, this.mergeMessages(existing, messages));
  }

  /**
   * Merge translation messages
   */
  private mergeMessages(
    target: TranslationMessages,
    source: TranslationMessages,
  ): TranslationMessages {
    const result = { ...target };
    for (const [key, value] of Object.entries(source)) {
      if (typeof value === 'object' && typeof result[key] === 'object') {
        result[key] = this.mergeMessages(
          result[key] as TranslationMessages,
          value,
        );
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  /**
   * Translate a key
   * @param key Translation key
   * @param values Interpolation values
   */
  t(key: string, values?: InterpolationValues): string {
    const message = this.getMessage(key);
    if (!message) {
      console.warn(`[i18n] Missing translation: ${key}`);
      return key;
    }
    return this.interpolate(message, values);
  }

  /**
   * Get message by key
   */
  private getMessage(key: string): string | undefined {
    const locale = this.currentLocale.value;
    const messages = this.messages.get(locale);
    
    if (!messages) return undefined;

    const keys = key.split('.');
    let current: TranslationMessages | string = messages;
    
    for (const k of keys) {
      if (typeof current === 'string') return undefined;
      current = current[k] as TranslationMessages | string;
      if (current === undefined) {
        // Try fallback locale
        const config = this.getLocaleConfig(locale);
        if (config?.fallback) {
          return this.getMessageFromLocale(key, config.fallback);
        }
        return undefined;
      }
    }

    return typeof current === 'string' ? current : undefined;
  }

  /**
   * Get message from a specific locale
   */
  private getMessageFromLocale(key: string, locale: string): string | undefined {
    const messages = this.messages.get(locale);
    if (!messages) return undefined;

    const keys = key.split('.');
    let current: TranslationMessages | string = messages;
    
    for (const k of keys) {
      if (typeof current === 'string') return undefined;
      current = current[k] as TranslationMessages | string;
      if (current === undefined) return undefined;
    }

    return typeof current === 'string' ? current : undefined;
  }

  /**
   * Interpolate values into a message
   */
  private interpolate(message: string, values?: InterpolationValues): string {
    if (!values) return message;
    
    return message.replace(/\{(\w+)\}/g, (match, key) => {
      const value = values[key];
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Pluralize a message
   * @param key Translation key
   * @param count Count for pluralization
   * @param values Additional interpolation values
   */
  plural(key: string, count: number, values?: InterpolationValues): string {
    const rules = this.getMessage(key);
    if (!rules) {
      console.warn(`[i18n] Missing plural translation: ${key}`);
      return key;
    }

    let message: string;
    try {
      const pluralRules = JSON.parse(rules) as IPluralRules;
      message = this.selectPluralForm(count, pluralRules);
    } catch {
      // Not a plural object, use as regular message
      message = rules;
    }

    return this.interpolate(message, { ...values, count });
  }

  /**
   * Select appropriate plural form
   */
  private selectPluralForm(count: number, rules: IPluralRules): string {
    if (count === 0 && rules.zero) return rules.zero;
    if (count === 1 && rules.one) return rules.one;
    if (count === 2 && rules.two) return rules.two;
    // Add more complex plural rules as needed
    return rules.other;
  }

  /**
   * Format a date
   * @param date Date to format
   * @param options Format options
   */
  formatDate(date: Date | number | string, options?: IDateFormatOptions): string {
    const dateObj = date instanceof Date ? date : new Date(date);
    const locale = this.currentLocale.value;
    
    try {
      return new Intl.DateTimeFormat(locale, options).format(dateObj);
    } catch {
      return dateObj.toISOString();
    }
  }

  /**
   * Format a number
   * @param value Number to format
   * @param options Format options
   */
  formatNumber(value: number, options?: INumberFormatOptions): string {
    const locale = this.currentLocale.value;
    
    try {
      return new Intl.NumberFormat(locale, options).format(value);
    } catch {
      return String(value);
    }
  }

  /**
   * Format currency
   * @param value Amount
   * @param currency Currency code
   */
  formatCurrency(value: number, currency: string): string {
    return this.formatNumber(value, {
      style: 'currency',
      currency,
    });
  }

  /**
   * Format relative time
   * @param value Value
   * @param unit Time unit
   */
  formatRelativeTime(
    value: number,
    unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year',
  ): string {
    const locale = this.currentLocale.value;
    
    try {
      return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(value, unit);
    } catch {
      return `${value} ${unit}${Math.abs(value) === 1 ? '' : 's'}`;
    }
  }

  /**
   * Get available locales
   */
  getAvailableLocales(): ILocaleConfig[] {
    return this.availableLocales;
  }

  /**
   * Register available locales
   * @param locales Locale configurations
   */
  registerLocales(locales: ILocaleConfig[]): void {
    this.availableLocales = locales;
  }

  /**
   * Get locale configuration
   * @param code Locale code
   */
  getLocaleConfig(code: string): ILocaleConfig | undefined {
    return this.availableLocales.find(l => l.code === code);
  }

  /**
   * Check if a locale is available
   * @param code Locale code
   */
  isLocaleAvailable(code: string): boolean {
    return this.availableLocales.some(l => l.code === code);
  }
}

/**
 * Simple in-memory i18n service implementation
 */
export class SimpleI18nService extends AbstractI18nService {
  protected async loadLocale(_locale: string): Promise<void> {
    // Messages should be registered manually
  }
}

/**
 * Create an i18n composable from a service
 * @param service I18n service
 */
export function createI18nComposable(service: AbstractI18nService) {
  const locale = service.getLocaleRef();
  
  return {
    locale: computed(() => locale.value),
    t: (key: string, values?: InterpolationValues) => service.t(key, values),
    plural: (key: string, count: number, values?: InterpolationValues) => 
      service.plural(key, count, values),
    setLocale: (code: string) => service.setLocale(code),
    formatDate: (date: Date | number | string, options?: IDateFormatOptions) => 
      service.formatDate(date, options),
    formatNumber: (value: number, options?: INumberFormatOptions) => 
      service.formatNumber(value, options),
    formatCurrency: (value: number, currency: string) => 
      service.formatCurrency(value, currency),
    formatRelativeTime: (
      value: number,
      unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year',
    ) => service.formatRelativeTime(value, unit),
    availableLocales: service.getAvailableLocales(),
  };
}

/**
 * Extract language from browser settings
 */
export function getBrowserLanguage(): string {
  if (typeof navigator === 'undefined') return 'en';
  
  const lang = navigator.language || (navigator.languages && navigator.languages[0]);
  return lang ? lang.split('-')[0] : 'en';
}

/**
 * Extract language from URL
 * @param url URL to extract from
 * @param paramName Query parameter name
 */
export function getLanguageFromUrl(url: string, paramName = 'lang'): string | undefined {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get(paramName) ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Detect user's preferred language
 * @param availableLocales Available locale codes
 * @param defaultLocale Default locale if no match found
 */
export function detectPreferredLanguage(
  availableLocales: string[],
  defaultLocale: string,
): string {
  // Check URL first
  if (typeof window !== 'undefined') {
    const urlLang = getLanguageFromUrl(window.location.href);
    if (urlLang && availableLocales.includes(urlLang)) {
      return urlLang;
    }
  }

  // Check browser language
  const browserLang = getBrowserLanguage();
  if (availableLocales.includes(browserLang)) {
    return browserLang;
  }

  // Check for partial match (e.g., 'en' matches 'en-US')
  const partialMatch = availableLocales.find(l => 
    l.startsWith(browserLang) || browserLang.startsWith(l)
  );
  if (partialMatch) {
    return partialMatch;
  }

  return defaultLocale;
}
