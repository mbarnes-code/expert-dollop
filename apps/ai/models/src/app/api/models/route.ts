import { NextResponse } from 'next/server';
import ModelRegistryService from '../../../lib/model-registry-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const modelId = searchParams.get('id');
  const provider = searchParams.get('provider');
  const capability = searchParams.get('capability');

  try {
    // Get specific model
    if (modelId) {
      const model = ModelRegistryService.getModelInfo(modelId);
      if (!model.exists) {
        return NextResponse.json(
          { error: 'Model not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(model);
    }

    // Search by provider
    if (provider) {
      const models = ModelRegistryService.searchByProvider(provider);
      return NextResponse.json({ models, count: models.length });
    }

    // Search by capability
    if (capability) {
      const models = ModelRegistryService.getModelsWithCapability(capability);
      return NextResponse.json({ models, count: models.length });
    }

    // Get all models
    const models = ModelRegistryService.getAllModels();
    return NextResponse.json({ models, count: models.length });
  } catch (error) {
    console.error('Error in models API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
