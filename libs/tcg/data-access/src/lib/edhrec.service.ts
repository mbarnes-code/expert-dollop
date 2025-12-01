/**
 * EDHREC service for the TCG data access layer.
 * Provides URL generation for EDHREC resources.
 */

import { Variant } from '@space-cow-media/spellbook-client';

/**
 * Abstract base class for EDHREC services.
 */
export abstract class BaseEdhrecService {
  /**
   * Get the EDHREC URL for a combo.
   * @param variant - The combo variant
   */
  abstract getComboUrl(variant: Variant): string;

  /**
   * Get the EDHREC URL for a card.
   * @param cardName - The card name
   */
  abstract getCardUrl(cardName: string): string;
}

/**
 * EDHREC service implementation.
 */
export class EdhrecService extends BaseEdhrecService {
  private static instance: EdhrecService | null = null;
  private readonly baseUrl: string;

  private constructor(baseUrl: string = 'https://edhrec.com') {
    super();
    this.baseUrl = baseUrl;
  }

  /**
   * Get or create the singleton instance.
   */
  static getInstance(): EdhrecService {
    if (!EdhrecService.instance) {
      EdhrecService.instance = new EdhrecService();
    }
    return EdhrecService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    EdhrecService.instance = null;
  }

  /**
   * Get the EDHREC URL for a combo.
   * @param variant - The combo variant
   */
  getComboUrl(variant: Variant): string {
    return `${this.baseUrl}/combos/${variant.identity.toLowerCase()}/${variant.id}`;
  }

  /**
   * Get the EDHREC URL for a card.
   * @param cardName - The card name
   */
  getCardUrl(cardName: string): string {
    const normalizedName = cardName
      .split(' // ')[0]
      .normalize('NFD')
      .toLowerCase()
      .replaceAll(/[^a-zA-Z0-9-_+\s/]/g, '')
      .replaceAll(/\+/g, 'plus ')
      .replaceAll(/[\s/]+/g, '-');

    return `${this.baseUrl}/cards/${normalizedName}`;
  }
}

// Legacy default export for backward compatibility
const EDHRECService = {
  getComboUrl: (variant: Variant) => EdhrecService.getInstance().getComboUrl(variant),
  getCardUrl: (cardName: string) => EdhrecService.getInstance().getCardUrl(cardName),
};

export default EDHRECService;
