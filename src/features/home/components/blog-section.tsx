import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/ui/section-heading";
import type { Post } from "@/features/products/types";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";

import { RevealSection } from "./reveal-section";

export function BlogSection({
  posts,
  locale,
  t,
}: {
  posts: Post[];
  locale: Locale;
  t: Dictionary;
}) {
  return (
    <RevealSection className="shell py-12 md:py-16">
      <SectionHeading title={t.blogTitle} action={t.viewAll} actionHref={`/${locale}`} />
      <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-[420px]:grid-cols-1 md:gap-[22px]">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/${locale}`}
            className="group rounded-2xl bg-white p-3 shadow-card transition-[transform,box-shadow] duration-300 hover:-translate-y-1.5 hover:shadow-card-hover"
          >
            <div className="relative mb-3.5 aspect-4/3 overflow-hidden rounded-[10px]">
              <Image
                src={post.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 330px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="mb-1.5 px-1 text-xs text-ink-subtle">
              {post.date} · {post.tag}
            </p>
            <h3 className="px-1 text-[14.5px] leading-normal font-bold transition-colors group-hover:text-accent">
              {post.title}
            </h3>
          </Link>
        ))}
      </div>
    </RevealSection>
  );
}
