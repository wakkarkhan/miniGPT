import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const authUrl = new URL('https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
    authUrl.searchParams.append('client_id', 'bed15243-e6f3-4e15-8be6-063f03ca9c5d');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('redirect_uri', 'https://enterprisegpt.stg.werifaid.com/');
    authUrl.searchParams.append('response_mode', 'query');
    authUrl.searchParams.append('scope', 'openid profile email offline_access');
    authUrl.searchParams.append('state', '12345');

    // Return the auth URL to the client
    return NextResponse.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.json({ error: 'Failed to get auth URL' }, { status: 500 });
  }
} 