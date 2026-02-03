import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useSession } from "@/features/auth/useSession";

type FeedbackType = "bug" | "idea" | "etc";

export default function SupportNewPage() {
  const nav = useNavigate();
  const { isAuthed } = useSession();

  const [type, setType] = useState<FeedbackType>("bug");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && body.trim().length > 0 && !busy;
  }, [title, body, busy]);

  async function submit() {
    if (!isAuthed) {
      setErrorMsg("로그인 후 제보할 수 있어요.");
      return;
    }

    const titleText = title.trim();
    const bodyText = body.trim();

    if (!titleText || !bodyText) {
      setErrorMsg("제목과 내용을 입력해 주세요.");
      return;
    }

    setBusy(true);
    setErrorMsg(null);

    const payload = {
      type,
      title: titleText,
      body: bodyText,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    };

    // ✅ 여기서 body가 비어있으면 무조건 폼 연결 문제
    console.log("submit payload:", payload);

    try {
      const { error } = await supabase
        .from("shiori_feedback")
        .insert([payload]);
      if (error) throw error;

      // 성공: 목록 페이지로 이동 + refresh 플래그
      nav("/support", { state: { refresh: true } });
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message ?? "저장에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold">제보하기</h1>
          <button
            className="rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
            onClick={() => nav(-1)}
          >
            뒤로
          </button>
        </div>

        {!isAuthed ? (
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-4 text-sm text-zinc-400">
            로그인 후 제보할 수 있어요.
          </div>
        ) : null}

        <div className="space-y-3 rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("bug")}
              className={`rounded-xl border px-3 py-2 text-sm ${
                type === "bug"
                  ? "border-zinc-200 bg-zinc-200 text-black"
                  : "border-zinc-800/70 text-zinc-300 hover:bg-zinc-900/60"
              }`}
            >
              버그
            </button>
            <button
              type="button"
              onClick={() => setType("idea")}
              className={`rounded-xl border px-3 py-2 text-sm ${
                type === "idea"
                  ? "border-zinc-200 bg-zinc-200 text-black"
                  : "border-zinc-800/70 text-zinc-300 hover:bg-zinc-900/60"
              }`}
            >
              제안
            </button>
            <button
              type="button"
              onClick={() => setType("etc")}
              className={`rounded-xl border px-3 py-2 text-sm ${
                type === "etc"
                  ? "border-zinc-200 bg-zinc-200 text-black"
                  : "border-zinc-800/70 text-zinc-300 hover:bg-zinc-900/60"
              }`}
            >
              기타
            </button>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-zinc-700/60"
          />

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            placeholder="내용"
            className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-zinc-700/60"
          />

          {errorMsg ? (
            <div className="text-sm text-red-300">{errorMsg}</div>
          ) : null}

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="rounded-xl border border-zinc-700/70 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
          >
            {busy ? "처리 중..." : "제보 등록"}
          </button>
        </div>
      </div>
    </div>
  );
}
