import { useState, useCallback, useEffect } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { ScrapedImage, ScrapeResult, PDFSettings } from "../../domain/material/material.types";
import { ScrapeMaterialUseCase } from "../../application/material/scrape-material.usecase";
import { GeneratePDFUseCase } from "../../application/material/generate-pdf.usecase";
import { HttpScraperService } from "../../infrastructure/material/http-scraper.service";
import { JsPDFGenerator } from "../../infrastructure/pdf/jspdf-generator.service";
import { geminiService } from "../../infrastructure/ai/gemini.service";

// Dependencies Injection
const scraperService = new HttpScraperService();
const pdfGenerator = new JsPDFGenerator();
const scrapeUseCase = new ScrapeMaterialUseCase(scraperService);
const generatePDFUseCase = new GeneratePDFUseCase(pdfGenerator);

// Keyboard shortcuts handler
function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S - Download PDF
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        // Trigger download - handled by parent
        document.dispatchEvent(new CustomEvent('keyboard:download'));
      }
      // Ctrl/Cmd + A - Select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('keyboard:selectall'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

export function useMaterialManager() {
  useKeyboardShortcuts();
  // Default URL - can be overridden via VITE_DEFAULT_URL env var
  const DEFAULT_URL = "";
  const [url, setUrl] = useState(DEFAULT_URL);
  const [images, setImages] = useState<ScrapedImage[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scrapeMode, setScrapeMode] = useState<"page" | "sequence" | null>(null);
  const [fileName, setFileName] = useState("");
  const [pdfSettings, setPdfSettings] = useState<PDFSettings>({
    format: "a4",
    orientation: "portrait",
    margin: 10,
    quality: "medium"
  });

  const handleScrape = useCallback(async (
    onScrapeSuccess?: (url: string, mode: "page" | "sequence", count: number, fileName: string, images: ScrapedImage[]) => void,
    overrideUrl?: string
  ) => {
    const targetUrl = overrideUrl || url;
    if (!targetUrl) return;

    setIsScraping(true);
    setImages([]);
    setScrapeMode(null);
    try {
      const result = await scrapeUseCase.execute(targetUrl);
      setScrapeMode(result.mode);
      setImages(result.images);
      const inferredName = inferFileName(targetUrl);
      setFileName(inferredName);
      
      if (onScrapeSuccess) {
        onScrapeSuccess(targetUrl, result.mode, result.images.length, inferredName, result.images);
      }
      
      toast.success(`Found ${result.images.length} images (${result.mode} mode)`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsScraping(false);
    }
  }, [url, scrapeUseCase]);

  const handleSuggestFileName = useCallback(async () => {
    if (images.length === 0) return;
    setIsSuggesting(true);
    try {
      const imageUrls = images.slice(0, 3).map(img => img.url);
      const suggestion = await geminiService.suggestFileName(imageUrls);
      setFileName(suggestion);
      toast.success("AI suggested a filename!");
    } catch (error: any) {
      toast.error("Failed to suggest filename");
    } finally {
      setIsSuggesting(false);
    }
  }, [images]);

  const handleDownloadPDF = useCallback(async (format: "pdf" | "zip" = "pdf") => {
    const selectedUrls = images.filter((img) => img.selected).map((img) => img.url);
    setIsGenerating(true);
    setProgress(0);
    try {
      if (format === "zip") {
        // TODO: Install jszip to enable ZIP export
        // const zip = await createZip(selectedUrls, setProgress);
        // downloadBlob(zip, `${fileName || "iai-material"}.zip`);
        // toast.success("ZIP downloaded successfully!");
        toast.error("ZIP export: Run 'npm install jszip @types/jszip' first");
      } else {
        const blob = await generatePDFUseCase.execute(selectedUrls, setProgress, pdfSettings);
        downloadBlob(blob, `${fileName || "iai-material"}.pdf`);
        toast.success("PDF generated successfully!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  }, [images, fileName, pdfSettings]);

  const handleSaveToDrive = useCallback(async () => {
    const selectedUrls = images.filter((img) => img.selected).map((img) => img.url);
    if (selectedUrls.length === 0) {
      toast.error("No images selected");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    try {
      const blob = await generatePDFUseCase.execute(selectedUrls, setProgress, pdfSettings);
      
      const uploadResponse = await fetch("/api/drive/upload", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file: await blobToBase64(blob),
          name: `${fileName || "iai-material"}.pdf`
        })
      });

      if (uploadResponse.status === 401) {
        // Need to authenticate
        const authUrlResponse = await fetch("/api/auth/google/url", { credentials: "include" });
        if (!authUrlResponse.ok) {
          const text = await authUrlResponse.text();
          throw new Error(`Auth URL error: ${text.substring(0, 100)}`);
        }
        const { url: authUrl } = await authUrlResponse.json();
        
        const authWindow = window.open(authUrl, "google_auth", "width=600,height=700");
        if (!authWindow) {
          toast.error("Popup blocked. Please allow popups.");
          return;
        }

        // Handle OAuth message with proper cleanup
        const handleMessage = async (event: MessageEvent) => {
          if (event.data?.type === "OAUTH_AUTH_SUCCESS") {
            window.removeEventListener("message", handleMessage);
            window.removeEventListener("message", handleError);
            toast.success("Authenticated! Saving to Drive...");
            handleSaveToDrive(); // Retry
          }
        };
        
        // Handle auth cancellation / closed window
        const handleError = () => {
          window.removeEventListener("message", handleMessage);
          window.removeEventListener("message", handleError);
        };
        
        window.addEventListener("message", handleMessage);
        // Timeout fallback to clean up listeners after 5 minutes
        setTimeout(() => {
          window.removeEventListener("message", handleMessage);
          window.removeEventListener("message", handleError);
        }, 5 * 60 * 1000);
      } else if (!uploadResponse.ok) {
        let errorMessage = "Failed to upload to Drive";
        const responseClone = uploadResponse.clone();
        try {
          const errorData = await uploadResponse.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          const text = await responseClone.text();
          errorMessage = `Server error (${uploadResponse.status}): ${text.substring(0, 100)}`;
        }
        throw new Error(errorMessage);
      } else {
        const data = await uploadResponse.json();
        toast.success(`Saved to Google Drive! File ID: ${data.id}`);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsGenerating(false);
    }
  }, [images, fileName, pdfSettings]);

  const toggleSelectAll = useCallback(() => {
    const allSelected = images.every((img) => img.selected);
    setImages(prev => prev.map((img) => ({ ...img, selected: !allSelected })));
  }, [images]);

  const toggleImage = useCallback((index: number) => {
    setImages(prev => prev.map((img, i) => (i === index ? { ...img, selected: !img.selected } : img)));
  }, []);

  const loadImages = useCallback((urls: string[], mode: "page" | "sequence", name: string) => {
    setScrapeMode(mode);
    setFileName(name);
    setImages(urls.map(url => ({ url, selected: true, status: "idle" })));
  }, []);

  const inferFileName = (sourceUrl: string): string => {
    try {
      const urlObj = new URL(sourceUrl);
      const parts = urlObj.pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        let name = parts[parts.length - 1];
        if (["mobile", "files", "modul"].includes(name)) name = parts[parts.length - 2] || name;
        return name.replace(/\.[^/.]+$/, "");
      }
    } catch {
      return "iai-material";
    }
    return "iai-material";
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const downloadBlob = (blob: Blob, name: string) => {
    const pdfUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return {
    url, setUrl,
    images,
    isScraping,
    isGenerating,
    isSuggesting,
    progress,
    scrapeMode,
    fileName, setFileName,
    pdfSettings, setPdfSettings,
    handleScrape,
    handleSuggestFileName,
    handleDownloadPDF,
    handleSaveToDrive,
    toggleSelectAll,
    toggleImage,
    loadImages,
    setImages
  };
}
