import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";
import { dbSupportCreate } from "@/features/shiori/repo/supportRepo";

export default function SupportNewPage() {
  const nav = useNavigate();
  const { ready, isAuthed } = useSession();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!isAuthed) return;
    if (busy) return;

    const t = title.trim();
    const b = body.trim();
    if (!t || !b) return;

    setBusy(true);
    try {
      const saved = await dbSupportCreate({ title: t, body: b });
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
      <div className="min-h-screen bg-zinc-950 text-zinc-100 grid place-items-center">
        <div className="text-sm text-zinc-400">세션 확인중…</div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="text-sm text-zinc-400 mb-3">
            로그인 후 문의할 수 있어요.
          </div>
          <AuthPanel />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">문의하기</h2>
          <button
            className="cursor-pointer rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
            onClick={() => nav("/support")}
            disabled={busy}
          >
            닫기
          </button>
        </div>

        <div className="mt-6 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-zinc-700/60"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            placeholder="문의 내용을 입력하세요"
            className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-zinc-700/60"
          />
          <button
            onClick={submit}
            disabled={busy || !title.trim() || !body.trim()}
            className="cursor-pointer rounded-xl border border-zinc-700/70 bg-zinc-100 px-3 py-2 text-sm text-zinc-900 hover:bg-white disabled:opacity-50"
          >
            {busy ? "처리 중..." : "등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
