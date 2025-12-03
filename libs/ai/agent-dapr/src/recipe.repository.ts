/**
 * DAPR Recipe Repository Implementation
 * 
 * Phase 3: Backend Service Migration
 * Implements RecipeRepository using DAPR state store
 */

import { DaprClient } from '@dapr/dapr';
import type {
  Recipe,
  RecipeRepository,
} from '@expert-dollop/ai/agent-interface';

const DAPR_STATE_STORE = 'statestore-goose';
const RECIPE_PREFIX = 'recipe:';

export class DaprRecipeRepository implements RecipeRepository {
  private daprClient: DaprClient;

  constructor(daprClient?: DaprClient) {
    this.daprClient = daprClient || new DaprClient();
  }

  /**
   * Save a recipe to DAPR state store
   */
  async save(recipe: Recipe): Promise<void> {
    const key = `${RECIPE_PREFIX}${recipe.id}`;
    
    await this.daprClient.state.save(DAPR_STATE_STORE, [
      {
        key,
        value: recipe,
      },
    ]);

    // Add to name index for findByName
    await this.addToNameIndex(recipe.name, recipe.id!);
  }

  /**
   * Find a recipe by ID
   */
  async findById(id: string): Promise<Recipe | null> {
    const key = `${RECIPE_PREFIX}${id}`;
    
    const result = await this.daprClient.state.get(DAPR_STATE_STORE, key);
    
    if (!result) {
      return null;
    }

    return result as Recipe;
  }

  /**
   * Find recipes by name
   */
  async findByName(name: string): Promise<Recipe[]> {
    const indexKey = `recipe:name:${name}`;
    const recipeIds = await this.daprClient.state.get(DAPR_STATE_STORE, indexKey) as string[] || [];
    
    const recipes: Recipe[] = [];
    for (const id of recipeIds) {
      const recipe = await this.findById(id);
      if (recipe) {
        recipes.push(recipe);
      }
    }

    return recipes;
  }

  /**
   * List recipes with optional filters
   */
  async list(options?: {
    limit?: number;
    offset?: number;
    category?: string;
    tags?: string[];
  }): Promise<Recipe[]> {
    // Get all recipe IDs from index
    const indexKey = 'recipes:index';
    const index = await this.daprClient.state.get(DAPR_STATE_STORE, indexKey) as string[] || [];
    
    const limit = options?.limit || 100;
    const offset = options?.offset || 0;
    
    const recipeIds = index.slice(offset, offset + limit);
    
    const recipes: Recipe[] = [];
    for (const id of recipeIds) {
      const recipe = await this.findById(id);
      if (recipe) {
        // Apply filters
        if (options?.category && recipe.metadata?.category !== options.category) {
          continue;
        }
        
        if (options?.tags && options.tags.length > 0) {
          const recipeTags = recipe.metadata?.tags || [];
          const hasAllTags = options.tags.every(tag => recipeTags.includes(tag));
          if (!hasAllTags) {
            continue;
          }
        }
        
        recipes.push(recipe);
      }
    }

    return recipes;
  }

  /**
   * Delete a recipe
   */
  async delete(id: string): Promise<void> {
    const recipe = await this.findById(id);
    const key = `${RECIPE_PREFIX}${id}`;
    
    await this.daprClient.state.delete(DAPR_STATE_STORE, key);
    
    // Remove from index
    const indexKey = 'recipes:index';
    const index = await this.daprClient.state.get(DAPR_STATE_STORE, indexKey) as string[] || [];
    const updatedIndex = index.filter(rid => rid !== id);
    
    await this.daprClient.state.save(DAPR_STATE_STORE, [
      {
        key: indexKey,
        value: updatedIndex,
      },
    ]);

    // Remove from name index
    if (recipe) {
      await this.removeFromNameIndex(recipe.name, id);
    }
  }

  /**
   * Update a recipe
   */
  async update(id: string, updates: Partial<Recipe>): Promise<void> {
    const existing = await this.findById(id);
    
    if (!existing) {
      throw new Error(`Recipe ${id} not found`);
    }

    const updated: Recipe = {
      ...existing,
      ...updates,
      id: existing.id, // Don't allow ID changes
      updatedAt: new Date(),
    };

    await this.save(updated);
  }

  /**
   * Helper: Add recipe to name index
   */
  private async addToNameIndex(name: string, id: string): Promise<void> {
    const indexKey = `recipe:name:${name}`;
    const index = await this.daprClient.state.get(DAPR_STATE_STORE, indexKey) as string[] || [];
    
    if (!index.includes(id)) {
      index.push(id);
      await this.daprClient.state.save(DAPR_STATE_STORE, [
        {
          key: indexKey,
          value: index,
        },
      ]);
    }

    // Also add to main index
    const mainIndexKey = 'recipes:index';
    const mainIndex = await this.daprClient.state.get(DAPR_STATE_STORE, mainIndexKey) as string[] || [];
    
    if (!mainIndex.includes(id)) {
      mainIndex.push(id);
      await this.daprClient.state.save(DAPR_STATE_STORE, [
        {
          key: mainIndexKey,
          value: mainIndex,
        },
      ]);
    }
  }

  /**
   * Helper: Remove recipe from name index
   */
  private async removeFromNameIndex(name: string, id: string): Promise<void> {
    const indexKey = `recipe:name:${name}`;
    const index = await this.daprClient.state.get(DAPR_STATE_STORE, indexKey) as string[] || [];
    const updatedIndex = index.filter(rid => rid !== id);
    
    await this.daprClient.state.save(DAPR_STATE_STORE, [
      {
        key: indexKey,
        value: updatedIndex,
      },
    ]);
  }
}
