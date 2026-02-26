import { Outlet } from "react-router-dom";
import { useSession } from "@/features/auth/useSession";
import { SurfaceCard } from "@/shared/ui/patterns/SurfaceCard";
import TabButton from "@/shared/ui/primitives/TabButton";
import { PageSection } from "./PageSection";
import { useI18n } from "@/shared/i18n/LocaleProvider";

export default function SupportLayout() {
  const { isAuthed } = useSession();
  const { t } = useI18n();

  return (
    <PageSection>
      {/* ✅ Page가 컨테이너를 이미 갖고 있다면, 여기서 max-w/px/py를 또 주지 말기 */}
      <div className="space-y-4">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-[color:var(--text-strong)]">
            {t("support.layout.title")}
          </h1>
          <p className="mt-1 text-sm text-[color:var(--text-muted)]">
            {t("support.layout.subtitle")}
          </p>
        </header>
        {/* 탭 */}
        <SurfaceCard className="flex flex-wrap gap-2">
          <TabButton to="/support" end>
            {t("support.nav.all")}
          </TabButton>
          <TabButton to="/support/faq">{t("support.nav.faq")}</TabButton>

          {isAuthed ? (
            <>
              <TabButton to="/support/new">{t("support.nav.new")}</TabButton>
              <TabButton to="/support/mine">{t("support.nav.mine")}</TabButton>
              <TabButton to="/support/trash">
                {t("support.nav.trash")}
              </TabButton>
            </>
          ) : null}
        </SurfaceCard>
        {/* 내용 */}
        <SurfaceCard>
          <Outlet />
        </SurfaceCard>
      </div>
    </PageSection>
  );
}
