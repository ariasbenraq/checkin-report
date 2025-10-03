// src/App.tsx
import { useState } from "react";
import Navbar from "./components/Navbar";
import UploadView from "./pages/UploadView";
import Home from "./pages/Home"; // <— NUEVO
import ListView from "./pages/ListView";

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

        {currentView === "list" && <ListView />}
      </main>
    </div>
  );
}
