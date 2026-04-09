import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, MessageSquare, BookOpen, Search, Send, User, Bot } from "lucide-react";
import { geminiService } from "@/infrastructure/ai/gemini.service";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAnalysisPanelProps {
  images: string[];
}

export function AIAnalysisPanel({ images }: AIAnalysisPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    const prompt = text.trim();
    if (!prompt) return;
    if (images.length === 0) {
      toast.error("No images to analyze");
      return;
    }

    const userMessage: Message = { role: "user", content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsAnalyzing(true);

    try {
      const result = await geminiService.analyzeImages(images, prompt);
      const assistantMessage: Message = { role: "assistant", content: result };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-white dark:bg-[#1a1a1a] rounded-2xl overflow-hidden flex flex-col max-h-[500px]">
      <CardHeader className="pb-4 border-b border-[#f5f5f5] dark:border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#f5f5f5] dark:bg-white/5 rounded-xl text-[#1a1a1a] dark:text-white">
              <Sparkles size={18} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">AI Assistant</CardTitle>
              <CardDescription className="text-[10px]">Chat with your materials</CardDescription>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setMessages([])} className="text-[10px] h-7 font-bold uppercase tracking-wider text-[#999]">
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 scroll-smooth" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="py-8 space-y-4">
              <div className="text-center space-y-2">
                <p className="text-xs font-medium text-[#999]">Pilih topik atau tanya apa saja:</p>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl justify-start h-auto py-3 px-4 border-[#eee] dark:border-white/10 hover:border-[#1a1a1a] dark:hover:border-white hover:bg-transparent text-left"
                  onClick={() => handleSend("Berikan ringkasan singkat dari materi ini berdasarkan gambar-gambar yang ada.")}
                  disabled={isAnalyzing || images.length === 0}
                >
                  <BookOpen size={14} className="text-[#999] mr-2 shrink-0" />
                  <span className="text-xs">Ringkas materi ini</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="rounded-xl justify-start h-auto py-3 px-4 border-[#eee] dark:border-white/10 hover:border-[#1a1a1a] dark:hover:border-white hover:bg-transparent text-left"
                  onClick={() => handleSend("Identifikasi topik-topik utama dan konsep kunci yang dibahas dalam materi ini.")}
                  disabled={isAnalyzing || images.length === 0}
                >
                  <Search size={14} className="text-[#999] mr-2 shrink-0" />
                  <span className="text-xs">Temukan topik utama</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`shrink-0 p-1.5 rounded-lg h-fit ${msg.role === "user" ? "bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a]" : "bg-[#f5f5f5] dark:bg-white/5 text-[#1a1a1a] dark:text-white"}`}>
                    {msg.role === "user" ? <User size={12} /> : <Bot size={12} />}
                  </div>
                  <div className={`max-w-[85%] text-xs leading-relaxed p-3 rounded-2xl ${
                    msg.role === "user" 
                      ? "bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] rounded-tr-none" 
                      : "bg-[#f9f9f9] dark:bg-white/5 text-[#333] dark:text-[#ccc] border border-[#eee] dark:border-white/10 rounded-tl-none"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isAnalyzing && (
                <div className="flex gap-3">
                  <div className="shrink-0 p-1.5 rounded-lg h-fit bg-[#f5f5f5] dark:bg-white/5 text-[#1a1a1a] dark:text-white">
                    <Bot size={12} />
                  </div>
                  <div className="bg-[#f9f9f9] dark:bg-white/5 text-[#333] dark:text-[#ccc] border border-[#eee] dark:border-white/10 p-3 rounded-2xl rounded-tl-none">
                    <Loader2 className="animate-spin text-[#999]" size={14} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#f5f5f5] dark:border-white/5 bg-[#fcfcfc] dark:bg-white/5">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <Input 
              placeholder="Tanya tentang materi..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isAnalyzing || images.length === 0}
              className="rounded-xl border-[#eee] dark:border-white/10 bg-white dark:bg-white/5 h-10 text-xs focus-visible:ring-1 focus-visible:ring-[#1a1a1a] dark:focus-visible:ring-white"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isAnalyzing || !input.trim() || images.length === 0}
              className="rounded-xl h-10 w-10 shrink-0 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] hover:bg-[#333] dark:hover:bg-white/90"
            >
              <Send size={16} />
            </Button>
          </form>
          {images.length > 0 && (
            <p className="text-[9px] text-center text-[#ccc] mt-2 font-medium">
              Menganalisis {Math.min(images.length, 5)} halaman pertama.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
