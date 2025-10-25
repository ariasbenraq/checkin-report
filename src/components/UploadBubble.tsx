// src/components/UploadBubble.tsx
import { motion } from "framer-motion";

export default function UploadBubble({
  onExpand,
  fileName,
  busy,
  navHeight = 64, // ⇐ misma altura que tu navbar (en px)
  margin = 16,
}: {
  onExpand: () => void;
  fileName?: string | null;
  busy?: boolean;
  navHeight?: number;
  margin?: number;
}) {
  return (
    <motion.button
      onClick={onExpand}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      style={{
        position: "fixed",
        left: margin,
        top: navHeight + margin, // ⇐ nunca pisa el navbar
      }}
      className="z-40 flex items-center gap-2 rounded-full bg-purple-600 text-white shadow-lg px-4 py-2
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      aria-label="Abrir cargador de PDF"
      title="Abrir cargador de PDF"
    >
      <span className="material-symbols-outlined">picture_as_pdf</span>
      <span className="text-sm max-w-[14rem] truncate">
        {busy ? "Procesando…" : fileName || "Subir PDF"}
      </span>
    </motion.button>
  );
}
