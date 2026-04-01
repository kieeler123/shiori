import { toast, toastAction } from "@/app/layout/toast";
import { logError, type ErrorCategory } from "./logError";
import { normalizeError } from "./normalizeError";

type Input = {
  error: unknown;
  category: ErrorCategory;
  action?: string;
  page?: string;
  uiMessage?: string;
  meta?: Record<string, unknown>;
};

export async function toastError({
  error,
  category,
  action,
  page,
  uiMessage,
  meta,
}: Input) {
  const normalized = normalizeError(error);

  const message = uiMessage ?? normalized.message;

  // ✅ UI 표시
  toast(message, "error");

  // ✅ DB 저장
  await logError({
    category,
    action,
    page: page ?? window.location.pathname,
    error,
    meta: {
      ...meta,
      uiMessage: message,
    },
  });
}

export async function toastErrorWithAction({
  error,
  category,
  action,
  page,
  uiMessage,
  meta,
  actionButton,
}: Input & {
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}) {
  const normalized = normalizeError(error);
  const message = uiMessage ?? normalized.message;

  if (actionButton) {
    toastAction(message, "error", actionButton);
  } else {
    toast(message, "error");
  }

  await logError({
    category,
    action,
    page: page ?? window.location.pathname,
    error,
    meta: {
      ...meta,
      uiMessage: message,
    },
  });
}
