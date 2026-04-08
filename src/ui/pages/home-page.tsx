import { Toaster } from "@/components/ui/sonner";
import { useMaterialManager } from "../hooks/use-material-manager";
import { MainLayout } from "../templates/main-layout";
import { ControlPanel } from "../organisms/control-panel";
import { ImageGrid } from "../organisms/image-grid";

export function HomePage() {
  const {
    url, setUrl,
    images,
    isScraping,
    isGenerating,
    progress,
    scrapeMode,
    fileName, setFileName,
    handleScrape,
    handleDownloadPDF,
    toggleSelectAll,
    toggleImage
  } = useMaterialManager();

  return (
    <>
      <MainLayout 
        controls={
          <ControlPanel 
            url={url} setUrl={setUrl} onScrape={handleScrape} isScraping={isScraping}
            images={images} fileName={fileName} setFileName={setFileName}
            onToggleAll={toggleSelectAll} onDownload={handleDownloadPDF}
            isGenerating={isGenerating} progress={progress}
          />
        }
        content={
          <ImageGrid images={images} scrapeMode={scrapeMode} onToggleImage={toggleImage} />
        }
      />
      <Toaster position="bottom-right" />
    </>
  );
}
