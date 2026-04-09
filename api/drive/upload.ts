import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';
import { Readable } from 'stream';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return response.status(500).json({ error: 'Google OAuth credentials are not configured in the Secrets panel.' });
  }

  const googleTokens = request.cookies.google_tokens;
  
  if (!googleTokens) {
    return response.status(401).json({ error: 'Not authenticated with Google' });
  }

  try {
    const tokens = JSON.parse(googleTokens);
    
    const appUrl = (process.env.APP_URL || '').replace(/\/$/, '');
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${appUrl}/api/auth/google/callback`
    );
    
    oauth2Client.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const fileMetadata = {
      name: request.body.name || 'scraped-material.pdf',
    };
    
    // Handle file upload - for Vercel, the file comes as base64
    const fileBuffer = request.body.file;
    if (!fileBuffer) {
      return response.status(400).json({ error: 'No file uploaded' });
    }
    
    const buffer = Buffer.from(fileBuffer, 'base64');
    
    const media = {
      mimeType: 'application/pdf',
      body: Readable.from(buffer),
    };

    const res = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });

    response.status(200).json({ id: res.data.id });
  } catch (error: any) {
    console.error('Drive Upload Error:', error);
    const message = error.response?.data?.error_description || error.message || 'Unknown Drive error';
    response.status(error.code || 500).json({ error: message });
  }
}
