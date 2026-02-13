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
          className="px-4 py-3 rounded-lg text-sm border"
          style={{
            color: "var(--toast-fg)",
            borderColor: "var(--toast-border)",
            boxShadow: "var(--toast-shadow)",
            background:
              t.type === "success"
                ? "var(--toast-success-bg)"
                : t.type === "error"
                  ? "var(--toast-error-bg)"
                  : "var(--toast-info-bg)",
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
