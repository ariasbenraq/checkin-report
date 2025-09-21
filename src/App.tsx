// src/App.tsx
import { useState } from "react";
import Navbar from "./components/Navbar";
import UploadView from "./pages/UploadView";
import Home from "./pages/Home"; // <— NUEVO

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "upload" | "list">("upload");

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

        {currentView === "list" && (
          <div className="text-center text-xl text-gray-600 mt-10">
            📄 Lista de PDFs registrados (próximamente)
          </div>
        )}
      </main>
    </div>
  );
}
