import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { getT } from "@/lib/i18n/server";
import Nav from "@/components/Nav";
import PageHeader from "@/components/PageHeader";
import SignalsFeed from "./SignalsFeed";

export const metadata = { title: "Signals · TradiX" };

export default async function SignalsPage() {
  const session = await auth();
  if (!session?.user) redirect("/api/auth/signin");
  const t = await getT();

  const [signals, me] = await Promise.all([
    api.signalsToday(),
    api.me(),
  ]);

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <PageHeader
          eyebrow={t("signals.eyebrow")}
          title={t("signals.title")}
          description={
            signals.trade_date
              ? t("signals.descWithDate", { date: signals.trade_date })
              : t("signals.descDefault")
          }
        />
        <div className="mt-6">
          <SignalsFeed
            initial={signals}
            monitorEnabled={me.monitor_enabled}
            tz={me.briefing_tz}
          />
        </div>
      </main>
    </>
  );
}
