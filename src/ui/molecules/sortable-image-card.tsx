import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImageCard } from "./image-card";
import { ScrapedImage } from "../../domain/material/material.types";

interface SortableImageCardProps {
  image: ScrapedImage;
  index: number;
  onToggle: () => void;
}

export function SortableImageCard({ image, index, onToggle }: SortableImageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.url });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      <ImageCard image={image} index={index} onToggle={onToggle} />
    </div>
  );
}
