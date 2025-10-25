// src/components/UploadDock.tsx
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UploadBubble from "./UploadBubble";
import PdfUploader from "./PdfUploader";

export default function UploadDock({
  defaultExpanded = true,
  onExtracted,
  className = "",
}: {
  defaultExpanded?: boolean;
  onExtracted: (text: string, file: File) => void;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [busy, setBusy] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const hasProcessed = useRef(false);

  function handleMinimize() {
    setExpanded(false);
  }

  async function handleExtracted(text: string, file: File) {
    setBusy(false);
    setFileName(file.name);
    hasProcessed.current = true;
    setExpanded(false); // 👈 se convierte en burbuja al terminar
    onExtracted(text, file);
  }

  return (
    <>
      {/* Burbuja visible solo cuando está minimizado */}
      {!expanded && (
        <UploadBubble
          onExpand={() => setExpanded(true)}
          fileName={fileName}
          busy={busy}
        />
      )}

      {/* Dock lateral animado */}
      <AnimatePresence initial={false} mode="wait">
        {expanded && (
          <motion.aside
            key="uploader-panel"
            className={`w-full lg:w-[28rem] ${className}`}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            <div className="sticky top-4">
              <div className="w-full rounded-xl shadow-md bg-white/90 backdrop-blur border border-black/5">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-600">upload_file</span>
                    <h3 className="font-semibold">Cargar PDF</h3>
                  </div>
                  <button
                    onClick={handleMinimize}
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border bg-white hover:bg-gray-50"
                    title="Minimizar"
                    aria-label="Minimizar cargador"
                  >
                    <span className="material-symbols-outlined text-base">minimize</span>
                    Minimizar
                  </button>
                </div>

                <div className="p-4">
                  <PdfUploader
                    onExtracted={handleExtracted}
                    onBusyChange={setBusy}
                    onFileSelected={setFileName}
                  />
                </div>
              </div>

              {/* Ayuda contextual después de procesar una vez */}
              {hasProcessed.current && (
                <div className="mt-2 text-xs text-gray-500 px-1">
                  Puedes volver a abrir el cargador desde la burbuja morada (esquina superior izquierda).
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
