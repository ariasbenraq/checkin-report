// src/components/SaveListModal.tsx
import { useEffect, useMemo, useState } from "react";
import Modal from "./Modal";

export type SaveListPayload = {
  nombre: string;
  clave: string;
};

export default function SaveListModal({
  open,
  defaultName,
  onClose,
  onConfirm,
}: {
  open: boolean;
  defaultName: string;
  onClose: () => void;
  onConfirm: (data: SaveListPayload) => void;
}) {
  const [nombre, setNombre] = useState(defaultName ?? "");
  const [clave, setClave] = useState("");
  const [err, setErr] = useState<string | null>(null);

  // Reglas básicas para nombre
  const nameRegex = /^[\w\s\-\.\(\)\[\]#,]+$/u; // letras, números, espacios y algunos símbolos seguros

  useEffect(() => {
    if (open) {
      setNombre(defaultName ?? "");
      setClave("");
      setErr(null);
    }
  }, [open, defaultName]);

  const disabled = useMemo(() => {
    if (!nombre || nombre.trim().length === 0) return true;
    if (nombre.length > 120) return true;
    if (!nameRegex.test(nombre)) return true;
    if (!clave || clave.trim().length < 3) return true;
    return false;
  }, [nombre, clave]);

  const REQUIRED_KEY = import.meta.env.VITE_SAVE_KEY as string | undefined;

  function handleConfirm() {
    // Validación visible en el cliente (solo fricción)
    if (!nombre || !nameRegex.test(nombre)) {
      setErr("Nombre inválido. Usa letras, números y - . ( ) [ ] # ,");
      return;
    }
    if (!clave || clave.trim().length < 3) {
      setErr("Ingresa una clave válida.");
      return;
    }
    if (REQUIRED_KEY && clave !== REQUIRED_KEY) {
      setErr("La clave no coincide.");
      return;
    }

    onConfirm({ nombre: nombre.trim(), clave: clave.trim() });
  }

  return (
    <Modal open={open} onClose={onClose} title="Guardar lista" maxWidth="md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre de la lista</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. 2025-09-28 — Servicio 10AM"
            maxLength={120}
          />
          <p className="text-xs text-gray-500 mt-1">
            Puedes cambiarlo. Longitud ≤ 120. Permite letras, números y - . ( ) [ ] # ,.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Clave</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            placeholder="Ingresa la clave"
          />
          <p className="text-xs text-gray-500 mt-1">
            Se validará en el cliente y también se enviará al servidor.
          </p>
        </div>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={disabled}
            className={`px-3 py-2 rounded-md text-white ${disabled ? "bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            Guardar
          </button>
        </div>
      </div>
    </Modal>
  );
}
