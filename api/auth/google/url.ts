import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google OAuth credentials are not configured.');
    }
    
    const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${appUrl}/api/auth/google/callback`
    );
    
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive.file'],
      prompt: 'consent',
    });
    
    response.status(200).json({ url });
  } catch (error: any) {
    console.error('Auth URL Generation Error:', error);
    response.status(500).json({ error: error.message });
  }
}
