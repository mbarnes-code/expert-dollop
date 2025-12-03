import { NextResponse } from 'next/server';
import { chatService, type ChatCompletionRequest } from '../../../lib/chat-service';

export async function POST(request: Request) {
  try {
    const body: ChatCompletionRequest = await request.json();

    if (!body.messages || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    if (!body.model) {
      body.model = 'gpt-4.1-mini'; // Default model
    }

    const response = await chatService.chat(body);

    // Record usage in analytics (if available)
    if (response.usage) {
      try {
        // Use relative URL to analytics service
        const analyticsUrl = process.env.ANALYTICS_API_URL || '/api/usage';
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                       (request.headers.get('host') ? `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}` : '');
        
        await fetch(`${baseUrl}${analyticsUrl}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: response.model,
            promptTokens: response.usage.promptTokens,
            completionTokens: response.usage.completionTokens,
            totalTokens: response.usage.totalTokens,
          }),
        });
      } catch (error) {
        // Analytics recording failed, but don't fail the chat request
        console.warn('Failed to record analytics:', error);
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
