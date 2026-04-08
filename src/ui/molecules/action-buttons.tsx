import { Square, CheckSquare, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ActionButtonsProps {
  fileName: string;
  setFileName: (name: string) => void;
  onToggleAll: () => void;
  onDownload: () => void;
  isGenerating: boolean;
  allSelected: boolean;
  hasSelection: boolean;
}

export function ActionButtons({ 
  fileName, setFileName, onToggleAll, onDownload, isGenerating, allSelected, hasSelection 
}: ActionButtonsProps) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5 mb-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-[#999] ml-1">File Name</label>
        <Input 
          placeholder="iai-material" 
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="h-10 bg-[#f9f9f9] border-none focus-visible:ring-1 focus-visible:ring-[#1a1a1a] rounded-xl"
        />
      </div>
      <Button 
        variant="outline" 
        onClick={onToggleAll}
        className="w-full justify-start h-11 border-[#eee] hover:bg-[#f9f9f9] rounded-xl"
      >
        {allSelected ? <><Square className="mr-2 h-4 w-4" /> Deselect All</> : <><CheckSquare className="mr-2 h-4 w-4" /> Select All</>}
      </Button>
      <Button 
        onClick={onDownload} 
        disabled={isGenerating || !hasSelection}
        className="w-full h-12 bg-[#1a1a1a] hover:bg-[#333] text-white rounded-xl transition-all active:scale-[0.98]"
      >
        {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating PDF...</> : <><Download className="mr-2 h-4 w-4" /> Download PDF</>}
      </Button>
    </div>
  );
}
