import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface LayoutProps {
  children: ReactNode;
  current: string;
  onNavigate: (view: "home" | "upload" | "upload-page" | "planning-center") => void;
}

export default function Layout({ children, current, onNavigate }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar current={current} onNavigate={onNavigate} />
      <TopBar />
      <main className="ml-[240px] pt-16 min-h-screen">
        <div className="p-8 max-w-[1440px] mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}
