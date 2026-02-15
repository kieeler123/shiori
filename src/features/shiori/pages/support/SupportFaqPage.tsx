import { useEffect, useMemo, useState } from "react";
import { dbFaqList } from "@/features/shiori/repo/supportFaqRepo";
import type { SupportFaqRow } from "../../type";

import { Input } from "@/shared/ui/primitives/Input";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";

function normalize(s: string) {
  return String(s ?? "")
    .trim()
    .toLowerCase();
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
      {/* 상단 */}
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm t5">
          {loading ? "불러오는 중…" : `FAQ ${filtered.length}개`}
        </div>
      </div>

      {/* 검색 */}
      <div className="mt-3">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="검색: 로그인, 휴지통, 삭제, 문의…"
        />
      </div>

      {/* 에러 */}
      {err ? (
        <SurfaceCard className="mt-4 border-[color:var(--danger-border)] bg-[var(--danger-bg)]">
          <div className="text-sm text-[var(--danger-fg)]">{err}</div>
        </SurfaceCard>
      ) : null}

      {/* 리스트 */}
      <div className="mt-4 space-y-2">
        {loading ? (
          <div className="text-sm t5">불러오는 중…</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm t6">검색 결과가 없습니다.</div>
        ) : (
          filtered.map((r) => {
            const isOpen = openId === r.id;

            return (
              <SurfaceCard
                key={r.id}
                className="p-0 overflow-hidden"
                tone="soft"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenId((cur) => (cur === r.id ? null : r.id))
                  }
                  className={[
                    "w-full text-left p-4 rounded-2xl transition",
                    "hover:bg-[rgba(255,255,255,0.03)]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      {r.category ? (
                        <div className="text-xs t6">{r.category}</div>
                      ) : null}

                      <div className="mt-1 text-sm t2 truncate">
                        Q. {r.title}
                      </div>
                    </div>

                    <div className="shrink-0 text-xs t6">
                      {isOpen ? "닫기" : "열기"}
                    </div>
                  </div>
                </button>

                {isOpen ? (
                  <div className="px-4 pb-4">
                    <SurfaceCard tone="panel" className="p-4">
                      <div className="text-sm t4 whitespace-pre-wrap break-words">
                        {r.body}
                      </div>
                      <div className="mt-3 text-xs t6">
                        업데이트: {new Date(r.updated_at).toLocaleString()}
                      </div>
                    </SurfaceCard>
                  </div>
                ) : null}
              </SurfaceCard>
            );
          })
        )}
      </div>

      {/* 하단 안내 */}
      <div className="mt-6 text-xs t6">
        FAQ를 읽어도 해결되지 않으면, 상단 탭에서 “제보하기”로 문의해 주세요.
      </div>
    </div>
  );
}
