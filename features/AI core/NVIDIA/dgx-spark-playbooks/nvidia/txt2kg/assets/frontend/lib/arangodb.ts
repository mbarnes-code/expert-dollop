//
// SPDX-FileCopyrightText: Copyright (c) 1993-2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
import { Database, aql } from 'arangojs';

/**
 * ArangoDB service for database operations
 * Provides methods to connect to and interact with an ArangoDB database
 */
export class ArangoDBService {
  private db: Database | null = null;
  private static instance: ArangoDBService;
  private collectionName: string = 'entities';
  private edgeCollectionName: string = 'relationships';
  private documentsCollectionName: string = 'processed_documents';

  private constructor() {}

  /**
   * Get the singleton instance of ArangoDBService
   */
  public static getInstance(): ArangoDBService {
    if (!ArangoDBService.instance) {
      ArangoDBService.instance = new ArangoDBService();
    }
    return ArangoDBService.instance;
  }

  /**
   * Initialize the ArangoDB connection
   * @param url - ArangoDB connection URL (defaults to ARANGODB_URL env var or 'http://localhost:8529')
   * @param databaseName - ArangoDB database name (defaults to ARANGODB_DB env var or 'txt2kg')
   * @param username - ArangoDB username (defaults to ARANGODB_USER env var or 'root')
   * @param password - ArangoDB password (defaults to ARANGODB_PASSWORD env var or '')
   */
  public async initialize(url?: string, databaseName?: string, username?: string, password?: string): Promise<void> {
    // Use provided values, or environment variables, or defaults
    const connectionUrl = url || process.env.ARANGODB_URL || 'http://localhost:8529';
    const dbName = databaseName || process.env.ARANGODB_DB || 'txt2kg';
    const user = username || process.env.ARANGODB_USER || 'root';
    const pass = password || process.env.ARANGODB_PASSWORD || '';

    try {
      // Initialize the database connection
      this.db = new Database({
        url: connectionUrl,
        databaseName: dbName,
        auth: { username: user, password: pass },
      });

      // Check if database exists, create if it doesn't
      const dbExists = await this.db.exists();
      if (!dbExists) {
        console.log(`Database ${dbName} does not exist, creating it...`);
        await this.db.createDatabase(dbName);
        this.db.useDatabase(dbName);
      }

      // Check if collections exist, create if they don't
      const collections = await this.db.listCollections();
      const collectionNames = collections.map(c => c.name);

      // Create entity collection if it doesn't exist
      if (!collectionNames.includes(this.collectionName)) {
        await this.db.createCollection(this.collectionName);
        await this.db.collection(this.collectionName).ensureIndex({
          type: 'persistent',
          fields: ['name'],
          unique: true
        });
      }

      // Create edge collection if it doesn't exist
      if (!collectionNames.includes(this.edgeCollectionName)) {
        await this.db.createEdgeCollection(this.edgeCollectionName);
        await this.db.collection(this.edgeCollectionName).ensureIndex({
          type: 'persistent',
          fields: ['type']
        });
      }

      // Create documents collection if it doesn't exist
      if (!collectionNames.includes(this.documentsCollectionName)) {
        await this.db.createCollection(this.documentsCollectionName);
        await this.db.collection(this.documentsCollectionName).ensureIndex({
          type: 'persistent',
          fields: ['documentName'],
          unique: true
        });
      }

      console.log('ArangoDB initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ArangoDB:', error);
      throw error;
    }
  }

  /**
   * Check if the database connection is initialized
   */
  public isInitialized(): boolean {
    return this.db !== null;
  }

  /**
   * Close the ArangoDB connection
   */
  public close(): void {
    if (this.db) {
      this.db = null;
      console.log('ArangoDB connection closed');
    }
  }

  /**
   * Execute an AQL query
   * @param query - AQL query string
   * @param bindVars - Parameters for the query
   * @returns Promise resolving to query results
   */
  public async executeQuery(query: string, bindVars: Record<string, any> = {}): Promise<any[]> {
    if (!this.db) {
      throw new Error('ArangoDB connection not initialized. Call initialize() first.');
    }

    try {
      const cursor = await this.db.query(query, bindVars);
      return await cursor.all();
    } catch (error) {
      console.error('Error executing ArangoDB query:', error);
      throw error;
    }
  }

  /**
   * Create a node in the graph database
   * @param properties - Node properties
   * @returns Promise resolving to the created node
   */
  public async createNode(properties: Record<string, any>): Promise<any> {
    if (!this.db) {
      throw new Error('ArangoDB connection not initialized. Call initialize() first.');
    }

    try {
      const collection = this.db.collection(this.collectionName);
      return await collection.save(properties);
    } catch (error) {
      console.error('Error creating node in ArangoDB:', error);
      throw error;
    }
  }

  /**
   * Create a relationship between two nodes
   * @param fromKey - Key of the start node
   * @param toKey - Key of the end node
   * @param relationType - Type of relationship
   * @param properties - Relationship properties
   * @returns Promise resolving to the created relationship
   */
  public async createRelationship(
    fromKey: string,
    toKey: string,
    relationType: string,
    properties: Record<string, any> = {}
  ): Promise<any> {
    if (!this.db) {
      throw new Error('ArangoDB connection not initialized. Call initialize() first.');
    }

    try {
      const edgeCollection = this.db.collection(this.edgeCollectionName);
      const edgeData = {
        _from: `${this.collectionName}/${fromKey}`,
        _to: `${this.collectionName}/${toKey}`,
        type: relationType,
        ...properties
      };
      return await edgeCollection.save(edgeData);
    } catch (error) {
      console.error('Error creating relationship in ArangoDB:', error);
      throw error;
    }
  }

  /**
   * Import triples (subject, predicate, object) into the graph database
   * @param triples - Array of triples to import
   * @returns Promise resolving when import is complete
   */
  public async importTriples(triples: { subject: string; predicate: string; object: string }[]): Promise<void> {
    if (!this.db) {
      throw new Error('ArangoDB connection not initialized. Call initialize() first.');
    }

    try {
      // Process triples in batches to improve performance
      for (const triple of triples) {
        // Normalize triple values
        const normalizedSubject = triple.subject.trim();
        const normalizedPredicate = triple.predicate.trim();
        const normalizedObject = triple.object.trim();
        
        // Skip invalid triples
        if (!normalizedSubject || !normalizedPredicate || !normalizedObject) {
          console.warn('Skipping invalid triple:', triple);
          continue;
        }
        
        // Upsert subject and object nodes
        const subjectNode = await this.upsertEntity(normalizedSubject);
        const objectNode = await this.upsertEntity(normalizedObject);
        
        // Check if relationship already exists
        const existingEdges = await this.executeQuery(
          `FOR e IN ${this.edgeCollectionName} 
           FILTER e._from == @from AND e._to == @to AND e.type == @type 
           RETURN e`,
          { 
            from: `${this.collectionName}/${subjectNode._key}`, 
            to: `${this.collectionName}/${objectNode._key}`, 
            type: normalizedPredicate 
          }
        );
        
        // Create relationship if it doesn't exist
        if (existingEdges.length === 0) {
          await this.createRelationship(
            subjectNode._key,
            objectNode._key,
            normalizedPredicate
          );
        }
      }
      
      console.log(`Successfully imported ${triples.length} triples into ArangoDB`);
    } catch (error) {
      console.error('Error importing triples into ArangoDB:', error);
      throw error;
    }
  }

  /**
   * Helper method to upsert (create or update) an entity
   * @param name - Entity name
   * @returns Promise resolving to the entity
   */
  private async upsertEntity(name: string): Promise<any> {
    const collection = this.db!.collection(this.collectionName);
    
    // Look for existing entity
    const existing = await this.executeQuery(
      `FOR e IN ${this.collectionName} FILTER e.name == @name RETURN e`,
      { name }
    );
    
    if (existing.length > 0) {
      return existing[0];
    }
    
    // Create new entity
    return await collection.save({ name });
  }

  /**
   * Check if a document has already been processed and stored in ArangoDB
   * @param documentName - Name of the document to check
   * @returns Promise resolving to true if document exists, false otherwise
   */
  public async isDocumentProcessed(documentName: string): Promise<boolean> {
    if (!this.db) {
      throw new Error('ArangoDB connection not initialized. Call initialize() first.');
    }

    try {
      const existing = await this.executeQuery(
        `FOR d IN ${this.documentsCollectionName} FILTER d.documentName == @documentName RETURN d`,
        { documentName }
      );
      return existing.length > 0;
    } catch (error) {
      console.error('Error checking if document is processed:', error);
      return false;
    }
  }

  /**
   * Mark a document as processed in ArangoDB
   * @param documentName - Name of the document
   * @param tripleCount - Number of triples stored for this document
   * @returns Promise resolving when the document is marked as processed
   */
  public async markDocumentAsProcessed(documentName: string, tripleCount: number): Promise<void> {
    if (!this.db) {
      throw new Error('ArangoDB connection not initialized. Call initialize() first.');
    }

    try {
      const collection = this.db.collection(this.documentsCollectionName);
      await collection.save({
        documentName,
        tripleCount,
        processedAt: new Date().toISOString()
      });
      console.log(`Marked document "${documentName}" as processed with ${tripleCount} triples`);
    } catch (error) {
      // If error is due to unique constraint (document already exists), update it instead
      if (error && typeof error === 'object' && 'errorNum' in error && error.errorNum === 1210) {
        console.log(`Document "${documentName}" already exists, updating...`);
        await this.executeQuery(
          `FOR d IN ${this.documentsCollectionName} 
           FILTER d.documentName == @documentName 
           UPDATE d WITH { tripleCount: @tripleCount, processedAt: @processedAt } IN ${this.documentsCollectionName}`,
          { 
            documentName, 
            tripleCount,
            processedAt: new Date().toISOString()
          }
        );
      } else {
        console.error('Error marking document as processed:', error);
        throw error;
      }
    }
  }

  /**
   * Get all processed documents from ArangoDB
   * @returns Promise resolving to array of processed document names
   */
  public async getProcessedDocuments(): Promise<string[]> {
    if (!this.db) {
      throw new Error('ArangoDB connection not initialized. Call initialize() first.');
    }

    try {
      const documents = await this.executeQuery(
        `FOR d IN ${this.documentsCollectionName} RETURN d.documentName`
      );
      return documents;
    } catch (error) {
      console.error('Error getting processed documents:', error);
      return [];
    }
  }

  /**
   * Get graph data in a format compatible with the existing application
   * @returns Promise resolving to nodes and relationships
   */
  public async getGraphData(): Promise<{ 
    nodes: Array<{ 
      id: string; 
      labels: string[]; 
      [key: string]: any 
    }>; 
    relationships: Array<{ 
      id: string; 
      source: string; 
      target: string; 
      type: string; 
      [key: string]: any 
    }>; 
  }> {
    if (!this.db) {
      throw new Error('ArangoDB connection not initialized. Call initialize() first.');
    }

    try {
      // Get all entities (nodes)
      const entities = await this.executeQuery(
        `FOR e IN ${this.collectionName} RETURN e`
      );
      
      // Get all relationships (edges)
      const relationships = await this.executeQuery(
        `FOR r IN ${this.edgeCollectionName} RETURN r`
      );
      
      // Build id to key mapping for relationships
      const idToKey = new Map<string, string>();
      for (const entity of entities) {
        idToKey.set(entity._id, entity._key);
      }
      
      // Format nodes in a way compatible with the application
      const nodes = entities.map(entity => ({
        id: entity._key,
        labels: ['Entity'],
        name: entity.name,
        ...entity
      }));
      
      // Format relationships in a way compatible with the application
      const formattedRelationships = relationships.map(rel => {
        // Extract the entity keys from _from and _to
        const source = rel._from.split('/')[1];
        const target = rel._to.split('/')[1];
        
        return {
          id: rel._key,
          source,
          target,
          type: rel.type,
          ...rel
        };
      });
      
      return {
        nodes,
        relationships: formattedRelationships
      };
    } catch (error) {
      console.error('Error getting graph data from ArangoDB:', error);
      throw error;
    }
  }

  /**
   * Log query information and metrics
   */
  public async logQuery(
    query: string, 
    queryMode: 'traditional' | 'vector-search' | 'pure-rag',
    metrics: {
      executionTimeMs: number;
      relevanceScore?: number;
      precision?: number;
      recall?: number;
      resultCount: number;
    }
  ): Promise<void> {
    if (!this.db) {
      throw new Error('ArangoDB connection not initialized. Call initialize() first.');
    }

    try {
      // Create a queryLogs collection if it doesn't exist
      const collections = await this.db.listCollections();
      const collectionNames = collections.map(c => c.name);
      
      if (!collectionNames.includes('queryLogs')) {
        await this.db.createCollection('queryLogs');
      }
      
      // Store query log
      const queryLog = {
        query,
        queryMode,
        metrics,
        timestamp: new Date().toISOString()
      };
      
      await this.db.collection('queryLogs').save(queryLog);
    } catch (error) {
      console.error('Error logging query to ArangoDB:', error);
      // We don't want to throw here as query logging is non-critical
      console.error('Query logging failed but continuing execution');
    }
  }

  /**
   * Get query logs
   * @param limit - Maximum number of logs to retrieve
   * @returns Promise resolving to query logs
   */
  public async getQueryLogs(limit: number = 100): Promise<any[]> {
    if (!this.db) {
      throw new Error('ArangoDB connection not initialized. Call initialize() first.');
    }

    try {
      // Check if queryLogs collection exists
      const collections = await this.db.listCollections();
      const collectionNames = collections.map(c => c.name);
      
      if (!collectionNames.includes('queryLogs')) {
        return [];
      }
      
      // Get logs sorted by timestamp
      const logs = await this.executeQuery(
        `FOR l IN queryLogs SORT l.timestamp DESC LIMIT @limit RETURN l`,
        { limit }
      );
      
      return logs;
    } catch (error) {
      console.error('Error getting query logs from ArangoDB:', error);
      return [];
    }
  }

  /**
   * Perform graph traversal to find relevant triples using ArangoDB's native graph capabilities
   * @param keywords - Array of keywords to search for
   * @param maxDepth - Maximum traversal depth (default: 2)
   * @param maxResults - Maximum number of results to return (default: 100)
   * @returns Promise resolving to array of triples with relevance scores
   */
  public async graphTraversal(
    keywords: string[],
    maxDepth: number = 2,
    maxResults: number = 100
  ): Promise<Array<{
    subject: string;
    predicate: string;
    object: string;
    confidence: number;
    depth?: number;
  }>> {
    console.log(`[ArangoDB] graphTraversal called with keywords: ${keywords.join(', ')}`);

    if (!this.db) {
      throw new Error('ArangoDB connection not initialized. Call initialize() first.');
    }

    try {
      // Build case-insensitive keyword matching conditions
      const keywordConditions = keywords
        .filter(kw => kw.length > 2)  // Filter short words
        .map(kw => kw.toLowerCase());

      if (keywordConditions.length === 0) {
        return [];
      }

      // AQL query that:
      // 1. Finds seed nodes matching keywords
      // 2. Performs graph traversal from those nodes
      // 3. Scores results based on keyword matches and depth
      const query = `
        // Find all entities matching keywords (case-insensitive)
        LET seedNodes = (
          FOR entity IN ${this.collectionName}
            LET lowerName = LOWER(entity.name)
            LET matches = (
              FOR keyword IN @keywords
                FILTER CONTAINS(lowerName, keyword)
                RETURN 1
            )
            FILTER LENGTH(matches) > 0
            RETURN {
              node: entity,
              matchCount: LENGTH(matches)
            }
        )

        // Perform graph traversal from seed nodes
        // Multi-hop: Extract ALL edges in each path, not just the final edge
        LET traversalResults = (
          FOR seed IN seedNodes
            FOR v, e, p IN 0..@maxDepth ANY seed.node._id ${this.edgeCollectionName}
              OPTIONS {uniqueVertices: 'global', bfs: true}
              FILTER e != null

              // Extract all edges from the path for multi-hop context
              LET pathEdges = (
                FOR edgeIdx IN 0..(LENGTH(p.edges) - 1)
                  LET pathEdge = p.edges[edgeIdx]
                  LET subjectEntity = DOCUMENT(pathEdge._from)
                  LET objectEntity = DOCUMENT(pathEdge._to)
                  LET subjectLower = LOWER(subjectEntity.name)
                  LET objectLower = LOWER(objectEntity.name)
                  LET predicateLower = LOWER(pathEdge.type)

                  // Calculate score for this edge
                  LET subjectMatches = (
                    FOR kw IN @keywords
                      FILTER CONTAINS(subjectLower, kw)
                      LET isExact = (subjectLower == kw)
                      RETURN isExact ? 1000 : (LENGTH(kw) * LENGTH(kw))
                  )
                  LET objectMatches = (
                    FOR kw IN @keywords
                      FILTER CONTAINS(objectLower, kw)
                      LET isExact = (objectLower == kw)
                      RETURN isExact ? 1000 : (LENGTH(kw) * LENGTH(kw))
                  )
                  LET predicateMatches = (
                    FOR kw IN @keywords
                      FILTER CONTAINS(predicateLower, kw)
                      LET isExact = (predicateLower == kw)
                      RETURN isExact ? 50 : (LENGTH(kw) * LENGTH(kw))
                  )

                  LET totalScore = SUM(subjectMatches) + SUM(objectMatches) + SUM(predicateMatches)

                  // Depth penalty (edges earlier in path get slight boost)
                  LET depthPenalty = 1.0 / (1.0 + (edgeIdx * 0.1))

                  LET confidence = MIN([totalScore * depthPenalty / 1000.0, 1.0])

                  FILTER confidence > 0

                  RETURN {
                    subject: subjectEntity.name,
                    predicate: pathEdge.type,
                    object: objectEntity.name,
                    confidence: confidence,
                    depth: edgeIdx,
                    _edgeId: pathEdge._id,
                    pathLength: LENGTH(p.edges)
                  }
              )

              // Return all edges from this path
              FOR pathTriple IN pathEdges
                RETURN pathTriple
        )

        // Remove duplicates by edge ID and sort by confidence
        LET uniqueResults = (
          FOR result IN traversalResults
            COLLECT edgeId = result._edgeId INTO groups
            LET best = FIRST(
              FOR g IN groups
                SORT g.result.confidence DESC
                RETURN g.result
            )
            RETURN best
        )

        // Sort by confidence and limit results
        FOR result IN uniqueResults
          SORT result.confidence DESC, result.depth ASC
          LIMIT @maxResults
          RETURN {
            subject: result.subject,
            predicate: result.predicate,
            object: result.object,
            confidence: result.confidence,
            depth: result.depth,
            pathLength: result.pathLength
          }
      `;

      console.log(`[ArangoDB] Executing query with ${keywordConditions.length} keywords`);

      const results = await this.executeQuery(query, {
        keywords: keywordConditions,
        maxDepth,
        maxResults
      });

      console.log(`[ArangoDB] Multi-hop graph traversal found ${results.length} triples for keywords: ${keywords.join(', ')}`);

      // Log top 10 results with confidence scores
      if (results.length > 0) {
        console.log('[ArangoDB] Top 10 triples by confidence (multi-hop):');
        results.slice(0, 10).forEach((triple: any, idx: number) => {
          const pathInfo = triple.pathLength ? ` path=${triple.pathLength}` : '';
          console.log(`  ${idx + 1}. [conf=${triple.confidence?.toFixed(3)}] ${triple.subject} -> ${triple.predicate} -> ${triple.object} (depth=${triple.depth}${pathInfo})`);
        });
      } else {
        console.log('[ArangoDB] No triples found!');
      }

      return results;
    } catch (error) {
      console.error('Error performing graph traversal in ArangoDB:', error);
      throw error;
    }
  }

  /**
   * Get basic info about the ArangoDB connection
   */
  public getDriverInfo(): Record<string, any> {
    if (!this.db) {
      return { status: 'not connected' };
    }

    return {
      status: 'connected',
      url: this.db.url,
      database: this.db.name
    };
  }

  /**
   * Clear all data from the graph database
   * @returns Promise resolving when all collections are cleared
   */
  public async clearDatabase(): Promise<void> {
    if (!this.db) {
      throw new Error('ArangoDB connection not initialized. Call initialize() first.');
    }

    try {
      // Truncate the entities collection (nodes)
      await this.db.collection(this.collectionName).truncate();
      
      // Truncate the relationships collection (edges)
      await this.db.collection(this.edgeCollectionName).truncate();
      
      // Also clear query logs if they exist
      const collections = await this.db.listCollections();
      const collectionNames = collections.map(c => c.name);
      
      if (collectionNames.includes('queryLogs')) {
        await this.db.collection('queryLogs').truncate();
      }
      
      console.log('ArangoDB database cleared successfully');
    } catch (error) {
      console.error('Error clearing ArangoDB database:', error);
      throw error;
    }
  }
} 