import { useCallback } from "react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useMaterialManager } from "../hooks/use-material-manager";
import { useAuth, useHistory } from "../hooks/use-firebase";
import { MainLayout } from "../templates/main-layout";
import { ControlPanel } from "../organisms/control-panel";
import { ImageGrid } from "../organisms/image-grid";
import { HistoryPanel } from "../organisms/history-panel";
import { AIAnalysisPanel } from "../organisms/ai-analysis-panel";
import { PDFSettingsPanel } from "../organisms/pdf-settings-panel";
import { AuthSection } from "../molecules/auth-section";
import { HistoryItem } from "../../infrastructure/history/history.repository";

export function HomePage() {
  const { user, loading, login, logout } = useAuth();
  const { history, addToHistory, deleteFromHistory } = useHistory(user?.uid);
  
  const {
    url, setUrl,
    images,
    isScraping,
    isGenerating,
    progress,
    scrapeMode,
    fileName, setFileName,
    pdfSettings, setPdfSettings,
    handleScrape,
    handleDownloadPDF,
    toggleSelectAll,
    toggleImage,
    loadImages,
    setImages
  } = useMaterialManager();

  const selectedImageUrls = images.filter(img => img.selected).map(img => img.url);

  const onScrapeSuccess = useCallback((scrapedUrl: string, mode: "page" | "sequence", count: number, name: string, scrapedImages: { url: string }[]) => {
    if (user) {
      const imageUrls = scrapedImages.map(img => img.url);
      addToHistory({ url: scrapedUrl, mode, imageCount: count, fileName: name, images: imageUrls });
    }
  }, [user, addToHistory]);

  const handleHistorySelect = (item: HistoryItem) => {
    setUrl(item.url);
    if (item.images && item.images.length > 0) {
      loadImages(item.images, item.mode, item.fileName);
      toast.success(`Loaded ${item.images.length} images from history`);
    } else {
      handleScrape(onScrapeSuccess, item.url);
    }
  };

  return (
    <>
      <MainLayout 
        auth={<AuthSection user={user} loading={loading} onLogin={login} onLogout={logout} />}
        controls={
          <div className="space-y-6">
            <ControlPanel 
              url={url} setUrl={setUrl} 
              onScrape={() => handleScrape(onScrapeSuccess)} 
              isScraping={isScraping}
              images={images} fileName={fileName} setFileName={setFileName}
              onToggleAll={toggleSelectAll} onDownload={handleDownloadPDF}
              isGenerating={isGenerating} progress={progress}
            />
            {images.length > 0 && <PDFSettingsPanel settings={pdfSettings} onSettingsChange={setPdfSettings} />}
            {images.length > 0 && <AIAnalysisPanel images={selectedImageUrls} />}
            {user && <HistoryPanel history={history} onSelect={handleHistorySelect} onDelete={deleteFromHistory} />}
          </div>
        }
        content={
          <ImageGrid images={images} scrapeMode={scrapeMode} onToggleImage={toggleImage} onReorder={setImages} />
        }
      />
      <Toaster position="bottom-right" />
    </>
  );
}
