import { LayoutDashboard, Upload, FileText, Users, Church } from "lucide-react";

interface SidebarProps {
  current: string;
  onNavigate: (view: "home" | "upload" | "upload-page" | "planning-center") => void;
}

const navItems = [
  { id: "home" as const, label: "Dashboard", Icon: LayoutDashboard },
  { id: "upload-page" as const, label: "Upload", Icon: Upload },
  { id: "upload" as const, label: "Reports", Icon: FileText },
  { id: "planning-center" as const, label: "Team", Icon: Users },
];

export default function Sidebar({ current, onNavigate }: SidebarProps) {
  return (
    <aside className="fixed h-full w-[240px] left-0 top-0 bg-surface-container-lowest border-r border-outline-variant/30 backdrop-blur-md shadow-sm z-50 flex flex-col gap-4 py-8">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
            <Church className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-headline-sm font-semibold text-primary leading-none">CheckIn</h1>
            <p className="text-body-md text-on-surface-variant opacity-60">Ecclesiastical Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-150 active:scale-[0.98] ${
              current === item.id
                ? "text-primary font-semibold border-r-2 border-primary bg-primary-container/5"
                : "text-on-surface-variant hover:bg-primary-container/10"
            }`}
          >
            <item.Icon className="w-5 h-5" />
            <span className="text-body-md">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-4 mt-auto">
        <button
          onClick={() => onNavigate("upload-page")}
          className="w-full py-3 px-4 rounded-xl bg-primary text-on-primary font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
        >
          <Upload className="w-5 h-5" />
          <span className="text-body-md">Upload PDF</span>
        </button>
      </div>
    </aside>
  );
}
