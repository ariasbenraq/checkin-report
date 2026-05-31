// src/App.tsx
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import Navbar from "./components/Navbar";
import UploadView from "./pages/UploadView";
import Home from "./pages/Home";
import AuthLanding from "./pages/AuthLanding";
import PlanningCenterView from "./pages/PlanningCenterView";
import { AnimatePresence } from "framer-motion";
import PageFade from "./components/PageFade";
import UploadDock from "./components/UploadDock";
import { supabase } from "./lib/supabase";
import { getSession } from "./utils/auth";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "upload" | "planning-center">("upload");
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
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-sm text-gray-600">Validando sesión...</div>
      </div>
    );
  }

  if (!session) {
    return <AuthLanding />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar current={currentView} onNavigate={setCurrentView} />
      {currentView === "upload" && (
        <UploadDock
          defaultExpanded={false}
          className="fixed top-[72px] left-4 z-40 w-[20rem]"
          onExtracted={(text, file) => {
            window.dispatchEvent(
              new CustomEvent("pdf:extracted", { detail: { text, file } })
            );
          }}
        />
      )}
      <main className="max-w-6xl mx-auto p-6">
        <AnimatePresence mode="wait">
          <div key={currentView}>
            <PageFade>
              {currentView === "home" && <Home />}
              {currentView === "upload" && (
                <>
                  <h1 className="text-2xl font-bold text-center mb-6">
                    Resumen Inventario Etiquetas
                  </h1>
                  <UploadView />
                </>
              )}
              {currentView === "planning-center" && <PlanningCenterView />}
            </PageFade>
          </div>
        </AnimatePresence>
      </main>
    </div>
  );
}
