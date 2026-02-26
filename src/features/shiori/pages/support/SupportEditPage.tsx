import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";

import RouteProblem from "@/features/shiori/components/RouteProblem";
import { isUuid } from "@/features/shiori/utils/isUuid";

import {
  dbSupportGet,
  dbSupportUpdate,
} from "@/features/shiori/repo/supportRepo";

import { useI18n } from "@/shared/i18n/LocaleProvider";
import { LoadingText } from "@/shared/ui/feedback/LoadingText";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import { Button } from "@/shared/ui/primitives/Button";
import { Input } from "@/shared/ui/primitives/Input";
import { Textarea } from "@/shared/ui/primitives/Textarea";

export default function SupportEditPage() {
  const nav = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { ready, isAuthed, userId } = useSession();
  const { t } = useI18n();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const idOk = isUuid(id);

  const isMine = useMemo(() => {
    if (!isAuthed || !userId) return false;
    return ownerId === userId;
  }, [isAuthed, userId, ownerId]);

  useEffect(() => {
    if (!ready) return;
    if (!idOk) return;

    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const row = await dbSupportGet(id!);
        if (!alive) return;

        if (!row) {
          // 없는 글이면 ownerId만 null로 두고 아래 not-found 처리(원하면)
          setOwnerId(null);
          setTitle("");
          setBody("");
          return;
        }

        setOwnerId(row.user_id);
        setTitle(row.title ?? "");
        setBody(row.body ?? "");
      } finally {
        if (alive) setLoading(false);
      }
    })().catch(console.error);

    return () => {
      alive = false;
    };
    // ✅ 로그인 상태 바뀌어도 다시 fetch (권한/owner 판단 안정)
  }, [ready, idOk, id, isAuthed]);

  async function save() {
    if (!idOk) return;
    if (!isMine) return;
    if (busy) return;

    const tt = title.trim();
    const bb = body.trim();
    if (!tt || !bb) return;

    setBusy(true);
    try {
      await dbSupportUpdate(id!, { title: tt, body: bb });
      nav(`/support/${id}`);
    } finally {
      setBusy(false);
    }
  }

  // ---- states ----

  if (!ready) return <LoadingText label={t("common.sessionChecking")} />;

  if (!idOk) {
    return (
      <RouteProblem
        title={t("support.edit.invalidIdTitle")}
        message={t("support.edit.invalidIdMsg")}
        hint={String(id ?? "")}
      />
    );
  }

  if (!isAuthed) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="text-sm text-[var(--text-sub)] mb-3">
          {t("support.edit.loginRequired")}
        </div>
        <AuthPanel />
      </div>
    );
  }

  if (loading) return <LoadingText label={t("common.loading")} />;

  // (선택) 존재하지 않는 문의 처리도 하고 싶으면 여기서 RouteProblem 추가 가능
  // if (!ownerId) { ... }

  if (!isMine) {
    return (
      <RouteProblem
        title={t("support.edit.forbiddenTitle")}
        message={t("support.edit.forbiddenMsg")}
        hint={`support id: ${String(id)}`}
      />
    );
  }

  // ---- view ----

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight t2">
          {t("support.edit.title")}
        </h2>

        <Button
          variant="ghost"
          onClick={() => nav(`/support/${id}`)}
          disabled={busy}
        >
          {t("support.edit.close")}
        </Button>
      </div>

      <SurfaceCard className="mt-6 space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("support.new.phTitle")}
        />

        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          placeholder={t("support.new.phBody")}
        />

        <div className="flex justify-end">
          <Button
            variant="primary"
            onClick={save}
            disabled={busy || !title.trim() || !body.trim()}
          >
            {busy ? t("support.edit.saving") : t("support.edit.save")}
          </Button>
        </div>
      </SurfaceCard>
    </div>
  );
}
