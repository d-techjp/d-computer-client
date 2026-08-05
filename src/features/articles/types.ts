export type ArticleCategory = { id: string; name: string; slug: string };
export type ArticleAuthor = { id: string; fullName: string };

export type ArticleSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  thumbnail: string | null;
  publishedAt: string | null;
  tags: string[];
  viewCount: number;
  category: ArticleCategory | null;
  author: ArticleAuthor | null;
};

export type Article = ArticleSummary & {
  content: string;
  metaTitle: string | null;
  metaDescription: string | null;
};

const FALLBACK_IMAGE = "/images/post-content.webp";

export function articleImage(article: Pick<Article, "thumbnail">): string {
  return article.thumbnail ?? FALLBACK_IMAGE;
}
