import { useEffect, useRef } from "react";
import { useSession } from "@/features/auth/useSession";
import { dbRestoreAccountIfPossible } from "../repo/AccountTrashRepo";

export function useAutoRestoreAccount() {
  const { ready, isAuthed } = useSession();
  const ranRef = useRef(false);

  useEffect(() => {
    if (!ready) return;
    if (!isAuthed) return;
    if (ranRef.current) return;
    ranRef.current = true;

    dbRestoreAccountIfPossible()
      .then((res) => {
        if (res?.restored) {
          // 필요하면 toast
          console.log("Account restored", res);
          // 로그 목록/프로필 다시 fetch 트리거
          // ex) nav(".", { state: { refresh: true } })
        }
      })
      .catch((e) => console.warn("restore failed:", e?.message ?? e));
  }, [ready, isAuthed]);
}
