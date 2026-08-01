// src/App.tsx
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import UploadView from "./pages/UploadView";
import UploadPage from "./pages/UploadPage";
import Home from "./pages/Home";
import AuthLanding from "./pages/AuthLanding";
import PlanningCenterView from "./pages/PlanningCenterView";
import { AnimatePresence } from "framer-motion";
import PageFade from "./components/PageFade";
import { supabase } from "./lib/supabase";
import { getSession } from "./utils/auth";
import { ReportsCacheProvider } from "./contexts/ReportsCacheContext";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "upload" | "upload-page" | "planning-center">("upload-page");
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    let mounted = true;

    getSession()
      .then((currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
      })
      .finally(() => {
        if (mounted) setLoadingSession(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoadingSession(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loadingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-body-md text-on-surface-variant">Validando sesión...</div>
      </div>
    );
  }

  if (!session) {
    return <AuthLanding />;
  }

  return (
    <ReportsCacheProvider>
      <Layout current={currentView} onNavigate={setCurrentView}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "8px",
              background: "hsl(var(--inverse-surface))",
              color: "hsl(var(--inverse-on-surface))",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
            success: {
              iconTheme: {
                primary: "hsl(var(--tertiary))",
                secondary: "hsl(var(--on-tertiary))",
              },
            },
            error: {
              iconTheme: {
                primary: "hsl(var(--destructive))",
                secondary: "hsl(var(--destructive-foreground))",
              },
            },
          }}
        />
        <AnimatePresence mode="wait">
          <div key={currentView}>
            <PageFade>
              {currentView === "home" && <Home />}
              {currentView === "upload" && <UploadView />}
              {currentView === "upload-page" && <UploadPage />}
              {currentView === "planning-center" && <PlanningCenterView />}
            </PageFade>
          </div>
        </AnimatePresence>
      </Layout>
    </ReportsCacheProvider>
  );
}
