// app/layout/toast.ts
type ToastType = "success" | "error" | "info";

type ToastAction = {
  label: string;
  onClick: () => void;
};

type ToastPayload = {
  message: string;
  type: ToastType;
  action?: ToastAction;
};

let pushToast: ((payload: ToastPayload) => void) | null = null;

export function registerToast(fn: (payload: ToastPayload) => void) {
  pushToast = fn;
}

export function toast(message: string, type: ToastType = "info") {
  pushToast?.({ message, type });
}

export function toastAction(
  message: string,
  type: ToastType,
  action: ToastAction,
) {
  pushToast?.({ message, type, action });
}
