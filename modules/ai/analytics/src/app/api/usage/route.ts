import { NextResponse } from 'next/server';
import { analyticsService, type TokenUsage } from '../../../lib/analytics-service';

// POST /api/usage - Record new usage
export async function POST(request: Request) {
  try {
    const body: TokenUsage = await request.json();

    if (!body.model || !body.promptTokens || !body.completionTokens) {
      return NextResponse.json(
        { error: 'Invalid usage data' },
        { status: 400 }
      );
    }

    body.totalTokens = body.promptTokens + body.completionTokens;
    body.timestamp = new Date();

    const record = analyticsService.recordUsage(body);
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error('Error recording usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/usage - Get recent usage records
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');

    const records = analyticsService.getRecentRecords(limit);
    return NextResponse.json({ records, count: records.length });
  } catch (error) {
    console.error('Error getting usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
