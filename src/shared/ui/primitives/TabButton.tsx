import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { cn } from "@/shared/ui/utils/cn";

type Props = {
  to: string;
  children: ReactNode;
  end?: boolean;
  className?: string;
};

const tabBase =
  "px-3 py-2 text-sm rounded-xl transition cursor-pointer border " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]";

const tabActive =
  "bg-[var(--bg-elev-2)] text-[color:var(--text-2)] border-[color:var(--border-strong)]";

const tabIdle =
  "bg-transparent text-[color:var(--text-5)] border-[color:var(--border-soft)] " +
  "hover:bg-[var(--bg-elev-1)] hover:text-[color:var(--text-3)]";

export default function TabButton({ to, children, end, className }: Props) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(tabBase, isActive ? tabActive : tabIdle, className)
      }
    >
      {children}
    </NavLink>
  );
}
