import { IScraper, ScrapeOptions, ScrapeResponse } from "../domain/scraper.types";

export class ScrapeUseCase {
  constructor(private scraper: IScraper) {}

  async execute(options: ScrapeOptions): Promise<ScrapeResponse> {
    if (!options.url) throw new Error("URL is required");
    return await this.scraper.scrape(options);
  }
}
