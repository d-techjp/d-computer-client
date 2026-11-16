import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { formatDate } from "@/lib/format/date";
import { getPageBySlug } from "@/server/services/page.service";

type PageProps = { params: Promise<{ slug: string }> };

/**
 * Admin-managed static pages (privacy policy, about, guides…) at the site root.
 *
 * Next matches every named route (`/products`, `/cart`…) before this dynamic
 * segment, so a page can never shadow one; the backend also refuses those
 * slugs so the admin cannot publish a page that would never show.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) return {};

  const description = page.metaDescription ?? undefined;
  return {
    title: page.metaTitle ?? page.title,
    description,
    alternates: { canonical: `/${page.slug}` },
    openGraph: { title: page.metaTitle ?? page.title, description, type: "article" },
  };
}

export default async function StaticPageRoute({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);
  if (!page) notFound();

  return (
    <article className="shell max-w-[860px] py-8 md:py-12">
      <h1 className="mb-2 text-[22px] leading-[1.3] font-black md:text-[28px]">{page.title}</h1>
      <p className="mb-7 text-[12.5px] text-ink-subtle">最終更新日：{formatDate(page.updatedAt)}</p>

      {/* Content is author-produced HTML from our own admin, not user input. */}
      <div
        className="rich-text text-[14.5px] leading-[1.9] text-ink-body"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </article>
  );
}
