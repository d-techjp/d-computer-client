import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { RegisterForm } from "@/features/auth/components/register-form";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

// Rendered per request like the other pages: the layout reads categories and
// site settings from the backend, which is not reachable while CI builds the image.
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string | string[] }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const t = await getDictionary(locale);
  return { title: t.authRegisterTitle, robots: { index: false, follow: false } };
}

export default async function RegisterPage({ params, searchParams }: PageProps) {
  const [{ locale }, { next }] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();

  const t = await getDictionary(locale);
  return (
    <AuthShell title={t.authRegisterTitle} subtitle={t.authRegisterSubtitle}>
      <RegisterForm next={typeof next === "string" ? next : null} />
    </AuthShell>
  );
}
