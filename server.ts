import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import express from "express";
import cors from "cors";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import { Readable } from "stream";
import { google } from "googleapis";
import cookieParser from "cookie-parser";
import multer from "multer";
import { IaiScraper } from "./src/server/infrastructure/iai-scraper";
import { ScrapeUseCase } from "./src/server/application/scrape.usecase";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple rate limiter (in-memory)
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute

function rateLimitMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = requestCounts.get(ip);
  
  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return res.status(429).json({ error: "Too many requests. Please try again later." });
  }
  
  record.count++;
  next();
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts) {
    if (now > record.resetTime) requestCounts.delete(ip);
  }
}, 5 * 60 * 1000); // Every 5 minutes

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Create Express app
const app = express();
const scraper = new IaiScraper();
const scrapeUseCase = new ScrapeUseCase(scraper);

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

// Apply rate limiting
app.use(rateLimitMiddleware);

const appUrl = (process.env.APP_URL || "").replace(/\/$/, "");

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn("GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing. Google Drive integration will not work.");
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${appUrl}/api/auth/google/callback`
);

app.get("/api/auth/google/url", (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error("Google OAuth credentials are not configured.");
    }
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/drive.file"],
      prompt: "consent",
    });
    res.json({ url });
  } catch (error: any) {
    console.error("Auth URL Generation Error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("No code provided");
  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    res.cookie("google_tokens", JSON.stringify(tokens), {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).send("Authentication failed: " + (error instanceof Error ? error.message : String(error)));
  }
});

app.post("/api/drive/upload", upload.single("file"), async (req: any, res) => {
  console.log("Drive upload request received");
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: "Google OAuth credentials are not configured in the Secrets panel." });
  }

  const tokensStr = req.cookies.google_tokens;
  if (!tokensStr) {
    console.log("No google_tokens cookie found");
    return res.status(401).json({ error: "Not authenticated with Google" });
  }

  try {
    const tokens = JSON.parse(tokensStr);
    oauth2Client.setCredentials(tokens);

    const drive = google.drive({ version: "v3", auth: oauth2Client });
    const fileMetadata = {
      name: req.body.name || "scraped-material.pdf",
    };
    
    if (!req.file || !req.file.buffer) {
      console.log("No file buffer in request");
      return res.status(400).json({ error: "No file uploaded or file buffer is empty" });
    }

    const media = {
      mimeType: "application/pdf",
      body: Readable.from(req.file.buffer),
    };

    console.log("Starting Drive file creation...");
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    console.log("Drive file created successfully:", response.data.id);
    res.json({ id: response.data.id });
  } catch (error: any) {
    console.error("Drive Upload Error:", error);
    const message = error.response?.data?.error_description || error.message || "Unknown Drive error";
    res.status(error.code || 500).json({ error: message });
  }
});

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
  
  // Validate domain to prevent abuse
  const allowedDomains = ['iaiglobal.or.id', 'web.iaiglobal.or.id'];
  try {
    const urlObj = new URL(imageUrl);
    if (!allowedDomains.includes(urlObj.hostname)) {
      return res.status(403).send("Domain not allowed");
    }
    
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Referer": urlObj.origin,
      },
    });
    
    const contentType = response.headers["content-type"] || "image/jpeg";
    res.setHeader("Content-Type", contentType);
    // Cache for 1 hour (public), vary by URL
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Vary", "url");
    res.send(response.data);
  } catch {
    res.status(500).send("Failed to fetch image");
  }
});

// API 404 handler
app.all("/api/*", (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
});

// Static files
const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));
app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));

// Global error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// Export for Vercel
export default app;

// Start server if running locally (not as Vercel function)
if (process.env.VERCEL === undefined) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}
