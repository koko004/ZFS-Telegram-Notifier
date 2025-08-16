
import { NextResponse } from 'next/server';
import { testGoogleAIConnection } from '@/services/ai-service';

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();
    const result = await testGoogleAIConnection(apiKey);
    if (result.ok) {
        return NextResponse.json(result);
    } else {
        return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('AI connection test endpoint failed:', error);
    return NextResponse.json({ ok: false, message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
