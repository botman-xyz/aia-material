export interface ScrapeOptions {
  url: string;
  mode: "auto" | "sequence" | "page";
}

export interface ScrapeResponse {
  images: string[];
  mode: "sequence" | "page";
}

export interface IScraper {
  scrape(options: ScrapeOptions): Promise<ScrapeResponse>;
}
