import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Trash2, ExternalLink, Clock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HistoryItem } from "../../infrastructure/history/history.repository";
import { StatusBadge } from "../atoms/status-badge";
import { useState } from "react";

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

export function HistoryPanel({ history, onSelect, onDelete }: HistoryPanelProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "page" | "sequence">("all");

  if (history.length === 0) return null;

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = filterMode === "all" || item.mode === filterMode;
    return matchesSearch && matchesMode;
  });

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden">
      <CardHeader className="pb-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={18} className="text-[#1a1a1a] dark:text-white" />
            <CardTitle className="text-lg font-semibold">Recent Scrapes</CardTitle>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" size={14} />
          <Input 
            placeholder="Search history..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 bg-[#f5f5f5] dark:bg-white/5 border-none rounded-xl text-xs focus-visible:ring-1 focus-visible:ring-[#1a1a1a] dark:focus-visible:ring-white"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="divide-y divide-[#f5f5f5] dark:divide-white/5">
            {filteredHistory.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-xs text-[#999]">No matches found</p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div key={item.id} className="p-4 hover:bg-[#f9f9f9] dark:hover:bg-white/5 transition-colors group">
                  <div className="flex items-start justify-between gap-3">
                    <div 
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => onSelect(item)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge mode={item.mode} />
                        <span className="text-[10px] text-[#999] font-mono flex items-center gap-1">
                          <Clock size={10} />
                          {item.timestamp.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate text-[#1a1a1a] dark:text-white">{item.fileName || "Untitled"}</p>
                      <p className="text-[10px] text-[#999] truncate">{item.url}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-[#999] hover:text-red-500 active:text-red-500"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
