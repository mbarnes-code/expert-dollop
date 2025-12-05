/**
 * PostgreSQL implementation of the Prompt Repository
 * 
 * This implements the repository pattern for data access,
 * abstracting database operations behind a clean interface.
 */

import { IPromptRepository } from '../../domain/repositories/prompt.repository.interface';
import { PromptEntity } from '../../domain/entities/prompt.entity';
import { Pool, PoolClient } from 'pg';

export interface PromptPersistence {
  id: string;
  name: string;
  description: string | null;
  content: string;
  type: string;
  project_id: string | null;
  organization_id: string | null;
  enabled: boolean;
  version: number;
  created_at: Date;
  updated_at: Date;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  projectId?: string;
  organizationId?: string;
  type?: string;
  enabled?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class PostgresPromptRepository implements IPromptRepository {
  constructor(private readonly pool: Pool) {}

  async findById(id: string): Promise<PromptEntity | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<PromptPersistence>(
        'SELECT * FROM prompts WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.toDomain(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async findByName(name: string, projectId?: string): Promise<PromptEntity | null> {
    const client = await this.pool.connect();
    try {
      const query = projectId
        ? 'SELECT * FROM prompts WHERE name = $1 AND project_id = $2'
        : 'SELECT * FROM prompts WHERE name = $1 AND project_id IS NULL';
      
      const params = projectId ? [name, projectId] : [name];
      const result = await client.query<PromptPersistence>(query, params);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.toDomain(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult<PromptEntity>> {
    const client = await this.pool.connect();
    try {
      const { page, limit, projectId, organizationId, type, enabled } = options;
      const offset = (page - 1) * limit;
      
      // Build WHERE clause dynamically
      const conditions: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;
      
      if (projectId !== undefined) {
        conditions.push(`project_id = $${paramIndex++}`);
        params.push(projectId);
      }
      
      if (organizationId !== undefined) {
        conditions.push(`organization_id = $${paramIndex++}`);
        params.push(organizationId);
      }
      
      if (type !== undefined) {
        conditions.push(`type = $${paramIndex++}`);
        params.push(type);
      }
      
      if (enabled !== undefined) {
        conditions.push(`enabled = $${paramIndex++}`);
        params.push(enabled);
      }
      
      const whereClause = conditions.length > 0 
        ? `WHERE ${conditions.join(' AND ')}`
        : '';
      
      // Get total count
      const countResult = await client.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM prompts ${whereClause}`,
        params
      );
      const total = parseInt(countResult.rows[0].count, 10);
      
      // Get paginated results
      const dataQuery = `
        SELECT * FROM prompts 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex}
      `;
      const dataResult = await client.query<PromptPersistence>(
        dataQuery,
        [...params, limit, offset]
      );
      
      const items = dataResult.rows.map(row => this.toDomain(row));
      
      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } finally {
      client.release();
    }
  }

  async findEnabledByProject(projectId: string): Promise<PromptEntity | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query<PromptPersistence>(
        'SELECT * FROM prompts WHERE project_id = $1 AND enabled = true',
        [projectId]
      );
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return this.toDomain(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async save(prompt: PromptEntity): Promise<PromptEntity> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      const persistence = this.toPersistence(prompt);
      
      const result = await client.query<PromptPersistence>(
        `INSERT INTO prompts (
          id, name, description, content, type, project_id, 
          organization_id, enabled, version, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [
          persistence.id,
          persistence.name,
          persistence.description,
          persistence.content,
          persistence.type,
          persistence.project_id,
          persistence.organization_id,
          persistence.enabled,
          persistence.version,
          persistence.created_at,
          persistence.updated_at,
        ]
      );
      
      await client.query('COMMIT');
      
      return this.toDomain(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async update(prompt: PromptEntity): Promise<PromptEntity> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      const persistence = this.toPersistence(prompt);
      
      const result = await client.query<PromptPersistence>(
        `UPDATE prompts SET 
          name = $2,
          description = $3,
          content = $4,
          type = $5,
          project_id = $6,
          organization_id = $7,
          enabled = $8,
          version = $9,
          updated_at = $10
        WHERE id = $1
        RETURNING *`,
        [
          persistence.id,
          persistence.name,
          persistence.description,
          persistence.content,
          persistence.type,
          persistence.project_id,
          persistence.organization_id,
          persistence.enabled,
          persistence.version,
          persistence.updated_at,
        ]
      );
      
      if (result.rows.length === 0) {
        throw new Error(`Prompt with id ${prompt.id} not found`);
      }
      
      await client.query('COMMIT');
      
      return this.toDomain(result.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      const result = await client.query(
        'DELETE FROM prompts WHERE id = $1',
        [id]
      );
      
      if (result.rowCount === 0) {
        throw new Error(`Prompt with id ${id} not found`);
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async disableOtherProjectPrompts(projectId: string, excludeId: string): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      await client.query(
        'UPDATE prompts SET enabled = false WHERE project_id = $1 AND id != $2',
        [projectId, excludeId]
      );
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Convert from database persistence model to domain entity
   */
  private toDomain(persistence: PromptPersistence): PromptEntity {
    return PromptEntity.fromPersistence({
      id: persistence.id,
      name: persistence.name,
      description: persistence.description || undefined,
      content: persistence.content,
      type: persistence.type,
      projectId: persistence.project_id || undefined,
      organizationId: persistence.organization_id || undefined,
      enabled: persistence.enabled,
      version: persistence.version,
      createdAt: persistence.created_at,
      updatedAt: persistence.updated_at,
    });
  }

  /**
   * Convert from domain entity to database persistence model
   */
  private toPersistence(entity: PromptEntity): PromptPersistence {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description || null,
      content: entity.content.value,
      type: entity.type.value,
      project_id: entity.projectId || null,
      organization_id: entity.organizationId || null,
      enabled: entity.enabled,
      version: entity.version,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };
  }
}
