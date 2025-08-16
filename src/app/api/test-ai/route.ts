import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ message: 'API key is required' }, { status: 400 });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'test'
          }]
        }]
      })
    });

    if (response.ok) {
      return NextResponse.json({ message: 'API key is valid' }, { status: 200 });
    } else {
      const error = await response.json();
      return NextResponse.json({ message: error.error.message || 'Invalid API key or network issue' }, { status: response.status });
    }
  } catch (error: any) {
    console.error('AI connection test failed:', error);
    return NextResponse.json({ message: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}