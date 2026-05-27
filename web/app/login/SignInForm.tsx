// web/app/login/SignInForm.tsx
"use client";

import ProviderButton from "@/components/ProviderButton";
import { useT } from "@/lib/i18n/client";

const KNOWN_ERRORS = [
  "OAuthAccountNotLinked",
  "AccessDenied",
  "Configuration",
  "Verification",
] as const;

interface Props {
  callbackUrl?: string;
  error?: string;
}

export default function SignInForm({ callbackUrl, error }: Props) {
  const t = useT();
  const errorMessage = !error
    ? null
    : (KNOWN_ERRORS as readonly string[]).includes(error)
      ? t(`login.errors.${error}`)
      : t("login.errors.generic", { code: error });

  return (
    <div className="space-y-2">
      {errorMessage && (
        <div
          role="alert"
          className="mb-3 rounded-md border border-brand/30 bg-brand/5 px-3 py-2 text-xs text-brand"
        >
          {errorMessage}
        </div>
      )}
      <ProviderButton provider="github" callbackUrl={callbackUrl} />
      <ProviderButton provider="google" callbackUrl={callbackUrl} />
    </div>
  );
}
