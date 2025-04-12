import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      redirect: 'manual',
    });

    // Get the redirect URL with the code
    const redirectUrl = response.headers.get('location') || response.headers.get('Location');
    if (!redirectUrl) {
      return new NextResponse('No redirect URL found', { status: 500 });
    }

    return NextResponse.json({ redirectUrl });

  } catch (error) {
    console.error('Azure login error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 