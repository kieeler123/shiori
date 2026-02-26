import { useEffect, useState } from "react";
import { registerToast } from "./toast";

type Toast = {
  id: number;
  message: string;
  type: "success" | "error" | "info";
  action?: { label: string; onClick: () => void };
};

export default function ToastProvider() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    registerToast(({ message, type, action }) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((t) => [...t, { id, message, type, action }]);

      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 2500);
    });
  }, []);

  return (
    <div className="fixed bottom-6 right-6 sm:bottom-6 sm:right-6 bottom-4 right-4 space-y-3 z-50">
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
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">{t.message}</div>

            {t.action ? (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick();
                  // 클릭하면 바로 닫히게(선택)
                  setToasts((prev) => prev.filter((x) => x.id !== t.id));
                }}
                className="
                  shrink-0 rounded-lg px-2.5 py-1 text-xs
                  border border-[var(--border-soft)]
                  hover:border-[var(--border-strong)]
                  hover:bg-[var(--btn-ghost-hover-bg)]
                "
              >
                {t.action.label}
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
