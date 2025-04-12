import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://stg-llmbe.werifaid.com/api/auth/login', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      redirect: 'manual'  // Add this to handle redirects manually
    });

    // Check if we got a redirect
    if (response.status === 307 || response.status === 302) {
      const location = response.headers.get('Location');
      if (!location) {
        return new NextResponse('No redirect URL found', { status: 500 });
      }
      return new NextResponse(location);
    }

    // If not a redirect, try to get JSON response
    if (!response.ok) {
      return new NextResponse('Backend request failed', { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Login API error:', error);
    return new NextResponse(`Login failed: ${error.message}`, { status: 500 });
  }
} 