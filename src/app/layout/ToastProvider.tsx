import { useEffect, useState } from "react";
import { registerToast } from "./toast";

type Toast = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
};

export default function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    registerToast((message, type) => {
      const id = Date.now();
      setToasts((t) => [...t, { id, message, type }]);

      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 2500);
    });
  }, []);

  return (
    <div className="fixed bottom-6 right-6 space-y-3 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-sm
            ${
              t.type === "success"
                ? "bg-emerald-600"
                : t.type === "error"
                  ? "bg-red-600"
                  : "bg-zinc-700"
            }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
