import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  const imageUrl = request.query.url as string;
  
  if (!imageUrl) {
    return response.status(400).send('Image URL is required');
  }
  
  try {
    const responseImg = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': new URL(imageUrl).origin,
      },
    });
    
    response.setHeader('Content-Type', responseImg.headers['content-type'] || 'image/jpeg');
    response.status(200).send(responseImg.data);
  } catch {
    response.status(500).send('Failed to fetch image');
  }
}
