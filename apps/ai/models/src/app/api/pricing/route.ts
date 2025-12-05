import { NextResponse } from 'next/server';
import ModelRegistryService from '../../../lib/model-registry-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const modelId = searchParams.get('id');

  if (!modelId) {
    return NextResponse.json(
      { error: 'Model ID is required' },
      { status: 400 }
    );
  }

  try {
    const pricing = ModelRegistryService.getPricing(modelId);
    const limits = ModelRegistryService.getLimits(modelId);

    return NextResponse.json({
      modelId,
      pricing,
      limits,
    });
  } catch (error) {
    console.error('Error in pricing API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
