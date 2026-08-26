import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { PageSection } from "@/app/layout/PageSection";
import { Button } from "@/shared/ui/primitives/Button";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import { LoadingText } from "@/shared/ui/feedback/LoadingText";

import LogContentRenderer from "@/features/shiori/components/logs/LogContentRenderer";

import {
  adminDbGet,
  adminHideLog,
  adminUnhideLog,
  type AdminLogRow,
} from "@/features/shiori/repo/adminShioriRepo";

export default function AdminLogDetailPage() {
  const navigate = useNavigate();

  const { id } = useParams<{
    id: string;
  }>();

  const [item, setItem] = useState<AdminLogRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const status = useMemo(() => {
    if (!item) {
      return null;
    }

    if (item.is_deleted || item.deleted_scope) {
      return "deleted";
    }

    if (item.is_hidden) {
      return "hidden";
    }

    return "visible";
  }, [item]);

  async function load() {
    if (!id) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const row = await adminDbGet(id);

      setItem(row);

      if (!row) {
        setError("로그를 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("[AdminLogDetailPage] load failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "관리자 로그를 불러오지 못했습니다.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  async function handleToggleHidden() {
    if (!item || busy) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const updated = item.is_hidden
        ? await adminUnhideLog(item.id)
        : await adminHideLog(item.id);

      setItem(updated);
    } catch (error) {
      console.error("[AdminLogDetailPage] hidden toggle failed:", error);

      setError(
        error instanceof Error
          ? error.message
          : "숨김 상태 변경에 실패했습니다.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <PageSection>
        <LoadingText label="관리자 로그 불러오는 중..." />
      </PageSection>
    );
  }

  if (error && !item) {
    return (
      <PageSection>
        <div className="space-y-4">
          <Button variant="soft" onClick={() => navigate(-1)}>
            ← 돌아가기
          </Button>

          <SurfaceCard className="p-4">
            <div className="text-sm text-[var(--danger)]">{error}</div>
          </SurfaceCard>
        </div>
      </PageSection>
    );
  }

  if (!item) {
    return (
      <PageSection>
        <div className="space-y-4">
          <Button variant="soft" onClick={() => navigate(-1)}>
            ← 돌아가기
          </Button>

          <SurfaceCard className="p-4">
            <div className="text-sm text-[var(--text-5)]">
              로그를 찾을 수 없습니다.
            </div>
          </SurfaceCard>
        </div>
      </PageSection>
    );
  }

  return (
    <PageSection>
      <div className="mx-auto max-w-4xl space-y-5">
        {/* 상단 */}
        <div className="flex items-center justify-between gap-3">
          <Button variant="soft" onClick={() => navigate("/admin/data")}>
            ← 관리자 데이터
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="soft"
              onClick={() => navigate(`/admin/logs/${item.id}/edit`)}
            >
              수정
            </Button>

            <Button
              variant={item.is_hidden ? "soft" : "danger"}
              disabled={busy}
              onClick={() => {
                void handleToggleHidden();
              }}
            >
              {busy ? "처리 중..." : item.is_hidden ? "숨김 해제" : "숨김"}
            </Button>
          </div>
        </div>

        {/* 상태 */}
        <SurfaceCard className="p-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={status} />

            {item.import_source === "markdown" ? (
              <span className="rounded-full border border-[var(--border-soft)] px-2 py-1 text-xs text-[var(--text-4)]">
                Markdown
              </span>
            ) : null}
          </div>

          <div className="mt-4 grid gap-2 text-xs text-[var(--text-5)]">
            <div>
              ID: <span className="break-all font-mono">{item.id}</span>
            </div>

            <div>
              user_id:{" "}
              <span className="break-all font-mono">
                {item.user_id ?? "NULL"}
              </span>
            </div>

            <div>
              import_source:{" "}
              <span className="font-mono">{item.import_source ?? "NULL"}</span>
            </div>

            <div>
              source_filename:{" "}
              <span className="break-all font-mono">
                {item.source_filename ?? "NULL"}
              </span>
            </div>

            <div>
              is_hidden: <strong>{String(item.is_hidden)}</strong>
            </div>

            <div>
              is_deleted: <strong>{String(item.is_deleted)}</strong>
            </div>

            <div>
              deleted_scope: <strong>{item.deleted_scope ?? "NULL"}</strong>
            </div>
          </div>
        </SurfaceCard>

        {/* 에러 */}
        {error ? (
          <SurfaceCard className="p-4">
            <div className="text-sm text-[var(--danger)]">{error}</div>
          </SurfaceCard>
        ) : null}

        {/* 제목 */}
        <SurfaceCard className="p-5">
          <h1 className="break-words text-2xl font-semibold tracking-tight text-[var(--text-1)]">
            {item.title || "(제목 없음)"}
          </h1>

          {Array.isArray(item.tags) && item.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-[var(--border-soft)] px-2 py-1 text-xs text-[var(--text-5)]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </SurfaceCard>

        {/* 본문 */}
        <SurfaceCard tone="soft" className="p-5">
          <LogContentRenderer
            logId={item.id}
            content={item.content ?? ""}
            tableData={item.table_data ?? null}
            attachments={item.attachments ?? []}
            links={item.links ?? []}
          />
        </SurfaceCard>

        {/* 날짜 */}
        <SurfaceCard className="p-4">
          <div className="space-y-1 text-xs text-[var(--text-5)]">
            <div>
              created_at:{" "}
              {item.created_at
                ? new Date(item.created_at).toLocaleString()
                : "-"}
            </div>

            <div>
              updated_at:{" "}
              {item.updated_at
                ? new Date(item.updated_at).toLocaleString()
                : "-"}
            </div>
          </div>
        </SurfaceCard>
      </div>
    </PageSection>
  );
}

function StatusBadge({
  status,
}: {
  status: "visible" | "hidden" | "deleted" | null;
}) {
  if (status === "deleted") {
    return (
      <span className="rounded-full border border-[var(--danger)] px-2 py-1 text-xs text-[var(--danger)]">
        삭제 상태
      </span>
    );
  }

  if (status === "hidden") {
    return (
      <span className="rounded-full border border-[var(--border-soft)] px-2 py-1 text-xs text-[var(--text-4)]">
        숨김
      </span>
    );
  }

  return (
    <span className="rounded-full border border-[var(--border-soft)] px-2 py-1 text-xs text-[var(--text-3)]">
      공개
    </span>
  );
}
