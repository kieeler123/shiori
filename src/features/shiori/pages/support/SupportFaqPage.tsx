import { useEffect, useMemo, useState } from "react";
import {
  dbFaqList,
  type SupportFaqRow,
} from "@/features/shiori/repo/supportFaqRepo";

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export default function SupportFaqPage() {
  const [rows, setRows] = useState<SupportFaqRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const data = await dbFaqList();
      setRows(data);
    } catch (e) {
      console.error(e);
      setErr(String((e as any)?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const nq = normalize(q);
    if (!nq) return rows;
    return rows.filter((r) => {
      const hay = `${r.title}\n${r.body}\n${r.category ?? ""}`.toLowerCase();
      return hay.includes(nq);
    });
  }, [rows, q]);

  return (
    <div>
      {/* 상단 검색 */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-zinc-400">
          {loading ? "불러오는 중…" : `FAQ ${filtered.length}개`}
        </div>

        <button
          type="button"
          onClick={() => {
            setOpenId(null);
            setQ("");
            load();
          }}
          className="cursor-pointer rounded-xl border border-zinc-800/70 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900/60"
          disabled={loading}
        >
          새로고침
        </button>
      </div>

      <div className="mt-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="검색: 로그인, 휴지통, 삭제, 문의…"
          className="w-full rounded-2xl border border-zinc-800/70 bg-zinc-950/40 px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:ring-2 focus:ring-zinc-700/60"
        />
      </div>

      {err ? (
        <div className="mt-4 rounded-2xl border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-200">
          {err}
        </div>
      ) : null}

      {/* FAQ 리스트 */}
      <div className="mt-4 space-y-2">
        {loading ? (
          <div className="text-sm text-zinc-400">불러오는 중…</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-zinc-500">검색 결과가 없습니다.</div>
        ) : (
          filtered.map((r) => {
            const isOpen = openId === r.id;
            return (
              <div
                key={r.id}
                className="rounded-2xl border border-zinc-800/60 bg-zinc-900/30"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenId((cur) => (cur === r.id ? null : r.id))
                  }
                  className="cursor-pointer w-full text-left p-4 hover:bg-zinc-900/40 rounded-2xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {r.category ? (
                        <div className="text-xs text-zinc-500">
                          {r.category}
                        </div>
                      ) : null}
                      <div className="mt-1 text-sm text-zinc-100">
                        Q. {r.title}
                      </div>
                    </div>
                    <div className="shrink-0 text-xs text-zinc-500">
                      {isOpen ? "닫기" : "열기"}
                    </div>
                  </div>
                </button>

                {isOpen ? (
                  <div className="px-4 pb-4">
                    <div className="rounded-2xl border border-zinc-800/60 bg-zinc-950/30 p-4">
                      <div className="text-sm text-zinc-200 whitespace-pre-wrap break-words">
                        {r.body}
                      </div>
                      <div className="mt-3 text-xs text-zinc-600">
                        업데이트: {new Date(r.updated_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>

      {/* 하단 안내 */}
      <div className="mt-6 text-xs text-zinc-600">
        FAQ를 읽어도 해결되지 않으면, 상단 탭에서 “제보하기”로 문의해 주세요.
      </div>
    </div>
  );
}
