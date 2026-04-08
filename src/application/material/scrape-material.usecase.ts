import { IScraperService, ScrapeResult } from "../../domain/material/material.types";

export class ScrapeMaterialUseCase {
  constructor(private scraperService: IScraperService) {}

  async execute(url: string): Promise<ScrapeResult> {
    if (!url) throw new Error("URL is required");
    return await this.scraperService.scrape(url);
  }
}
