import React from "react";
import { motion } from "motion/react";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrapedImage } from "../../domain/material/material.types";

interface ImageCardProps {
  image: ScrapedImage;
  index: number;
  onToggle: () => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, index, onToggle }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.02 }}
      className={cn(
        "group relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all cursor-pointer",
        image.selected ? "border-[#1a1a1a]" : "border-transparent bg-[#f9f9f9]"
      )}
      onClick={onToggle}
    >
      <img 
        src={`/api/proxy-image?url=${encodeURIComponent(image.url)}`} 
        alt={`Scraped ${index}`}
        className={cn(
          "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
          !image.selected && "opacity-40 grayscale"
        )}
        referrerPolicy="no-referrer"
      />
      <div className="absolute top-2 right-2">
        <div className={cn(
          "w-5 h-5 rounded-full flex items-center justify-center transition-colors",
          image.selected ? "bg-[#1a1a1a] text-white" : "bg-white/80 text-[#ccc]"
        )}>
          {image.selected && <CheckCircle2 size={14} />}
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <a 
          href={image.url} 
          target="_blank" 
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[10px] text-white flex items-center gap-1 hover:underline"
        >
          View Original <ExternalLink size={10} />
        </a>
      </div>
    </motion.div>
  );
}
