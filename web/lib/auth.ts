import NextAuth, { type NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

const secret = process.env.NEXTAUTH_SECRET;
// The secret is only ever used server-side (JWT signing in bearer()/NextAuth).
// Scope the hard-fail to the server: this module transitively reaches the
// browser bundle via client components that import @/lib/api, and under
// `next dev` process.env.NEXTAUTH_SECRET is undefined client-side (no build-time
// inlining like prod's Dockerfile does), which would otherwise crash every
// authed page on hydration. Production (server) behaviour is unchanged.
if (!secret && typeof window === "undefined") {
  throw new Error("NEXTAUTH_SECRET is required");
}

const providers: NextAuthConfig["providers"] = [
  GitHub({
    clientId: process.env.AUTH_GITHUB_ID!,
    clientSecret: process.env.AUTH_GITHUB_SECRET!,
  }),
  Google({
    clientId: process.env.AUTH_GOOGLE_ID!,
    clientSecret: process.env.AUTH_GOOGLE_SECRET!,
  }),
];

// Dev-only credentials backdoor. Hard-fails if it ever sees production —
// guards against env-var drift (E2E_TEST_MODE=1 leaking into prod) per
// the design spec §3 and the 13 memory observations flagging this risk.
if (process.env.E2E_TEST_MODE === "1") {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "E2E_TEST_MODE=1 cannot run with NODE_ENV=production. " +
        "This guards the credentials-provider backdoor from env-var drift."
    );
  }
  providers.push(
    Credentials({
      name: "e2e",
      credentials: { githubId: { label: "GitHub ID" } },
      async authorize(c) {
        if (!c?.githubId) return null;
        const id = String(c.githubId);
        return { id, email: `${id}@e2e.local` };
      },
    })
  );
}

// TEMPORARY open-access guest login. UNLIKE the E2E backdoor above, this is
// *allowed in production* — it exists so anyone can get into the dashboard
// while Google OAuth is being set up. It is gated behind its own explicit
// env flag so it is OFF by default and trivially reversible: remove
// ALLOW_GUEST_LOGIN from the environment and the provider (and the /login
// button) disappear on the next restart. SECURITY: while enabled, anyone who
// reaches the URL can sign in and spend LLM credits. Turn it off once real
// OAuth works.
if (process.env.ALLOW_GUEST_LOGIN === "1") {
  providers.push(
    Credentials({
      id: "guest",
      name: "Guest",
      credentials: { name: { label: "Name" } },
      async authorize(c) {
        const raw = typeof c?.name === "string" ? c.name.trim() : "";
        // A typed name → a stable personal space (own watchlist/runs).
        // Blank → a throwaway guest id so two anonymous guests don't collide.
        const slug = raw
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 32);
        const id = slug
          ? `guest-${slug}`
          : `guest-${globalThis.crypto.randomUUID().slice(0, 8)}`;
        return { id, email: `${id}@guest.local`, name: raw || "Guest" };
      },
    })
  );
}

export const authConfig: NextAuthConfig = {
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  jwt: {
    // HS256 by default — matches server/app/auth.py
  },
  callbacks: {
    async jwt({ token, account, profile, user }) {
      if (account?.provider === "google" && profile) {
        const p = profile as { sub: string; email?: string };
        token.sub = String(p.sub);
        if (p.email) token.email = p.email;
        (token as { provider?: string }).provider = "google";
      } else if (account?.provider === "github" && profile) {
        const p = profile as { id: number | string; email?: string };
        token.sub = String(p.id);
        if (p.email) token.email = p.email;
        (token as { provider?: string }).provider = "github";
      } else if (account?.provider === "guest" && user) {
        token.sub = String(user.id);
        if (user.email) token.email = user.email;
        (token as { provider?: string }).provider = "guest";
      } else if (user && process.env.E2E_TEST_MODE === "1") {
        token.sub = String(user.id);
        if (user.email) token.email = user.email;
        (token as { provider?: string }).provider = "e2e";
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        const u = session.user as { providerId?: string; githubId?: string };
        u.providerId = token.sub;
        // Legacy alias — kept for code paths that still read githubId.
        // Remove in a later refactor once consumers migrate to providerId.
        u.githubId = token.sub;
      }
      return session;
    },
  },
  secret,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
