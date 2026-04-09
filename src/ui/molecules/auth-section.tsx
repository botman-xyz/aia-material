import { LogIn, LogOut, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "firebase/auth";
import { ThemeToggle } from "./theme-toggle";

interface AuthSectionProps {
  user: User | null;
  loading: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export function AuthSection({ user, loading, onLogin, onLogout }: AuthSectionProps) {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      {loading ? (
        <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-transparent dark:border-white/10">
          <Loader2 size={16} className="animate-spin text-[#999]" />
          <span className="text-xs text-[#999] font-medium">Authenticating...</span>
        </div>
      ) : user ? (
        <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-sm border border-transparent dark:border-white/10">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ""} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#eee] dark:border-white/10" />
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#f5f5f5] dark:bg-white/5 rounded-full flex items-center justify-center text-[#999]">
              <UserIcon size={14} />
            </div>
          )}
          <div className="hidden md:block text-left">
            <p className="text-[10px] sm:text-xs font-bold text-[#1a1a1a] dark:text-white truncate max-w-[100px] sm:max-w-[120px]">{user.displayName}</p>
            <p className="text-[9px] sm:text-[10px] text-[#999] truncate max-w-[100px] sm:max-w-[120px]">{user.email}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onLogout}
            className="h-7 w-7 sm:h-8 sm:w-8 text-[#999] hover:text-[#1a1a1a] dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-white/10"
          >
            <LogOut size={14} />
          </Button>
        </div>
      ) : (
        <Button 
          onClick={onLogin}
          className="bg-[#1a1a1a] dark:bg-white dark:text-[#1a1a1a] hover:bg-[#333] dark:hover:bg-white/90 text-white rounded-xl h-10 px-4 flex items-center gap-2"
        >
          <LogIn size={16} />
          <span>Sign In</span>
        </Button>
      )}
    </div>
  );
}
