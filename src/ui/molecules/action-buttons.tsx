import { Square, CheckSquare, Download, Loader2, Cloud, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ActionButtonsProps {
  fileName: string;
  setFileName: (name: string) => void;
  onToggleAll: () => void;
  onDownload: () => void;
  onSaveToDrive?: () => void;
  onSuggestName?: () => void;
  isGenerating: boolean;
  isSuggesting?: boolean;
  allSelected: boolean;
  hasSelection: boolean;
}

export function ActionButtons({ 
  fileName, setFileName, onToggleAll, onDownload, onSaveToDrive, onSuggestName, isGenerating, isSuggesting, allSelected, hasSelection 
}: ActionButtonsProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5 mb-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-wider text-[#999] ml-1">File Name</label>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onSuggestName}
            disabled={isSuggesting || !hasSelection}
            className="h-6 px-2 text-[9px] font-bold uppercase tracking-wider text-[#1a1a1a] dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-white/10 rounded-lg gap-1"
          >
            {isSuggesting ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
            AI Suggest
          </Button>
        </div>
        <Input 
          placeholder="iai-material" 
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="h-10 bg-[#f9f9f9] dark:bg-white/5 border-none focus-visible:ring-1 focus-visible:ring-[#1a1a1a] dark:focus-visible:ring-white rounded-xl"
        />
      </div>
      <Button 
        variant="outline" 
        onClick={onToggleAll}
        className="w-full justify-start h-11 border-[#eee] dark:border-white/10 hover:bg-[#f9f9f9] dark:hover:bg-white/5 rounded-xl"
      >
        {allSelected ? <><Square className="mr-2 h-4 w-4" /> Deselect All</> : <><CheckSquare className="mr-2 h-4 w-4" /> Select All</>}
      </Button>
      <div className="grid grid-cols-1 gap-2">
        <Button 
          onClick={onDownload} 
          disabled={isGenerating || !hasSelection}
          className="w-full h-12 bg-[#1a1a1a] dark:bg-white dark:text-[#1a1a1a] hover:bg-[#333] dark:hover:bg-white/90 text-white rounded-xl transition-all active:scale-[0.98]"
        >
          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Download className="mr-2 h-4 w-4" /> Download PDF</>}
        </Button>
        <Button 
          variant="outline"
          onClick={onSaveToDrive} 
          disabled={isGenerating || !hasSelection}
          className="w-full h-12 border-[#eee] dark:border-white/10 hover:border-[#1a1a1a] dark:hover:border-white hover:bg-transparent rounded-xl transition-all active:scale-[0.98]"
        >
          {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : <><Cloud className="mr-2 h-4 w-4" /> Save to Drive</>}
        </Button>
      </div>
    </div>
  );
}
