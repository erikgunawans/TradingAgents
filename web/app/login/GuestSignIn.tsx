// web/app/login/GuestSignIn.tsx
// TEMPORARY open-access guest login. Rendered on /login ONLY when the server
// has ALLOW_GUEST_LOGIN=1 (see login/page.tsx) and backed by the "guest"
// credentials provider in web/lib/auth.ts. Lets anyone into the dashboard
// while Google OAuth is being set up. Remove the env flag to make it vanish.
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useT } from "@/lib/i18n/client";

export default function GuestSignIn({ callbackUrl }: { callbackUrl?: string }) {
  const t = useT();
  const [name, setName] = useState("");

  return (
    <form
      className="mt-4 space-y-2 border-t border-white/[0.06] pt-4 text-left"
      onSubmit={(e) => {
        e.preventDefault();
        void signIn("guest", { name, callbackUrl: callbackUrl ?? "/history" });
      }}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fg-muted">
        {t("login.guestHeading")}
      </p>
      <input
        aria-label={t("login.guestNameLabel")}
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("login.guestNamePlaceholder")}
        autoComplete="off"
        className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-fg-primary placeholder:text-fg-subtle/70"
      />
      <button
        type="submit"
        className="w-full rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm font-medium text-brand transition hover:bg-brand/15"
      >
        {t("login.guestButton")}
      </button>
    </form>
  );
}
