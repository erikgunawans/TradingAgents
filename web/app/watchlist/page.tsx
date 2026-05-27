import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { getT } from "@/lib/i18n/server";
import Nav from "@/components/Nav";
import PageHeader from "@/components/PageHeader";
import MonitorSection from "./MonitorSection";
import NotificationSection from "./NotificationSection";
import QuickAddForm from "./QuickAddForm";
import WatchlistTable from "./WatchlistTable";

export const metadata = { title: "Watchlist · TradingAgents" };

export default async function WatchlistPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");
  const t = await getT();

  const [items, me, notify] = await Promise.all([
    api.listWatchlist(),
    api.me(),
    api.getNotifications(),
  ]);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <PageHeader
          eyebrow={t("watchlistPage.eyebrow")}
          title={t("watchlistPage.title")}
          description={t("watchlistPage.description")}
        />
        <div className="mt-6 space-y-6">
          <MonitorSection
            initial={{
              enabled: me.monitor_enabled,
              briefingTimeLocal: me.briefing_time_local,
              briefingTz: me.briefing_tz,
              nextBriefingAt: null,
            }}
            tickerCount={items.length}
            tickers={items.map((i) => i.ticker)}
          />
          <NotificationSection initial={notify} hasEmail={me.email != null} />
          <QuickAddForm />
          <WatchlistTable initialItems={items} />
        </div>
      </main>
    </>
  );
}
