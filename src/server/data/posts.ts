import "server-only";

import type { Localized } from "@/i18n/config";

export type PostRecord = {
  slug: string;
  date: string;
  image: string;
  tag: Localized<string>;
  title: Localized<string>;
};

export const POST_RECORDS: PostRecord[] = [
  {
    slug: "holiday-schedule",
    date: "2026.07.20",
    image: "/images/post-calendar.png",
    tag: { vi: "Thông báo", ja: "お知らせ" },
    title: {
      vi: "Thông báo lịch làm việc dịp lễ",
      ja: "大型連休期間中の営業について",
    },
  },
  {
    slug: "rtx-4070-ti-super-review",
    date: "2026.07.15",
    image: "/images/post-card-article.png",
    tag: { vi: "Blog", ja: "ブログ" },
    title: {
      vi: "Đánh giá chi tiết RTX 4070 Ti SUPER",
      ja: "RTX 4070 Ti SUPERの性能を徹底検証！",
    },
  },
  {
    slug: "diy-vs-prebuilt",
    date: "2026.07.10",
    image: "/images/post-assembly-pc.png",
    tag: { vi: "Blog", ja: "ブログ" },
    title: {
      vi: "So sánh PC tự lắp và PC dựng sẵn",
      ja: "自作PCとBTOの違いとは？それぞれのメリットを解説",
    },
  },
  {
    slug: "site-renewal",
    date: "2026.07.01",
    image: "/images/post-content.webp",
    tag: { vi: "Thông báo", ja: "お知らせ" },
    title: {
      vi: "Thông báo ra mắt giao diện mới",
      ja: "サイトリニューアルのお知らせ",
    },
  },
];
