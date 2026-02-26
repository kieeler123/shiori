import { toast } from "@/app/layout/toast"; // 네가 만들어둔 toast 함수 경로에 맞게
// 또는 registerToast로 연결된 전역 toast 호출 함수

export type NotifyLevel = "info" | "success" | "error";
export type NotifyMode = "toast" | "alert" | "confirm";

export function notify(message: string, level: NotifyLevel = "info") {
  // 일반 알림은 toast
  toast(message, level);
}

export async function notifyDangerConfirm(message: string): Promise<boolean> {
  // 중요한 건 confirm (사용자 확인)
  return window.confirm(message);
}

export function notifyDangerAlert(message: string) {
  // 정말 강제 공지(확인만)
  window.alert(message);
}
