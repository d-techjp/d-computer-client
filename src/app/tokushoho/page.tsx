import type { Metadata } from "next";
import Link from "next/link";

import { TOKUSHOHO_ROWS, TOKUSHOHO_UPDATED_AT } from "@/features/legal/tokushoho";
import { getDictionary } from "@/i18n/get-dictionary";

// Rendered per request like the other pages: the layout reads categories and
// site settings from the backend, which is not reachable while CI builds the image.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {

  const t = await getDictionary();
  return {
    title: t.tokushohoTitle,
    alternates: { canonical: `/tokushoho` },
  };
}

export default async function TokushohoPage() {

  return (
    <article className="shell max-w-[860px] py-8 md:py-12">
      <h1 className="mb-2 text-[22px] leading-[1.3] font-black md:text-[28px]">
        特定商取引法に基づく表記
      </h1>
      <p className="mb-7 text-[12.5px] text-ink-subtle">最終更新日：{TOKUSHOHO_UPDATED_AT}</p>

      <dl className="overflow-hidden rounded-2xl border border-line-soft text-[14px] leading-[1.8]">
        {TOKUSHOHO_ROWS.map((row) => (
          <div
            key={row.label}
            className="grid border-b border-line-soft last:border-b-0 md:grid-cols-[200px_1fr]"
          >
            <dt className="bg-mist-soft px-4 pt-3 pb-1 font-bold text-ink-strong md:py-3.5">
              {row.label}
            </dt>
            <dd className="px-4 pt-1 pb-3 text-ink-body md:py-3.5">
              {row.value.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-[13.5px] text-ink-muted">
        保証の詳細は{" "}
        <Link
          href={`/articles/warranty-policy`}
          className="font-bold text-accent hover:underline"
        >
          保証規定
        </Link>{" "}
        をご確認ください。
      </p>
    </article>
  );
}
