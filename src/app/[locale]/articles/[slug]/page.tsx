import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { articleImage } from "@/features/articles/types";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { formatDate } from "@/lib/format/date";
import { getArticleBySlug } from "@/server/services/article.service";

type PageProps = { params: Promise<{ locale: string; slug: string }> };

/**
 * View counts and publish state change server-side, so — like the product
 * detail page — this renders dynamically per request rather than being
 * prebuilt at `next build` time.
 */
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const description = article.metaDescription ?? article.excerpt ?? undefined;

  return {
    title: article.metaTitle ?? article.title,
    description,
    alternates: { canonical: `/${locale}/articles/${slug}` },
    openGraph: {
      title: article.title,
      description,
      images: [{ url: articleImage(article) }],
      type: "article",
      ...(article.publishedAt ? { publishedTime: article.publishedAt } : {}),
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const [t, article] = await Promise.all([getDictionary(locale), getArticleBySlug(slug)]);

  if (!article) notFound();

  const meta = [
    article.publishedAt ? formatDate(article.publishedAt, locale) : null,
    article.category?.name ?? null,
    article.author?.fullName ?? null,
  ].filter((value): value is string => Boolean(value));

  return (
    <article className="shell max-w-[760px] py-8 md:py-10">
      <Link
        href={`/${locale}/articles`}
        className="mb-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-ink-muted transition-colors hover:text-accent"
      >
        ← {t.articleBack}
      </Link>

      <h1 className="mb-3 text-[24px] leading-[1.3] font-black md:text-[30px]">{article.title}</h1>

      {meta.length > 0 ? (
        <p className="mb-6 text-[13px] text-ink-subtle">{meta.join(" · ")}</p>
      ) : null}

      {article.thumbnail ? (
        <div className="relative mb-7 aspect-16/9 overflow-hidden rounded-2xl bg-mist">
          <Image
            src={article.thumbnail}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 760px"
            className="object-cover"
          />
        </div>
      ) : null}

      {/* Content is author-produced HTML from our own CMS, not user input. */}
      <div
        className="rich-text text-[14.5px] leading-[1.9] text-ink-body"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {article.tags.length > 0 ? (
        <ul className="mt-8 flex flex-wrap gap-2 border-t border-line-soft pt-6">
          {article.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-line-soft bg-mist-soft px-3 py-1 text-[12px] font-semibold text-ink-muted"
            >
              #{tag}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
