import { GoogleGenAI } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  }

  async analyzeImages(images: string[], prompt: string): Promise<string> {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in the environment.");
    }

    try {
      // Limit to first 5 images for analysis to avoid token limits and keep it fast
      const selectedImages = images.slice(0, 5);
      
      const imageParts = await Promise.all(
        selectedImages.map(async (url) => {
          const base64 = await this.urlToBase64(url);
          return {
            inlineData: {
              data: base64.split(",")[1],
              mimeType: "image/jpeg",
            },
          };
        })
      );

      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            ...imageParts,
            { text: prompt },
          ],
        },
      });

      return response.text || "No analysis generated.";
    } catch (error: any) {
      console.error("Gemini Analysis Error:", error);
      throw new Error(`Failed to analyze images: ${error.message}`);
    }
  }

  async suggestFileName(images: string[]): Promise<string> {
    const prompt = "Based on these images, suggest a short, descriptive filename for this material. Return ONLY the filename without extension, e.g., 'Modul_Akuntansi_IAI'. Keep it under 30 characters.";
    const result = await this.analyzeImages(images, prompt);
    return result.trim().replace(/[^a-zA-Z0-9_-]/g, "_");
  }

  private async urlToBase64(url: string): Promise<string> {
    // We use our proxy to avoid CORS issues
    const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}

export const geminiService = new GeminiService();
