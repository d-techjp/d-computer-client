import { SectionHeading } from "@/components/ui/section-heading";
import { ArticleCard } from "@/features/articles/components/article-card";
import type { ArticleSummary } from "@/features/articles/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

import { RevealSection } from "./reveal-section";

export function BlogSection({
  articles,
  locale,
  t,
}: {
  articles: ArticleSummary[];
  locale: Locale;
  t: Dictionary;
}) {
  if (articles.length === 0) return null;

  return (
    <RevealSection className="shell py-12 md:py-16">
      <SectionHeading
        title={t.blogTitle}
        action={t.viewAll}
        actionHref={`/${locale}/articles`}
      />
      <div className="grid grid-cols-1 gap-4 xs:grid-cols-2 md:gap-[22px] lg:grid-cols-4">
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} locale={locale} />
        ))}
      </div>
    </RevealSection>
  );
}
