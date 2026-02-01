import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";

import { dbGet, dbDelete, dbUpdate } from "@/features/shiori/repo/shioriRepo";
import {
  dbCommentsList,
  dbCommentCreate,
  dbCommentDelete,
  type DbCommentRow,
} from "@/features/shiori/repo/commentsRepo";

import LogEditor from "@/features/shiori/components/LogEditor";

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
  const { id } = useParams();
  const { isAuthed, userId } = useSession();

  const [item, setItem] = useState<Awaited<ReturnType<typeof dbGet>>>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const [comments, setComments] = useState<DbCommentRow[]>([]);
  const [commentText, setCommentText] = useState("");

  const isMine = useMemo(() => {
    if (!isAuthed || !userId) return false;
    return item?.user_id === userId;
  }, [isAuthed, userId, item?.user_id]);

  useEffect(() => {
    if (!id) return;

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

  async function refreshComments() {
    if (!id) return;
    const cs = await dbCommentsList(id);
    setComments(cs);
  }

  async function submitComment() {
    if (!id) return;
    if (!isAuthed) return;
    const body = commentText.trim();
    if (!body) return;

    setBusy(true);
    try {
      await dbCommentCreate({ item_id: id, body });
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

  async function saveEdit(v: {
    title: string;
    content: string;
    tags: string[];
  }) {
    if (!id) return;
    if (!isAuthed || !isMine) return;

    setBusy(true);
    try {
      const updated = await dbUpdate(id, v);
      setItem(updated);
      // 목록 페이지에 “refresh 플래그”로 재동기화 요청
      // (목록이 로컬캐시를 쓰기 때문)
    } finally {
      setBusy(false);
    }
  }

  async function removeItem() {
    if (!id) return;
    if (!isAuthed || !isMine) return;

    if (!confirm("삭제할까요?")) return;

    setBusy(true);
    try {
      await dbDelete(id);
      nav("/", { state: { refresh: true } });
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
            className="rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <button
            className="rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
            onClick={() => nav("/", { state: { refresh: true } })}
          >
            목록
          </button>
          <div className="text-xs text-zinc-500">
            {new Date(item.created_at).toLocaleString()}
          </div>
        </div>

        <h1 className="text-2xl font-semibold tracking-tight">
          {item.title || "(제목 없음)"}
        </h1>

        {Array.isArray(item.tags) && item.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">{item.tags.map(chip)}</div>
        ) : null}

        <div className="mt-5 rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5">
          <pre className="whitespace-pre-wrap break-words text-sm text-zinc-200">
            {item.content}
          </pre>
        </div>

        {/* ✅ 내 글이면 편집/삭제 */}
        {isMine ? (
          <div className="mt-6">
            <div className="mb-3 text-sm text-zinc-400">내 글 수정</div>
            <LogEditor
              syncKey={item.id}
              initialTitle={item.title}
              initialContent={item.content}
              initialTags={Array.isArray(item.tags) ? item.tags : []}
              submitLabel={busy ? "처리 중..." : "수정 저장"}
              onSubmit={saveEdit}
            />
            <button
              onClick={removeItem}
              disabled={busy}
              className="mt-3 rounded-xl border border-red-900/60 bg-transparent px-3 py-2 text-sm text-red-300 hover:bg-red-950/30 disabled:opacity-50"
            >
              삭제
            </button>
          </div>
        ) : (
          <div className="mt-6 text-sm text-zinc-500">
            이 글은 작성자만 수정/삭제할 수 있어요.
          </div>
        )}

        {/* ✅ 댓글 */}
        <div className="mt-10">
          <div className="mb-3 text-sm text-zinc-300">댓글</div>

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
                        className="rounded-xl border border-zinc-800/70 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-900/60 disabled:opacity-50"
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
