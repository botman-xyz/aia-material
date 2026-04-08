import axios from "axios";
import * as cheerio from "cheerio";
import { IScraper, ScrapeOptions, ScrapeResponse } from "../domain/scraper.types";

export class IaiScraper implements IScraper {
  private userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

  async scrape(options: ScrapeOptions): Promise<ScrapeResponse> {
    const { url, mode } = options;
    let targetUrl = url;
    let sequenceMatch = targetUrl.match(/^(.*\/)(\d+)(\.[a-zA-Z0-9]+)$/);

    if (!sequenceMatch && mode === "auto" && url.includes("iaiglobal.or.id")) {
      const probed = await this.probeIaiSequence(url);
      if (probed) {
        targetUrl = probed;
        sequenceMatch = targetUrl.match(/^(.*\/)(\d+)(\.[a-zA-Z0-9]+)$/);
      }
    }

    if (mode === "sequence" || (mode === "auto" && sequenceMatch)) {
      return this.scrapeSequence(targetUrl, sequenceMatch);
    }

    return this.scrapePage(url);
  }

  private async probeIaiSequence(url: string): Promise<string | null> {
    const normalizedUrl = url.endsWith("/") ? url : url + "/";
    const probePath = `${normalizedUrl}files/mobile/1.jpg`;
    try {
      const probe = await axios.get(probePath, { timeout: 3000 });
      return probe.status === 200 ? probePath : null;
    } catch {
      return null;
    }
  }

  private async scrapeSequence(targetUrl: string, match: RegExpMatchArray | null): Promise<ScrapeResponse> {
    const baseUrl = match ? match[1] : targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);
    const startNum = parseInt(match ? match[2] : "1");
    const extension = match ? match[3] : targetUrl.substring(targetUrl.lastIndexOf('.'));
    
    const images: string[] = [];
    let currentNum = startNum;
    let failures = 0;

    while (failures < 3 && currentNum < startNum + 500) {
      const imgUrl = `${baseUrl}${currentNum}${extension}`;
      try {
        const res = await axios.get(imgUrl, { headers: { "User-Agent": this.userAgent }, timeout: 5000 });
        if (res.status === 200) {
          images.push(imgUrl);
          failures = 0;
        } else {
          failures++;
        }
      } catch {
        failures++;
      }
      currentNum++;
    }
    return { images, mode: "sequence" };
  }

  private async scrapePage(url: string): Promise<ScrapeResponse> {
    const res = await axios.get(url, { headers: { "User-Agent": this.userAgent } });
    const $ = cheerio.load(res.data);
    const images: string[] = [];

    $("img").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-original") || $(el).attr("data-lazy-src");
      if (src) {
        try {
          const abs = new URL(src, url).href;
          if (!images.includes(abs) && !abs.startsWith("data:") && !abs.includes("spacer.gif")) images.push(abs);
        } catch {}
      }
    });

    // Look for background images in style attributes
    $("[style*='background-image']").each((_, el) => {
      const style = $(el).attr("style") || "";
      const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
      if (match && match[1]) {
        try {
          const abs = new URL(match[1], url).href;
          if (!images.includes(abs) && !abs.startsWith("data:")) images.push(abs);
        } catch {}
      }
    });

    $("a").each((_, el) => {
      const href = $(el).attr("href");
      if (href && href.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
        try {
          const abs = new URL(href, url).href;
          if (!images.includes(abs)) images.push(abs);
        } catch {}
      }
    });

    return { images, mode: "page" };
  }
}
