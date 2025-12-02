import { Service, Container } from '@expert-dollop/n8n-di';
import { LICENSE_FEATURES, type BooleanLicenseFeature, type NumericLicenseFeature, LICENSE_QUOTAS, UNLIMITED_LICENSE_QUOTA } from '@expert-dollop/n8n-constants';

/**
 * License state interface
 */
export interface ILicenseState {
  isLicensed(): boolean;
  hasFeature(feature: BooleanLicenseFeature): boolean;
  getQuota(quota: NumericLicenseFeature): number;
  isFeatureEnabled(feature: BooleanLicenseFeature): boolean;
}

/**
 * License state service - manages license features and quotas
 * Following DDD modular monolith patterns with dependency injection
 */
@Service()
export class LicenseState implements ILicenseState {
  private licensed = false;
  private features: Set<BooleanLicenseFeature> = new Set();
  private quotas: Map<NumericLicenseFeature, number> = new Map();

  /**
   * Check if the instance is licensed
   */
  isLicensed(): boolean {
    return this.licensed;
  }

  /**
   * Set the license state
   */
  setLicensed(licensed: boolean): void {
    this.licensed = licensed;
  }

  /**
   * Check if a feature is available
   */
  hasFeature(feature: BooleanLicenseFeature): boolean {
    return this.features.has(feature);
  }

  /**
   * Enable a feature
   */
  enableFeature(feature: BooleanLicenseFeature): void {
    this.features.add(feature);
  }

  /**
   * Disable a feature
   */
  disableFeature(feature: BooleanLicenseFeature): void {
    this.features.delete(feature);
  }

  /**
   * Check if a feature is enabled (alias for hasFeature)
   */
  isFeatureEnabled(feature: BooleanLicenseFeature): boolean {
    return this.hasFeature(feature);
  }

  /**
   * Get a quota value
   */
  getQuota(quota: NumericLicenseFeature): number {
    return this.quotas.get(quota) ?? UNLIMITED_LICENSE_QUOTA;
  }

  /**
   * Set a quota value
   */
  setQuota(quota: NumericLicenseFeature, value: number): void {
    this.quotas.set(quota, value);
  }

  /**
   * Check if a quota is exceeded
   */
  isQuotaExceeded(quota: NumericLicenseFeature, currentValue: number): boolean {
    const limit = this.getQuota(quota);
    if (limit === UNLIMITED_LICENSE_QUOTA) {
      return false;
    }
    return currentValue >= limit;
  }

  /**
   * Check if the user quota is exceeded
   */
  isWithinUsersLimit(): boolean {
    return !this.isQuotaExceeded(LICENSE_QUOTAS.USERS_LIMIT, 0);
  }

  /**
   * Reset all license state
   */
  reset(): void {
    this.licensed = false;
    this.features.clear();
    this.quotas.clear();
  }
}

/**
 * Get the singleton license state instance
 */
export function getLicenseState(): LicenseState {
  return Container.get(LicenseState);
}
