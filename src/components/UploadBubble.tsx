// src/components/UploadBubble.tsx
import { motion } from "framer-motion";

export default function UploadBubble({
  onExpand,
  fileName,
  busy,
  navHeight = 64,
  margin = 16,
  compact = false,            // 👈 NUEVO
}: {
  onExpand: () => void;
  fileName?: string | null;
  busy?: boolean;
  navHeight?: number;
  margin?: number;
  compact?: boolean;          // 👈 NUEVO
}) {
  return (
    <motion.button
      onClick={onExpand}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      style={{ position: "fixed", left: margin, top: navHeight + margin }}
      className={`z-40 flex items-center gap-2 rounded-full bg-purple-600 text-white shadow-lg
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
                  ${compact ? "p-3" : "px-4 py-2"}`}   // 👈 compact: círculo
      aria-label="Abrir cargador de PDF"
      title={busy ? "Procesando…" : fileName || "Subir PDF"}
    >
      <span className="material-symbols-outlined">picture_as_pdf</span>
      {/* 👇 oculta el texto si compact */}
      {!compact && (
        <span className="text-sm max-w-[14rem] truncate">
          {busy ? "Procesando…" : fileName || "Subir PDF"}
        </span>
      )}
    </motion.button>
  );
}
