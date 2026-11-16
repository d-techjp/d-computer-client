import type { Metadata } from "next";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { getDictionary } from "@/i18n/get-dictionary";

// Rendered per request like the other pages: the layout reads categories and
// site settings from the backend, which is not reachable while CI builds the image.
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ next?: string | string[] }>;
};

export async function generateMetadata(): Promise<Metadata> {

  const t = await getDictionary();
  return { title: t.authLoginTitle, robots: { index: false, follow: false } };
}

export default async function LoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  const t = await getDictionary();
  return (
    <AuthShell title={t.authLoginTitle} subtitle={t.authLoginSubtitle}>
      <LoginForm next={typeof next === "string" ? next : null} />
    </AuthShell>
  );
}
