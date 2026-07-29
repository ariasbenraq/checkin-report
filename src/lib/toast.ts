// src/lib/toast.ts
import toast from "react-hot-toast";

const TOAST_CONFIG = {
  duration: 3000,
  position: "top-right" as const,
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
};

export function success(message: string) {
  return toast.success(message, { ...TOAST_CONFIG, ...TOAST_CONFIG.success });
}

export function error(message: string) {
  return toast.error(message, { ...TOAST_CONFIG, ...TOAST_CONFIG.error });
}

export function loading(message: string) {
  return toast.loading(message, TOAST_CONFIG);
}

export function dismiss(id?: string) {
  return toast.dismiss(id);
}

export function promise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((err: unknown) => string);
  }
) {
  return toast.promise(promise, messages, TOAST_CONFIG);
}

export default { success, error, loading, dismiss, promise };
