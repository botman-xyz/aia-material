import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const code = request.query.code as string;
  
  if (!code) {
    return response.status(400).send('No code provided');
  }
  
  try {
    const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${appUrl}/api/auth/google/callback`
    );
    
    const { tokens } = await oauth2Client.getToken(code);
    
    response.setHeader('Set-Cookie', `google_tokens=${JSON.stringify(tokens)}; HttpOnly; Secure; SameSite=None; Max-Age=${30 * 24 * 60 * 60}`);
    
    response.status(200).send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Google Auth Error:', error);
    response.status(500).send('Authentication failed: ' + (error instanceof Error ? error.message : String(error)));
  }
}
