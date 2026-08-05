import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArticleListBrowser } from "@/features/articles/components/article-list-browser";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { listArticles } from "@/server/services/article.service";

// Article listings and view counts come from the live backend — this page
// must never be frozen into a static HTML file at build time.
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const [{ locale }, { page }] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) return {};

  const t = await getDictionary(locale);

  return {
    title: t.articlesTitle,
    description: t.articlesDesc,
    alternates: { canonical: `/${locale}/articles` },
    ...(page && page !== "1" ? { robots: { index: false, follow: true } } : {}),
  };
}

/**
 * The article listing. A Server Component reading `page` straight out of
 * `searchParams` — the first paint already shows the right page, no client
 * fetch or spinner.
 */
export default async function ArticlesPage({ params, searchParams }: PageProps) {
  const [{ locale }, { page: pageParam }] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();

  const page = Number(pageParam);
  const listing = await listArticles({ page: Number.isInteger(page) && page > 0 ? page : 1 });
  const t = await getDictionary(locale);

  return (
    <div className="shell py-8 md:py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-[12.5px] text-ink-muted">
        <Link href={`/${locale}`} className="transition-colors hover:text-accent">
          {t.navItems[0]}
        </Link>
        <span className="mx-2 text-ink-faint" aria-hidden>
          /
        </span>
        <span className="font-semibold text-ink-body">{t.articlesTitle}</span>
      </nav>

      <header className="mb-7 max-w-[720px]">
        <h1 className="mb-2.5 border-l-[5px] border-accent pl-3.5 text-[26px] leading-tight font-black md:text-[32px]">
          {t.articlesTitle}
        </h1>
        <p className="text-[13.5px] leading-[1.75] text-ink-muted md:text-[14.5px]">
          {t.articlesDesc}
        </p>
      </header>

      {listing.articles.length > 0 ? (
        <ArticleListBrowser listing={listing} locale={locale} />
      ) : (
        <div className="rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
          <p className="mb-2 text-base font-bold">{t.articlesEmptyTitle}</p>
          <p className="text-[13.5px] text-ink-muted">{t.articlesEmptyDesc}</p>
        </div>
      )}
    </div>
  );
}
