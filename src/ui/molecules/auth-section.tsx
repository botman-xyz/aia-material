import { LogIn, LogOut, User as UserIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "firebase/auth";

interface AuthSectionProps {
  user: User | null;
  loading: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export function AuthSection({ user, loading, onLogin, onLogout }: AuthSectionProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border-none">
        <Loader2 size={16} className="animate-spin text-[#999]" />
        <span className="text-xs text-[#999] font-medium">Authenticating...</span>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 bg-white rounded-xl shadow-sm border-none">
        {user.photoURL ? (
          <img src={user.photoURL} alt={user.displayName || ""} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#eee]" />
        ) : (
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-[#f5f5f5] rounded-full flex items-center justify-center text-[#999]">
            <UserIcon size={14} />
          </div>
        )}
        <div className="hidden md:block text-left">
          <p className="text-[10px] sm:text-xs font-bold text-[#1a1a1a] truncate max-w-[100px] sm:max-w-[120px]">{user.displayName}</p>
          <p className="text-[9px] sm:text-[10px] text-[#999] truncate max-w-[100px] sm:max-w-[120px]">{user.email}</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onLogout}
          className="h-7 w-7 sm:h-8 sm:w-8 text-[#999] hover:text-[#1a1a1a] hover:bg-[#f5f5f5]"
        >
          <LogOut size={14} />
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={onLogin}
      className="bg-[#1a1a1a] hover:bg-[#333] text-white rounded-xl h-10 px-4 flex items-center gap-2"
    >
      <LogIn size={16} />
      <span>Sign In</span>
    </Button>
  );
}
