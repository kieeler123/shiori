import { useNavigate } from "react-router-dom";

import { Button } from "@/shared/ui/primitives/Button";
import { DropdownMenuPanel } from "@/shared/ui/patterns/DropdownMenuPanel";
import { useI18n } from "@/shared/i18n/LocaleProvider";
import { useAuth } from "@/features/auth/useAuth";
import { isAdmin } from "@/shared/auth/admin";

type Props = {
  open: boolean;
  onClose: () => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
};

export default function HeaderDropdownMenu({ open, onClose, menuRef }: Props) {
  const nav = useNavigate();
  const { t } = useI18n();

  const { user } = useAuth();
  const showAdmin = isAdmin(user);

  const menuDivider = "my-2 border-t border-[var(--border-soft)]";

  if (!open) return null;

  const go = (to: string) => {
    nav(to);
    onClose();
  };

  return (
    <DropdownMenuPanel
      ref={menuRef as any}
      role="menu"
      aria-label={t("common.menu")}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="left-1/2 -translate-x-1/2 top-full mt-2"
    >
      <div className="px-2 py-1 text-xs t5">{t("header.sections.support")}</div>

      <Button
        variant="ghost"
        role="menuitem"
        onClick={() => go("/support")}
        className="w-full justify-start hover:bg-[var(--menu-item-hover-bg)] hover:text-[var(--menu-item-hover-fg)]"
      >
        📋 {t("support.nav.all")}
      </Button>

      <Button
        variant="ghost"
        role="menuitem"
        onClick={() => go("/support/faq")}
        className="w-full justify-start hover:bg-[var(--menu-item-hover-bg)] hover:text-[var(--menu-item-hover-fg)]"
      >
        ❓ {t("support.nav.faq")}
      </Button>

      <Button
        variant="ghost"
        role="menuitem"
        onClick={() => go("/support/new")}
        className="w-full justify-start hover:bg-[var(--menu-item-hover-bg)] hover:text-[var(--menu-item-hover-fg)]"
      >
        📝 {t("support.nav.new")}
      </Button>

      <Button
        variant="ghost"
        role="menuitem"
        onClick={() => go("/support/mine")}
        className="w-full justify-start hover:bg-[var(--menu-item-hover-bg)] hover:text-[var(--menu-item-hover-fg)]"
      >
        🙋 {t("support.nav.mine")}
      </Button>

      <Button
        variant="ghost"
        role="menuitem"
        onClick={() => go("/support/trash")}
        className="w-full justify-start hover:bg-[var(--menu-item-hover-bg)] hover:text-[var(--menu-item-hover-fg)]"
      >
        🗑 {t("support.trash.title")}
      </Button>

      <Button
        variant="ghost"
        role="menuitem"
        onClick={() => go("/settings/account")}
        className="w-full justify-start hover:bg-[var(--menu-item-hover-bg)] hover:text-[var(--menu-item-hover-fg)]"
      >
        ⚙️ {t("header.nav.accountSettings")}
      </Button>

      <div className={menuDivider} />

      <div className="px-2 py-1 text-xs t5">{t("header.sections.misc")}</div>

      <Button
        variant="ghost"
        role="menuitem"
        onClick={() => go("/trash")}
        className="w-full justify-start hover:bg-[var(--menu-item-hover-bg)] hover:text-[var(--menu-item-hover-fg)]"
      >
        🗑 {t("header.nav.trash")}
      </Button>
      {showAdmin && (
        <Button
          variant="adminGhost"
          role="menuitem"
          onClick={() => go("/admin")}
          className="w-full justify-start"
        >
          🛠 {t("header.nav.admin")}
        </Button>
      )}
    </DropdownMenuPanel>
  );
}
