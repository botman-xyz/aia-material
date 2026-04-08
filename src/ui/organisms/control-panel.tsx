import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { URLInput } from "../molecules/url-input";
import { ActionButtons } from "../molecules/action-buttons";
import { ScrapedImage } from "../../domain/material/material.types";

interface ControlPanelProps {
  url: string;
  setUrl: (url: string) => void;
  onScrape: () => void;
  isScraping: boolean;
  images: ScrapedImage[];
  fileName: string;
  setFileName: (name: string) => void;
  onToggleAll: () => void;
  onDownload: () => void;
  isGenerating: boolean;
  progress: number;
}

export function ControlPanel({
  url, setUrl, onScrape, isScraping, images, fileName, setFileName, onToggleAll, onDownload, isGenerating, progress
}: ControlPanelProps) {
  const selectedCount = images.filter(img => img.selected).length;
  const allSelected = images.length > 0 && selectedCount === images.length;

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Source URL</CardTitle>
          <CardDescription>Enter the IAI material page URL to scrape images.</CardDescription>
        </CardHeader>
        <CardContent>
          <URLInput url={url} setUrl={setUrl} onScrape={onScrape} isScraping={isScraping} />
        </CardContent>
      </Card>

      {images.length > 0 && (
        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Actions</CardTitle>
            <CardDescription>{selectedCount} of {images.length} images selected</CardDescription>
          </CardHeader>
          <CardContent>
            <ActionButtons 
              fileName={fileName} setFileName={setFileName} 
              onToggleAll={onToggleAll} onDownload={onDownload} 
              isGenerating={isGenerating} allSelected={allSelected} hasSelection={selectedCount > 0} 
            />
          </CardContent>
          {isGenerating && (
            <CardFooter className="flex-col items-start gap-2 pt-0">
              <Progress value={progress} className="h-1.5 w-full bg-[#eee]" />
              <p className="text-[10px] text-[#999] font-mono uppercase tracking-tighter">Processing: {Math.round(progress)}%</p>
            </CardFooter>
          )}
        </Card>
      )}
    </div>
  );
}
