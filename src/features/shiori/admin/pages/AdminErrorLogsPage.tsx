import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import { LoadingText } from "@/shared/ui/feedback/LoadingText";
import ErrorNotice from "@/shared/error/ErrorNotice";

type ErrorLogRow = {
  id: string;
  user_id: string | null;
  category: string;
  action: string | null;
  page: string | null;
  message: string;
  stack: string | null;
  meta: Record<string, unknown>;
  created_at: string;
};

export default function AdminErrorLogsPage() {
  const [rows, setRows] = useState<ErrorLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);

      const { data, error } = await supabase
        .from("error_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }

      setRows((data ?? []) as ErrorLogRow[]);
      setLoading(false);
    })().catch((e) => {
      console.error(e);
      setErr(String((e as Error)?.message ?? e));
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <LoadingText label="에러 로그 불러오는 중..." />;
  }

  if (err) {
    return (
      <ErrorNotice title="에러 로그를 불러오지 못했습니다" message={err} />
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-4 text-2xl font-semibold text-[var(--text-1)]">
        Error Logs
      </h1>

      <div className="space-y-3">
        {rows.map((row) => (
          <SurfaceCard key={row.id} className="p-4">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-4)]">
              <span>{new Date(row.created_at).toLocaleString()}</span>
              <span>·</span>
              <span>{row.category}</span>
              {row.action ? (
                <>
                  <span>·</span>
                  <span>{row.action}</span>
                </>
              ) : null}
            </div>

            <div className="mt-2 text-sm font-semibold text-[var(--text-1)]">
              {row.message}
            </div>

            {row.page ? (
              <div className="mt-2 text-xs text-[var(--text-4)]">
                page: {row.page}
              </div>
            ) : null}

            {row.user_id ? (
              <div className="mt-1 text-xs text-[var(--text-4)]">
                user_id: {row.user_id}
              </div>
            ) : null}

            <div className="mt-3 rounded-xl border p-3 text-xs text-[var(--text-3)]">
              <div className="font-medium text-[var(--text-2)]">meta</div>
              <pre className="mt-2 whitespace-pre-wrap break-words">
                {JSON.stringify(row.meta ?? {}, null, 2)}
              </pre>
            </div>

            {row.stack ? (
              <div className="mt-3 rounded-xl border p-3 text-xs text-[var(--text-3)]">
                <div className="font-medium text-[var(--text-2)]">stack</div>
                <pre className="mt-2 whitespace-pre-wrap break-words">
                  {row.stack}
                </pre>
              </div>
            ) : null}
          </SurfaceCard>
        ))}

        {rows.length === 0 ? (
          <SurfaceCard className="p-4 text-sm text-[var(--text-4)]">
            아직 저장된 에러 로그가 없습니다.
          </SurfaceCard>
        ) : null}
      </div>
    </div>
  );
}
