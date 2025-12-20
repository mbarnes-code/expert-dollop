import { NextResponse } from 'next/server';
import { analyticsService } from '../../../lib/analytics-service';

export async function GET() {
  try {
    const stats = analyticsService.getStats();
    const topModels = analyticsService.getTopModels(10);

    return NextResponse.json({
      stats,
      topModels,
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
