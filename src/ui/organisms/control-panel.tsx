import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { URLInput } from "../molecules/url-input";
import { ActionButtons } from "../molecules/action-buttons";
import { ScrapedImage } from "../../domain/material/material.types";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

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

const PRESETS = [
  { name: "IAI CA Modules", url: "https://web.iaiglobal.or.id/Sertifikasi-IAI/Modul%20Ujian%20CA#gsc.tab=0" },
];

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
        <CardContent className="space-y-4">
          <URLInput url={url} setUrl={setUrl} onScrape={onScrape} isScraping={isScraping} />
          
          <div className="space-y-2">
            <p className="text-[10px] font-bold text-[#999] uppercase tracking-wider">Quick Presets</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.url}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUrl(preset.url);
                  }}
                  className="rounded-full border-[#eee] hover:border-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white text-[10px] py-1 h-auto flex items-center gap-1.5 transition-all"
                >
                  <Sparkles size={10} />
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
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
