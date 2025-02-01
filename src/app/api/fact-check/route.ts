import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    // Call Jina AI grounding API
    const response = await fetch('https://g.jina.ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.JINA_API_KEY}`
      },
      body: JSON.stringify({
        statement: text
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fact check with Jina AI');
    }

    const result = await response.json();

    return NextResponse.json({
      factuality: result.data.factuality,
      isTrue: result.data.result,
      reason: result.data.reason,
      references: result.data.references
    });

  } catch (error) {
    console.error('Error in fact-check route:', error);
    return NextResponse.json(
      { error: 'Failed to perform fact check' },
      { status: 500 }
    );
  }
}
