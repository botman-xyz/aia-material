import express from "express";
import cors from "cors";
import axios from "axios";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { IaiScraper } from "./src/server/infrastructure/iai-scraper";
import { ScrapeUseCase } from "./src/server/application/scrape.usecase";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;
  const scraper = new IaiScraper();
  const scrapeUseCase = new ScrapeUseCase(scraper);

  app.use(cors());
  app.use(express.json());

  app.post("/api/scrape", async (req, res) => {
    try {
      const result = await scrapeUseCase.execute(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/proxy-image", async (req, res) => {
    const imageUrl = req.query.url as string;
    if (!imageUrl) return res.status(400).send("Image URL is required");
    try {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Referer": new URL(imageUrl).origin,
        },
      });
      res.setHeader("Content-Type", response.headers["content-type"] || "image/jpeg");
      res.send(response.data);
    } catch {
      res.status(500).send("Failed to fetch image");
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
