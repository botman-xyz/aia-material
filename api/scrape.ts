import type { VercelRequest, VercelResponse } from '@vercel/node';
import { IaiScraper } from '../src/server/infrastructure/iai-scraper';
import { ScrapeUseCase } from '../src/server/application/scrape.usecase';

const scraper = new IaiScraper();
const scrapeUseCase = new ScrapeUseCase(scraper);

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const result = await scrapeUseCase.execute(request.body);
    response.status(200).json(result);
  } catch (error: any) {
    response.status(500).json({ error: error.message });
  }
}
