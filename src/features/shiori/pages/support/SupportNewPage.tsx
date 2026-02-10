import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";
import { dbSupportCreate } from "@/features/shiori/repo/supportRepo";

import { Button } from "@/shared/ui/primitives/Button";
import { Input } from "@/shared/ui/primitives/Input";
import { Textarea } from "@/shared/ui/primitives/Textarea";

export default function SupportNewPage() {
  const nav = useNavigate();
  const { ready, isAuthed } = useSession();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  async function submit() {
    if (!isAuthed || busy || !canSubmit) return;

    setBusy(true);
    try {
      const saved = await dbSupportCreate({
        title: title.trim(),
        body: body.trim(),
      });
      nav(`/support/${saved.id}`);
    } catch (e) {
      console.error(e);
      alert(String((e as any)?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="grid place-items-center py-16">
        <div className="text-sm text-[var(--text-sub)]">세션 확인중…</div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="py-6">
        <div className="text-sm text-[var(--text-sub)] mb-3">
          로그인 후 문의할 수 있어요.
        </div>
        <AuthPanel />
      </div>
    );
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--text-main)]">
          문의하기
        </h2>

        <Button variant="ghost" onClick={() => nav("/support")} disabled={busy}>
          닫기
        </Button>
      </div>

      {/* Form */}
      <div className="mt-4 space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목"
          autoFocus
        />

        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          placeholder="문의 내용을 입력하세요"
        />

        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-[var(--text-sub)]">
            {busy
              ? "등록 중…"
              : canSubmit
                ? "입력 완료"
                : "제목과 내용을 입력하세요"}
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={submit}
            disabled={!canSubmit || busy}
          >
            {busy ? "처리 중..." : "등록"}
          </Button>
        </div>
      </div>
    </div>
  );
}
