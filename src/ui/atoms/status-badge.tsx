import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  mode: "page" | "sequence";
}

export function StatusBadge({ mode }: StatusBadgeProps) {
  return (
    <span className={cn(
      "text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider",
      mode === "sequence" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
    )}>
      {mode}
    </span>
  );
}
