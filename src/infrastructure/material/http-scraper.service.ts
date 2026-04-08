import { IScraperService, ScrapeResult } from "../../domain/material/material.types";

export class HttpScraperService implements IScraperService {
  async scrape(url: string): Promise<ScrapeResult> {
    const response = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, mode: "auto" }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to scrape URL");
    }

    const data = await response.json();
    return {
      mode: data.mode,
      images: data.images.map((imgUrl: string) => ({
        url: imgUrl,
        selected: true,
        status: "idle",
      })),
    };
  }
}
