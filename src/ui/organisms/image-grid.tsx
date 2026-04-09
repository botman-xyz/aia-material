import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Image as ImageIcon, LayoutGrid, List, GripVertical } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { SortableImageCard } from "../molecules/sortable-image-card";
import { StatusBadge } from "../atoms/status-badge";
import { ScrapedImage } from "../../domain/material/material.types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

interface ImageGridProps {
  images: ScrapedImage[];
  scrapeMode: "page" | "sequence" | null;
  onToggleImage: (index: number) => void;
  onReorder: (newImages: ScrapedImage[]) => void;
}

export function ImageGrid({ images, scrapeMode, onToggleImage, onReorder }: ImageGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "catalog">("grid");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.url === active.id);
      const newIndex = images.findIndex((img) => img.url === over.id);
      onReorder(arrayMove(images, oldIndex, newIndex));
    }
  };

  return (
    <Card className="border-none shadow-sm bg-white rounded-2xl lg:h-[calc(100vh-200px)] min-h-[400px] flex flex-col overflow-hidden">
      <CardHeader className="border-b border-[#f5f5f5] flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">Found Images</CardTitle>
            {scrapeMode && <StatusBadge mode={scrapeMode} />}
          </div>
          <CardDescription className="text-xs sm:text-sm">Preview, reorder (drag), and select images for PDF.</CardDescription>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {images.length > 0 && (
            <div className="flex items-center bg-[#f5f5f5] p-1 rounded-lg mr-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("grid")}
                className={`h-7 w-7 rounded-md ${viewMode === "grid" ? "bg-white shadow-sm text-[#1a1a1a]" : "text-[#999]"}`}
              >
                <LayoutGrid size={14} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("catalog")}
                className={`h-7 w-7 rounded-md ${viewMode === "catalog" ? "bg-white shadow-sm text-[#1a1a1a]" : "text-[#999]"}`}
              >
                <List size={14} />
              </Button>
            </div>
          )}
          {images.length > 0 && <div className="text-[10px] font-mono bg-[#f5f5f5] px-2 py-1 rounded text-[#666]">{images.length} TOTAL</div>}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4 sm:p-6">
          {images.length === 0 ? (
            <EmptyState />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={images.map(img => img.url)}
                strategy={rectSortingStrategy}
              >
                <div className={`grid gap-3 sm:gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"}`}>
                  <AnimatePresence>
                    {images.map((img, index) => (
                      <SortableImageCard key={img.url} image={img} index={index} onToggle={() => onToggleImage(index)} />
                    ))}
                  </AnimatePresence>
                </div>
              </SortableContext>
            </DndContext>
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
