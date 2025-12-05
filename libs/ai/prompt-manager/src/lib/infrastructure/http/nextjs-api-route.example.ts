/**
 * Example Next.js API Route Implementation for Prompt Management
 * 
 * This file serves as a template/example for implementing the prompt-manager
 * library in a Next.js application. It demonstrates:
 * - Dependency injection of the repository
 * - Request validation
 * - Error handling
 * - Response formatting
 * 
 * NOTE: This is an example implementation. In a real application, you would:
 * 1. Place this in your app's `app/api/prompts/route.ts` directory
 * 2. Configure database connection via environment variables
 * 3. Add authentication/authorization middleware
 * 4. Add rate limiting
 * 5. Add logging and monitoring
 * 6. Add OpenAPI/Swagger documentation
 */

import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import {
  PromptService,
  PostgresPromptRepository,
  CreatePromptDto,
  UpdatePromptDto,
} from '@expert-dollop/ai-prompt-manager';

// Database connection pool (in production, this should be a singleton)
// Configuration should come from environment variables
const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'expert_dollop',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Initialize repository and service
const repository = new PostgresPromptRepository(pool);
const promptService = new PromptService(repository);

/**
 * GET /api/prompts
 * List all prompts with optional filtering and pagination
 * 
 * Query parameters:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 * - projectId: string (optional)
 * - organizationId: string (optional)
 * - type: string (optional)
 * - enabled: boolean (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const projectId = searchParams.get('projectId') || undefined;
    const organizationId = searchParams.get('organizationId') || undefined;
    const type = searchParams.get('type') || undefined;
    const enabled = searchParams.get('enabled')
      ? searchParams.get('enabled') === 'true'
      : undefined;
    
    const result = await promptService.findAll({
      page,
      limit,
      projectId,
      organizationId,
      type,
      enabled,
    });
    
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/prompts
 * Create a new prompt
 * 
 * Request body:
 * {
 *   name: string (required, 1-255 chars)
 *   description?: string
 *   content: string (required, 1-10000 chars)
 *   type: 'question-answering' | 'summarization' | ... (required)
 *   projectId?: string
 *   organizationId?: string
 *   enabled?: boolean (default: false)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body (in production, use Zod or similar)
    const dto: CreatePromptDto = {
      name: body.name,
      description: body.description,
      content: body.content,
      type: body.type,
      projectId: body.projectId,
      organizationId: body.organizationId,
      enabled: body.enabled ?? false,
    };
    
    const prompt = await promptService.create(dto);
    
    return NextResponse.json(prompt, { status: 201 });
  } catch (error: any) {
    console.error('Error creating prompt:', error);
    
    // Handle validation errors
    if (error.message?.includes('Invalid') || error.message?.includes('must be')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    // Handle conflict errors
    if (error.message?.includes('already exists')) {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/prompts/[id]
 * Update an existing prompt
 * 
 * This would typically be in a separate file: app/api/prompts/[id]/route.ts
 * but shown here for completeness
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    
    const dto: UpdatePromptDto = {
      name: body.name,
      description: body.description,
      content: body.content,
      type: body.type,
      enabled: body.enabled,
    };
    
    const prompt = await promptService.update(params.id, dto);
    
    return NextResponse.json(prompt, { status: 200 });
  } catch (error: any) {
    console.error('Error updating prompt:', error);
    
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    if (error.message?.includes('Invalid') || error.message?.includes('must be')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/prompts/[id]
 * Delete a prompt
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await promptService.delete(params.id);
    
    return NextResponse.json(
      { message: 'Prompt deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting prompt:', error);
    
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Cleanup on server shutdown (for development)
if (process.env.NODE_ENV === 'development') {
  process.on('SIGTERM', async () => {
    await pool.end();
  });
}
