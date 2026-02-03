// app/layout/toast.ts
type ToastType = "success" | "error" | "info";

let pushToast: ((msg: string, type: ToastType) => void) | null = null;

export function registerToast(fn: typeof pushToast) {
  pushToast = fn;
}

export const toast = {
  success(msg: string) {
    pushToast?.(msg, "success");
  },
  error(msg: string) {
    pushToast?.(msg, "error");
  },
  info(msg: string) {
    pushToast?.(msg, "info");
  },
};
