import { Search, Loader2, Clock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";

const RECENT_URLS_KEY = "recentUrls";
const MAX_RECENT = 5;

interface URLInputProps {
  url: string;
  setUrl: (url: string) => void;
  onScrape: () => void;
  isScraping: boolean;
}

export function URLInput({ url, setUrl, onScrape, isScraping }: URLInputProps) {
  const [showRecent, setShowRecent] = useState(false);
  const [recentUrls, setRecentUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(RECENT_URLS_KEY);
    if (saved) setRecentUrls(JSON.parse(saved));
  }, []);


  const saveRecent = (newUrl: string) => {
    if (!newUrl || !newUrl.startsWith('http')) return;
    const updated = [newUrl, ...recentUrls.filter(u => u !== newUrl)].slice(0, MAX_RECENT);
    setRecentUrls(updated);
    localStorage.setItem(RECENT_URLS_KEY, JSON.stringify(updated));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const text = (e.dataTransfer as any).getText?.() || "";
    if (text?.startsWith("http")) setUrl(text);
  };

  return (
    <div className="space-y-4">
      <div 
        ref={inputRef}
        className={`relative transition-colors ${isDragOver ? 'ring-2 ring-[#1a1a1a]' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <Input 
          placeholder="https://web.iaiglobal.or.id/..." 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onFocus={() => recentUrls.length > 0 && setShowRecent(true)}
          onBlur={() => setTimeout(() => setShowRecent(false), 200)}
          className="pl-10 h-12 bg-[#f9f9f9] border-none focus-visible:ring-1 focus-visible:ring-[#1a1a1a] rounded-xl"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" size={18} />
        {url && (
          <button 
            onClick={() => setUrl("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#1a1a1a]"
          >
            <X size={14} />
          </button>
        )}
      </div>
      
      {/* Recent URLs dropdown */}
      {showRecent && recentUrls.length > 0 && (
        <div className="absolute z-10 w-full bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg border dark:border-white/10 mt-1">
          <div className="p-2 text-xs text-[#999] flex items-center gap-1">
            <Clock size={12} /> Recent URLs
          </div>
          {recentUrls.map((u, i) => (
            <button
              key={i}
              onClick={() => { setUrl(u); setShowRecent(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-[#f5f5f5] dark:hover:bg-white/5 truncate"
            >
              {u}
            </button>
          ))}
        </div>
      )}
      
      <Button 
        onClick={() => { saveRecent(url); onScrape(); }} 
        disabled={isScraping}
        className="w-full h-12 bg-[#1a1a1a] hover:bg-[#333] text-white rounded-xl transition-all active:scale-[0.98]"
      >
        {isScraping ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scraping...</>
        ) : (
          "Scrape Images"
        )}
      </Button>
    </div>
  );
}
