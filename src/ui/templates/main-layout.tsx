import { ReactNode } from "react";
import { FileDown } from "lucide-react";
import { IconBox } from "../atoms/icon-box";

interface MainLayoutProps {
  controls: ReactNode;
  content: ReactNode;
  auth?: ReactNode;
}

export function MainLayout({ controls, content, auth }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans selection:bg-[#1a1a1a] selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <header className="mb-8 sm:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <IconBox icon={FileDown} />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">IAI Scraper</h1>
              <p className="text-[10px] sm:text-sm text-[#666] font-medium uppercase tracking-widest">Material to PDF Converter</p>
            </div>
          </div>
          <div className="flex items-center self-end md:self-auto">
            {auth}
          </div>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-4 space-y-6">{controls}</div>
          <div className="lg:col-span-8">{content}</div>
        </div>
      </div>
    </div>
  );
}
