import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useSession } from "@/features/auth/useSession";
import AuthPanel from "@/features/auth/AuthPanel";
import { dbSupportCreate } from "@/features/shiori/repo/supportRepo";

import { Button } from "@/shared/ui/primitives/Button";
import { Input } from "@/shared/ui/primitives/Input";
import { Textarea } from "@/shared/ui/primitives/Textarea";

import { useI18n } from "@/shared/i18n/LocaleProvider";
import { toast } from "@/app/layout/toast"; // 너가 만든 toast() 사용(경로 맞춰)

export default function SupportNewPage() {
  const nav = useNavigate();
  const { ready, isAuthed } = useSession();
  const { t } = useI18n();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  async function submit() {
    if (!isAuthed || busy || !canSubmit) return;

    setBusy(true);
    try {
      const saved = await dbSupportCreate({
        title: title.trim(),
        body: body.trim(),
      });

      toast(t("support.new.created"), "success");
      nav(`/support/${saved.id}`);
    } catch (e) {
      console.error(e);
      // 중요한 오류는 alert도 가능하지만, 일반적으론 toast가 UX 좋음
      toast(String((e as any)?.message ?? e), "error");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <div className="grid place-items-center py-16">
        <div className="text-sm t5">{t("common.sessionChecking")}</div>
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="py-6">
        <div className="text-sm t5 mb-3">{t("support.new.loginRequired")}</div>
        <AuthPanel />
      </div>
    );
  }

  return (
    <div>
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight t2">
          {t("support.new.title")}
        </h2>

        <Button variant="ghost" onClick={() => nav("/support")} disabled={busy}>
          {t("common.close")}
        </Button>
      </div>

      {/* Form */}
      <div className="mt-4 space-y-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("support.new.phTitle")}
          autoFocus
        />

        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={10}
          placeholder={t("support.new.phBody")}
        />

        <div className="flex items-center justify-between gap-3">
          <div className="text-xs t5">
            {busy
              ? t("support.new.submitting")
              : canSubmit
                ? t("support.new.ready")
                : t("support.new.needInput")}
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={submit}
            disabled={!canSubmit || busy}
          >
            {busy ? t("common.processing") : t("common.submit")}
          </Button>
        </div>
      </div>
    </div>
  );
}
