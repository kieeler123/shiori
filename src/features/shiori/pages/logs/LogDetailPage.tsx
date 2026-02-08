import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";

import { dbGet } from "@/features/shiori/repo/shioriRepo";
import {
  dbCommentsList,
  dbCommentCreate,
  dbCommentDelete,
} from "@/features/shiori/repo/commentsRepo";

import { supabase } from "@/lib/supabaseClient";
import { dbSoftDelete } from "@/features/shiori/repo/trashRepo";

import RouteProblem from "@/features/shiori/components/RouteProblem";
import { isUuid } from "@/features/shiori/utils/isUuid";
import type { DbCommentRow } from "../../type";

function chip(t: string) {
  return (
    <span
      key={t}
      className="select-none rounded-full border border-zinc-800/70 px-2 py-1 text-xs text-zinc-400"
    >
      #{t}
    </span>
  );
}

export default function LogDetailPage() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isAuthed, userId } = useSession();

  // ✅ Guard: uuid 아니면 조회하지 않고 안내
  if (!isUuid(id)) {
    return (
      <RouteProblem
        title="잘못된 주소로 들어왔어요"
        message="현재 URL의 id 값이 올바른 글 ID(uuid)가 아닙니다."
        hint={`받은 값: ${String(id)}\n원인 예: /logs/new 가 /logs/:id 로 매칭됨\n해결: 라우터에서 /logs/new 를 :id 보다 먼저 선언하세요.`}
      />
    );
  }

  const [item, setItem] = useState<Awaited<ReturnType<typeof dbGet>>>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [comments, setComments] = useState<DbCommentRow[]>([]);
  const [commentText, setCommentText] = useState("");

  const isMine = useMemo(() => {
    if (!isAuthed || !userId) return false;
    return item?.user_id === userId;
  }, [isAuthed, userId, item?.user_id]);

  // ✅ 상세 + 댓글 로드
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const row = await dbGet(id);
        setItem(row);

        const cs = await dbCommentsList(id);
        setComments(cs);
      } finally {
        setLoading(false);
      }
    })().catch(console.error);
  }, [id]);

  // ✅ 조회수 +1 (10분 쿨다운)
  useEffect(() => {
    const KEY = `shiori:viewed:${id}`;
    const COOL_MS = 10 * 60 * 1000;

    const last = Number(localStorage.getItem(KEY) ?? "0");
    const now = Date.now();

    if (last && now - last < COOL_MS) return;

    localStorage.setItem(KEY, String(now));

    (async () => {
      const { error } = await supabase.rpc("increment_view_count", {
        item_id: id,
      });
      if (error) console.error(error);

      setItem((cur) =>
        cur ? { ...cur, view_count: ((cur as any).view_count ?? 0) + 1 } : cur,
      );
    })().catch(console.error);
  }, [id]);

  async function refreshComments() {
    const cs = await dbCommentsList(id!);
    setComments(cs);
  }

  async function submitComment() {
    if (!isAuthed) return;

    const body = commentText.trim();
    if (!body) return;

    setBusy(true);
    try {
      await dbCommentCreate({ item_id: id!, body });
      setCommentText("");
      await refreshComments();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  async function deleteComment(cid: string) {
    if (!isAuthed) return;

    setBusy(true);
    try {
      await dbCommentDelete(cid);
      await refreshComments();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  async function removeItem() {
    if (!isAuthed || !isMine) return;
    if (!confirm("삭제할까요?")) return;

    setBusy(true);
    try {
      await dbSoftDelete(id!);
      nav("/logs", { state: { refresh: true } });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-3xl px-6 py-8 text-sm text-zinc-400">
          Loading...
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <button
            className="cursor-pointer rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
            onClick={() => nav(-1)}
          >
            뒤로
          </button>
          <div className="mt-6 text-sm text-zinc-400">
            존재하지 않는 글입니다.
          </div>
        </div>
      </div>
    );
  }

  const createdLabel = new Date(item.created_at).toLocaleString();
  const viewCount = (item as any).view_count ?? 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* 상단 바 */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            className="cursor-pointer rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
            onClick={() => nav("/logs", { state: { refresh: true } })}
          >
            목록
          </button>

          {/* 날짜 + 조회수 */}
          <div className="text-xs text-zinc-500 flex items-center gap-3">
            <span>{createdLabel}</span>
            <span>👀 {viewCount}</span>
          </div>
        </div>

        {/* 제목 + 우측 버튼 */}
        <div className="mt-1 flex items-start justify-between gap-4">
          <h1 className="min-w-0 flex-1 truncate text-2xl font-semibold tracking-tight">
            {item.title || "(제목 없음)"}
          </h1>

          {isMine ? (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => nav(`/logs/${item.id}/edit`)}
                className="cursor-pointer rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
              >
                수정
              </button>

              <button
                type="button"
                onClick={removeItem}
                disabled={busy}
                className="cursor-pointer rounded-xl border border-red-900/60 px-3 py-2 text-sm text-red-300 hover:bg-red-950/30 disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          ) : null}
        </div>

        {/* 태그 */}
        {Array.isArray(item.tags) && item.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">{item.tags.map(chip)}</div>
        ) : null}

        {/* 본문 */}
        <div className="mt-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5">
          <pre className="whitespace-pre-wrap break-words text-sm text-zinc-200">
            {item.content}
          </pre>
        </div>

        {/* 댓글 */}
        <div className="mt-10">
          <div className="mb-3 text-sm text-zinc-300">
            댓글 <span className="text-zinc-500">({comments.length})</span>
          </div>

          {!isAuthed ? (
            <div className="mb-4">
              <AuthPanel />
            </div>
          ) : (
            <div className="mb-4 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-4">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                placeholder="댓글을 입력..."
                className="w-full rounded-xl border border-zinc-800/70 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-zinc-700/60"
              />
              <button
                onClick={submitComment}
                disabled={busy || !commentText.trim()}
                className="mt-2 rounded-xl border border-zinc-700/70 bg-zinc-900/70 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 disabled:opacity-50"
              >
                {busy ? "처리 중..." : "댓글 작성"}
              </button>
            </div>
          )}

          <div className="space-y-2">
            {comments.map((c) => {
              const mine = isAuthed && userId === c.user_id;
              return (
                <div
                  key={c.id}
                  className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs text-zinc-500">
                      {new Date(c.created_at).toLocaleString()}
                      {mine ? (
                        <span className="ml-2 text-zinc-400">(내 댓글)</span>
                      ) : null}
                    </div>

                    {mine ? (
                      <button
                        onClick={() => deleteComment(c.id)}
                        disabled={busy}
                        className="cursor-pointer rounded-xl border border-zinc-800/70 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-900/60 disabled:opacity-50"
                      >
                        삭제
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-2 whitespace-pre-wrap break-words text-sm text-zinc-200">
                    {c.body}
                  </div>
                </div>
              );
            })}

            {comments.length === 0 ? (
              <div className="text-sm text-zinc-500">댓글이 아직 없습니다.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
