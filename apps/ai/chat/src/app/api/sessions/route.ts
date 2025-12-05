import { NextResponse } from 'next/server';
import { chatService } from '../../../lib/chat-service';

// GET /api/sessions - Get all sessions
export async function GET() {
  try {
    const sessions = chatService.getAllSessions();
    return NextResponse.json({ sessions, count: sessions.length });
  } catch (error) {
    console.error('Error getting sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/sessions - Create new session
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const model = body.model || 'gpt-4.1-mini';
    
    const session = chatService.createSession(model);
    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
