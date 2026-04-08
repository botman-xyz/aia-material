import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image as ImageIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { ImageCard } from "../molecules/image-card";
import { StatusBadge } from "../atoms/status-badge";
import { ScrapedImage } from "../../domain/material/material.types";

interface ImageGridProps {
  images: ScrapedImage[];
  scrapeMode: "page" | "sequence" | null;
  onToggleImage: (index: number) => void;
}

export function ImageGrid({ images, scrapeMode, onToggleImage }: ImageGridProps) {
  return (
    <Card className="border-none shadow-sm bg-white rounded-2xl lg:h-[calc(100vh-200px)] min-h-[400px] flex flex-col overflow-hidden">
      <CardHeader className="border-b border-[#f5f5f5] flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">Found Images</CardTitle>
            {scrapeMode && <StatusBadge mode={scrapeMode} />}
          </div>
          <CardDescription className="text-xs sm:text-sm">Preview and select images to include in PDF.</CardDescription>
        </div>
        {images.length > 0 && <div className="text-[10px] font-mono bg-[#f5f5f5] px-2 py-1 rounded text-[#666] self-start sm:self-auto">{images.length} TOTAL</div>}
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4 sm:p-6">
          {images.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              <AnimatePresence>
                {images.map((img, index) => (
                  <ImageCard key={img.url} image={img} index={index} onToggle={() => onToggleImage(index)} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-20 space-y-4">
      <div className="w-16 h-16 bg-[#f9f9f9] rounded-full flex items-center justify-center text-[#ccc]"><ImageIcon size={32} /></div>
      <div className="space-y-1">
        <p className="font-medium text-[#999]">No images found yet</p>
        <p className="text-sm text-[#ccc]">Enter a URL and click scrape to begin</p>
      </div>
    </div>
  );
}
