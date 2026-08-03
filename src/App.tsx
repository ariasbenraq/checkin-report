// src/App.tsx
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import UploadView from "./pages/UploadView";
import AuthLanding from "./pages/AuthLanding";
import AdminDashboard from "./pages/AdminDashboard";
import { AnimatePresence } from "framer-motion";
import PageFade from "./components/PageFade";
import UploadDock from "./components/UploadDock";
import ErrorBoundary from "./components/ErrorBoundary";
import { supabase } from "./lib/supabase";
import { getSession } from "./utils/auth";
import { isAdmin } from "./utils/admin";

export default function App() {
  const [currentView, setCurrentView] = useState<"upload" | "admin">("upload");
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    getSession()
      .then((currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        if (currentSession) {
          isAdmin().then((admin) => {
            if (mounted) setUserIsAdmin(admin);
          });
        }
      })
      .finally(() => {
        if (mounted) setLoadingSession(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoadingSession(false);
      if (nextSession) {
        isAdmin().then((admin) => setUserIsAdmin(admin));
      } else {
        setUserIsAdmin(false);
      }
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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: "8px",
            background: "#1f2937",
            color: "#f9fafb",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
          success: {
            iconTheme: {
              primary: "#10b981",
              secondary: "#f9fafb",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "#f9fafb",
            },
          },
        }}
      />
      <Navbar current={currentView} onNavigate={setCurrentView} isAdmin={userIsAdmin} />
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
        <ErrorBoundary component="App">
          <AnimatePresence mode="wait">
            <div key={currentView}>
              <PageFade>
                {currentView === "upload" && (
                  <>
                    <h1 className="text-2xl font-bold text-center mb-6">
                      Resumen Inventario Etiquetas
                    </h1>
                    <UploadView />
                  </>
                )}
                {currentView === "admin" && userIsAdmin && <AdminDashboard />}
              </PageFade>
            </div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
    </div>
  );
}
