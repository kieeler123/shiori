import { useEffect, useState } from "react";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import {
  dbFaqList,
  type SupportFaqRow,
} from "@/features/shiori/repo/supportFaqRepo";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";

export default function SupportFaqPage() {
  const { locale, t } = useI18n();
  const [rows, setRows] = useState<SupportFaqRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    dbFaqList(locale)
      .then((data) => {
        if (!alive) return;
        setRows(data);
      })
      .catch(console.error)
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [locale]);

  return (
    <section className="mt-6 space-y-3">
      <header>
        <h2 className="text-lg font-semibold">{t("support.nav.faq")}</h2>
      </header>

      {loading ? (
        <div className="text-sm text-[var(--text-sub)]">
          {t("common.loading")}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-[var(--text-sub)]">
          {t("support.faq.empty")}
        </div>
      ) : (
        rows.map((r) => (
          <SurfaceCard key={r.id} className="p-4 space-y-2">
            <div className="font-medium">{r.title}</div>
            <div className="text-sm text-[var(--text-sub)] whitespace-pre-line">
              {r.body}
            </div>
          </SurfaceCard>
        ))
      )}
    </section>
  );
}
