import { LucideIcon } from "lucide-react";

interface IconBoxProps {
  icon: LucideIcon;
}

export function IconBox({ icon: Icon }: IconBoxProps) {
  return (
    <div className="w-12 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center text-white">
      <Icon size={28} />
    </div>
  );
}
