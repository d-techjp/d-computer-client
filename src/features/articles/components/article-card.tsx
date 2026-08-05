import Image from "next/image";
import Link from "next/link";

import type { Locale } from "@/i18n/config";
import { formatDate } from "@/lib/format/date";

import { articleImage, type ArticleSummary } from "../types";

export function ArticleCard({ article, locale }: { article: ArticleSummary; locale: Locale }) {
  const meta = [
    article.publishedAt ? formatDate(article.publishedAt, locale) : null,
    article.category?.name ?? article.tags[0] ?? null,
  ].filter((value): value is string => Boolean(value));

  return (
    <Link
      href={`/${locale}/articles/${article.slug}`}
      className="group rounded-2xl bg-white p-3 shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-card-hover"
    >
      <div className="relative mb-3.5 aspect-4/3 overflow-hidden rounded-[10px]">
        <Image
          src={articleImage(article)}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 330px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      {meta.length > 0 ? (
        <p className="mb-1.5 px-1 text-xs text-ink-subtle">{meta.join(" · ")}</p>
      ) : null}
      <h3 className="px-1 text-[14.5px] leading-normal font-bold transition-colors group-hover:text-accent">
        {article.title}
      </h3>
    </Link>
  );
}
