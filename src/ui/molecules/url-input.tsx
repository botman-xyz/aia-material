import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface URLInputProps {
  url: string;
  setUrl: (url: string) => void;
  onScrape: () => void;
  isScraping: boolean;
}

export function URLInput({ url, setUrl, onScrape, isScraping }: URLInputProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <Input 
          placeholder="https://web.iaiglobal.or.id/..." 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="pl-10 h-12 bg-[#f9f9f9] border-none focus-visible:ring-1 focus-visible:ring-[#1a1a1a] rounded-xl"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" size={18} />
      </div>
      <Button 
        onClick={onScrape} 
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
