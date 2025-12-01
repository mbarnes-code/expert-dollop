/**
 * Cube Cobra API Service for cube data.
 * Provides methods for fetching cube lists and metadata from Cube Cobra.
 */

import { BaseApiService } from '../../base-api.service';
import { ScryfallApiService } from '../scryfall/scryfall-api.service';
import { CubeCobraCube } from './types';

/**
 * Cube Cobra configuration.
 */
export const CUBE_COBRA_CONFIG = {
  apiURL: 'https://cubecobra.com/cube/api',
  cubeLinkPattern: /cubecobra.com\/.*\/(?<cubeID>[a-zA-Z0-9-_]+?)($|\?)/i,
  cubeIDPattern: /^[a-zA-Z0-9-_]+$/,
} as const;

/**
 * Cube Cobra API Service.
 * Provides methods for interacting with Cube Cobra.
 */
export class CubeCobraService extends BaseApiService {
  private static instance: CubeCobraService | null = null;

  constructor() {
    super(CUBE_COBRA_CONFIG.apiURL);
  }

  /**
   * Get singleton instance of the service.
   */
  static getInstance(): CubeCobraService {
    if (!CubeCobraService.instance) {
      CubeCobraService.instance = new CubeCobraService();
    }
    return CubeCobraService.instance;
  }

  /**
   * Reset the singleton instance (useful for testing).
   */
  static resetInstance(): void {
    CubeCobraService.instance = null;
  }

  /**
   * Extract cube ID from a Cube Cobra URL or return the ID if already provided.
   */
  cubeIDFromLink(cubeLink: string | null): string | null {
    const trimmedLink = cubeLink?.trim();

    if (trimmedLink == null || trimmedLink.length === 0) {
      return null;
    }

    if (CUBE_COBRA_CONFIG.cubeIDPattern.test(trimmedLink)) {
      return trimmedLink;
    }

    return trimmedLink.match(CUBE_COBRA_CONFIG.cubeLinkPattern)?.groups?.cubeID ?? null;
  }

  /**
   * Get the URL for a cube's overview page.
   */
  urlForCube(cubeID: string): string {
    return `https://cubecobra.com/cube/overview/${cubeID}`;
  }

  /**
   * Fetch the list of card names in a cube.
   */
  async fetchCubeList(cubeID: string): Promise<string[]> {
    const url = `${CUBE_COBRA_CONFIG.apiURL}/cubelist/${cubeID}`;
    const response = await fetch(url);
    const text = await response.text();
    return text.split('\n').filter((line) => line.trim().length > 0);
  }

  /**
   * Fetch the complete cube data as JSON.
   */
  async fetchCube(cubeID: string): Promise<CubeCobraCube> {
    const url = `${CUBE_COBRA_CONFIG.apiURL}/cubeJSON/${cubeID}`;
    const response = await fetch(url);
    return response.json();
  }

  /**
   * Fetch Scryfall card data for all cards in a cube.
   */
  async fetchCubeCards(cubeID: string) {
    const cube = await this.fetchCube(cubeID);

    if (!cube?.cards || !cube?.id) {
      return null;
    }

    const ids = cube.cards.mainboard.map((card) => card.cardID);
    const scryfallService = ScryfallApiService.getInstance();

    return scryfallService.fetchCollection(ids.map((id) => ({ id })));
  }
}
