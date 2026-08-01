import { Search, Bell, HelpCircle, User } from "lucide-react";
import { Input } from "./ui/input";
import { useAuth } from "../hooks/useAuth";

export default function TopBar() {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 right-0 h-16 bg-surface-container-lowest/70 border-b border-outline-variant/30 backdrop-blur-xl z-40 flex justify-between items-center px-6 ml-[240px] w-[calc(100%-240px)]">
      <div className="flex items-center flex-1">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/50 group-focus-within:text-primary transition-colors" />
          <Input
            className="pl-10 bg-surface-container-low border-none rounded-full focus:ring-2 focus:ring-primary/20"
            placeholder="Search reports, volunteers..."
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border-2 border-surface-container-lowest"></span>
        </button>
        <button className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="h-8 w-[1px] bg-outline-variant/30 mx-2"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right">
            <p className="text-body-md font-semibold leading-tight">{user?.email || "Admin"}</p>
            <p className="text-body-sm text-on-surface-variant opacity-60">Super Admin</p>
          </div>
          <button
            onClick={signOut}
            className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors"
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
