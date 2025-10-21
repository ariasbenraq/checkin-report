// src/App.tsx
import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import UploadView from "./pages/UploadView";
import Home from "./pages/Home";
import ListView from "./pages/ListView";
import AuthLanding from "./pages/AuthLanding";

function getToken() {
  return localStorage.getItem("accessToken");
}

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "upload" | "list">("upload");
  const [token, setToken] = useState<string | null>(() => getToken());

  // Escucha cambios de token (por si se hace logout en otra pestaña o lo setea AuthLanding)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "accessToken") setToken(getToken());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Pequeña forma de “refrescar” el token cuando volvemos de AuthLanding
  useEffect(() => {
    setToken(getToken());
  }, []);

  // Si NO hay token, mostramos la pantalla de Auth
  if (!token) {
    return <AuthLanding />;
  }

  // Si hay token, mostramos la app normal
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar current={currentView} onNavigate={setCurrentView} />
      <main className="max-w-6xl mx-auto p-6">
        {currentView === "home" && <Home />}
        {currentView === "upload" && (
          <>
            <h1 className="text-2xl font-bold text-center mb-6">
              Resumen Inventario Etiquetas
            </h1>
            <UploadView />
          </>
        )}
        {currentView === "list" && <ListView />}
      </main>
    </div>
  );
}
