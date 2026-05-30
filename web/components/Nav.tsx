"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Bookmark, History, PieChart, PlayCircle, Zap } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/cn";
import RunsBadge from "@/components/RunsBadge";
import LanguageToggle from "@/components/LanguageToggle";
import { useT } from "@/lib/i18n/client";

const NAV_ITEMS = [
  { href: "/history", key: "history", icon: History },
  { href: "/live", key: "live", icon: Activity },
  { href: "/launch", key: "launch", icon: PlayCircle },
  { href: "/portfolio", key: "portfolio", icon: PieChart },
  { href: "/watchlist", key: "watchlist", icon: Bookmark },
  { href: "/signals", key: "signals", icon: Zap },
] as const;

export default function Nav() {
  const t = useT();
  const pathname = usePathname();
  const { data: session } = useSession();
  const githubId = (session?.user as { githubId?: string } | undefined)?.githubId;

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-bg/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:px-6">
        <Link
          href="/history"
          className="group mr-2 flex items-center gap-2.5 text-fg transition-opacity hover:opacity-90"
        >
          {/* TradiX brand mark — three angled red strokes (Axiara) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mark.png"
            alt="TradiX"
            className="h-[20px] w-[20px]"
            width={20}
            height={20}
          />
          <span className="hidden text-[13px] font-semibold uppercase tracking-[0.14em] sm:inline">
            TradiX
          </span>
        </Link>

        <div className="ml-2 flex flex-1 items-center gap-0.5">
          {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors",
                  active ? "text-fg" : "text-fg-muted hover:text-fg"
                )}
              >
                <Icon className="h-[14px] w-[14px]" aria-hidden />
                <span className="hidden md:inline">{t(`nav.${key}`)}</span>
                {active && (
                  <span
                    className="absolute inset-x-2 -bottom-[14px] h-px bg-brand"
                    aria-hidden
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-[12px]">
          <LanguageToggle />
          {githubId && (
            <>
              <RunsBadge />
              <span className="hidden text-fg-subtle sm:inline">
                <span className="text-fg-subtle">gh:</span>
                <span className="font-mono text-fg-muted">{githubId}</span>
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-fg-subtle transition-colors hover:text-fg"
              >
                {t("nav.signOut")}
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
