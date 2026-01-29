import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import type { LogItem } from "../features/shiori/types";
import { loadLogs, saveLogs } from "../features/shiori/utils/storage";
import LogEditor from "../features/shiori/components/LogEditor";

function previewText(s: string, max = 100) {
  const oneLine = String(s ?? "")
    .replace(/\s+/g, " ")
    .trim();
  return oneLine.length > max ? oneLine.slice(0, max) + "…" : oneLine;
}

function tokenizeText(s: string) {
  return String(s ?? "")
    .toLowerCase()
    .split(/[\s.,!?/(){}\[\]"'“”‘’<>:;|\\-]+/)
    .filter(Boolean);
}

/**
 * 관련글 점수 (MVP)
 * - 태그 겹침: +6 / 개
 * - 텍스트 토큰 겹침: +1 / 개
 * - 최신 가중치: +1
 */
function calcRelated(logs: LogItem[], current: LogItem, limit = 8) {
  const curTags = new Set((current.tags ?? []).map((t) => t.toLowerCase()));
  const curTokens = new Set(
    tokenizeText(`${current.title} ${current.content}`).slice(0, 200),
  );

  return logs
    .filter((x) => x.id !== current.id)
    .map((x) => {
      const tags = (x.tags ?? []).map((t) => t.toLowerCase());
      let score = 0;

      for (const t of tags) if (curTags.has(t)) score += 6;

      const tokens = tokenizeText(`${x.title} ${x.content}`).slice(0, 200);
      for (const tok of tokens) if (curTokens.has(tok)) score += 1;

      if (Date.parse(x.createdAt)) score += 1;

      return { item: x, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.item);
}

export default function LogDetailPage() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [logs, setLogs] = useState<LogItem[]>(() => loadLogs());
  const [editing, setEditing] = useState(false);

  const log = useMemo(() => logs.find((x) => x.id === id) ?? null, [logs, id]);

  // ✅ 공통 인터랙션 스타일
  const actionBtn =
    "cursor-pointer rounded-xl px-3 py-1 text-sm transition " +
    "text-zinc-300 hover:text-zinc-100 " +
    "hover:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-zinc-700/60";

  const dangerBtn =
    "cursor-pointer rounded-xl px-3 py-1 text-sm transition " +
    "text-zinc-400 hover:text-red-300 " +
    "hover:bg-zinc-900/60 focus:outline-none focus:ring-2 focus:ring-red-500/30";

  const tagBtn =
    "cursor-pointer select-none rounded-full px-2 py-1 text-xs transition " +
    "border border-zinc-800/70 text-zinc-400 " +
    "hover:bg-zinc-900/70 hover:text-zinc-100 " +
    "focus:outline-none focus:ring-2 focus:ring-zinc-700/60";

  const relatedCard =
    "cursor-pointer text-left rounded-2xl border border-zinc-800/60 " +
    "bg-zinc-900/40 p-4 transition " +
    "hover:bg-zinc-900/70 hover:border-zinc-700/70 " +
    "active:scale-[0.99] " +
    "focus:outline-none focus:ring-2 focus:ring-zinc-700/60";

  function remove() {
    if (!log) return;
    const next = logs.filter((x) => x.id !== log.id);
    setLogs(next);
    saveLogs(next);
    nav("/logs");
  }

  function update(v: { title: string; content: string; tags: string[] }) {
    if (!log) return;

    const next = logs.map((x) =>
      x.id === log.id
        ? {
            ...x,
            title: v.title || "(제목 없음)",
            content: v.content,
            tags: v.tags,
          }
        : x,
    );

    setLogs(next);
    saveLogs(next);
    setEditing(false);
  }

  const related = useMemo(() => {
    if (!log) return [];
    return calcRelated(logs, log, 8);
  }, [logs, log]);

  const curTagSet = useMemo(() => {
    if (!log) return new Set<string>();
    return new Set((log.tags ?? []).map((t) => t.toLowerCase()));
  }, [log]);

  // ✅ 태그 클릭 UX(지금은 /logs로 이동만; 나중에 ?tag= 로 확장하면 완벽)
  function goTag(tag: string) {
    nav("/logs");
  }

  if (!log) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <button onClick={() => nav("/logs")} className={actionBtn}>
            ← 목록으로
          </button>
          <div className="mt-6 text-sm text-zinc-400">
            글을 찾을 수 없습니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-6 py-8">
        <header className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <button onClick={() => nav(-1)} className={actionBtn}>
              ← 뒤로
            </button>

            <div className="flex items-center gap-2">
              {!editing ? (
                <button onClick={() => setEditing(true)} className={actionBtn}>
                  수정
                </button>
              ) : (
                <button onClick={() => setEditing(false)} className={actionBtn}>
                  취소
                </button>
              )}

              <button onClick={remove} className={dangerBtn}>
                삭제
              </button>
            </div>
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            {log.title}
          </h1>

          <div className="mt-1 text-sm text-zinc-500">
            {new Date(log.createdAt).toLocaleString()}
          </div>
        </header>

        {!editing ? (
          <>
            <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-5">
              <p className="whitespace-pre-wrap text-sm text-zinc-200">
                {log.content}
              </p>
            </div>

            {/* ✅ 태그 버튼화 */}
            <div className="mt-4 flex flex-wrap gap-2">
              {log.tags.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={tagBtn}
                  onClick={() => goTag(t)}
                  title={`#${t} 관련 글 보기`}
                >
                  #{t}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-zinc-800/60 bg-zinc-900/50 p-5">
            <LogEditor
              syncKey={log.id}
              key={`edit:${log.id}`}
              initialTitle={log.title}
              initialContent={log.content}
              initialTags={log.tags}
              submitLabel="수정 저장"
              onCancel={() => setEditing(false)}
              onSubmit={update}
            />
          </div>
        )}

        {/* ✅ 관련글 */}
        {related.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-sm font-semibold text-zinc-200">
              관련 글
              <span className="ml-2 text-xs text-zinc-500">
                (태그/내용 기반 추천)
              </span>
            </h2>

            <div className="mt-3 grid gap-3">
              {related.map((r) => {
                const sharedTags = (r.tags ?? []).filter((t) =>
                  curTagSet.has(t.toLowerCase()),
                );

                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => nav(`/logs/${r.id}`)}
                    className={relatedCard}
                    title="상세 보기"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate font-medium text-zinc-100">
                          {r.title}
                        </div>
                        <div className="mt-1 text-sm text-zinc-400">
                          {previewText(r.content, 90)}
                        </div>
                      </div>
                      <div className="shrink-0 text-xs text-zinc-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {/* ✅ 겹치는 태그만 버튼화 (카드 클릭 방지 stopPropagation) */}
                    {sharedTags.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {sharedTags.slice(0, 8).map((t) => (
                          <button
                            key={t}
                            type="button"
                            className={tagBtn}
                            onClick={(e) => {
                              e.stopPropagation();
                              goTag(t);
                            }}
                            title={`#${t} 관련 글 보기`}
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
