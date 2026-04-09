import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { FileText, Settings2 } from "lucide-react";
import { PDFSettings } from "@/domain/material/material.types";

interface PDFSettingsPanelProps {
  settings: PDFSettings;
  onSettingsChange: (settings: PDFSettings) => void;
}

export function PDFSettingsPanel({ settings, onSettingsChange }: PDFSettingsPanelProps) {
  return (
    <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#f5f5f5] rounded-xl text-[#1a1a1a]">
            <Settings2 size={18} />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">PDF Settings</CardTitle>
            <CardDescription>Configure output document layout</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-[#999] uppercase tracking-wider">Page Format</Label>
          <Select 
            value={settings.format} 
            onValueChange={(v: any) => onSettingsChange({ ...settings, format: v })}
          >
            <SelectTrigger className="rounded-xl border-[#eee] bg-[#fcfcfc] h-10">
              <SelectValue placeholder="Select format" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="a4">A4 (Standard)</SelectItem>
              <SelectItem value="letter">Letter (US)</SelectItem>
              <SelectItem value="legal">Legal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-[#999] uppercase tracking-wider">Orientation</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onSettingsChange({ ...settings, orientation: "portrait" })}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl border text-xs font-medium transition-all ${
                settings.orientation === "portrait" 
                  ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" 
                  : "bg-[#fcfcfc] text-[#666] border-[#eee] hover:border-[#ccc]"
              }`}
            >
              <FileText size={14} className={settings.orientation === "portrait" ? "rotate-0" : "rotate-0 opacity-50"} />
              Portrait
            </button>
            <button
              onClick={() => onSettingsChange({ ...settings, orientation: "landscape" })}
              className={`flex items-center justify-center gap-2 py-2 px-4 rounded-xl border text-xs font-medium transition-all ${
                settings.orientation === "landscape" 
                  ? "bg-[#1a1a1a] text-white border-[#1a1a1a]" 
                  : "bg-[#fcfcfc] text-[#666] border-[#eee] hover:border-[#ccc]"
              }`}
            >
              <FileText size={14} className={settings.orientation === "landscape" ? "rotate-90" : "rotate-90 opacity-50"} />
              Landscape
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-bold text-[#999] uppercase tracking-wider">Margins (mm)</Label>
            <span className="text-[10px] font-mono text-[#1a1a1a] bg-[#f5f5f5] px-2 py-0.5 rounded">{settings.margin}mm</span>
          </div>
          <Slider
            value={[settings.margin]}
            min={0}
            max={50}
            step={1}
            onValueChange={(v) => {
              if (Array.isArray(v)) {
                onSettingsChange({ ...settings, margin: v[0] });
              }
            }}
            className="py-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}
