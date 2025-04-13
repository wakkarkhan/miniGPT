import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    console.log('************ /api/auth/callback *************')
    // Forward the code to your callback API
    const response = await fetch('https://stg-llmbe.werifaid.com/auth_callback_api_auth_callback_get', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      throw new Error('Failed to get token from callback');
    }

    const data = await response.json();
    
    // Create HTML response that will post message to parent window with origin
    const html = `
      <html>
        <body>
          <script>
            // First store token in enterprisegpt.stg.werifaid.com
            fetch('https://enterprisegpt.stg.werifaid.com/store-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: '${data.access_token}' })
            }).then(() => {
              // Then send token back to parent origin
              window.parent.postMessage({ 
                type: 'AUTH_SUCCESS', 
                token: '${data.access_token}'
              }, window.location.origin);
            });
          </script>
        </body>
      </html>
    `;
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Callback error:', error);
    const errorHtml = `
      <html>
        <body>
          <script>
            // First store token in enterprisegpt.stg.werifaid.com
            fetch('https://enterprisegpt.stg.werifaid.com/store-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: '${data.access_token}' })
            }).then(() => {
              // Then send token back to parent origin
              window.parent.postMessage({ 
                type: 'AUTH_ERROR', 
                error: '${error instanceof Error ? error.message : 'Unknown error'}'
              }, window.location.origin);
            });
          </script>
        </body>
      </html>
    `;
    
    return new NextResponse(errorHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
} 