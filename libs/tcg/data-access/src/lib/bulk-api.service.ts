/**
 * Bulk API service for the TCG data access layer.
 * Provides access to bulk data from Commander Spellbook.
 */

const ID_MAP_URL = 'https://json.commanderspellbook.com/variant_id_map.json';

/**
 * Abstract base class for bulk API services.
 */
export abstract class BaseBulkApiService {
  /**
   * Fetch the legacy ID map.
   */
  abstract fetchLegacyMap(): Promise<Record<string, string>>;
}

/**
 * Bulk API service implementation.
 */
export class BulkApiServiceImpl extends BaseBulkApiService {
  private static instance: BulkApiServiceImpl | null = null;
  private cachedLegacyMap: Record<string, string> | null = null;

  private constructor() {
    super();
  }

  /**
   * Get or create the singleton instance.
   */
  static getInstance(): BulkApiServiceImpl {
    if (!BulkApiServiceImpl.instance) {
      BulkApiServiceImpl.instance = new BulkApiServiceImpl();
    }
    return BulkApiServiceImpl.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    if (BulkApiServiceImpl.instance) {
      BulkApiServiceImpl.instance.cachedLegacyMap = null;
    }
    BulkApiServiceImpl.instance = null;
  }

  /**
   * Fetch the legacy ID map.
   * Results are cached for performance.
   */
  async fetchLegacyMap(): Promise<Record<string, string>> {
    if (this.cachedLegacyMap) {
      return this.cachedLegacyMap;
    }
    const response = await fetch(ID_MAP_URL);
    const legacyMap: Record<string, string> = await response.json();
    this.cachedLegacyMap = legacyMap;
    return legacyMap;
  }
}

// Legacy default export for backward compatibility
const BulkApiService = {
  fetchLegacyMap: () => BulkApiServiceImpl.getInstance().fetchLegacyMap(),
};

export default BulkApiService;
