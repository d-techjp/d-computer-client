import "server-only";

import type { Localized } from "@/i18n/config";

/**
 * Authoring shape for the catalogue: one record per product, every
 * user-visible string carried per locale. Stands in for what a CMS or database
 * row would return. `productService` is the only module allowed to read it.
 */
export type ProductRecord = {
  slug: string;
  name: string;
  image: string;
  tag: Localized<string>;
  specs: Localized<string>;
  description: Localized<string>;
  /** List price per storefront: JPY for `ja`, VND for `vi`. */
  price: Localized<number>;
  specTable: Array<{ label: Localized<string>; value: Localized<string> }>;
};

/** Every product carries the same standing storefront discount. */
export const DISCOUNT_PERCENT = 10;

const label = (vi: string, ja: string): Localized<string> => ({ vi, ja });

export const PRODUCT_RECORDS: ProductRecord[] = [
  {
    slug: "d-game-premium",
    name: "D-Game Premium",
    image: "/images/pc1.png",
    tag: label("Bán chạy #1", "人気No.1"),
    specs: label(
      "Ryzen 7 7800X3D / RTX 4070 Ti SUPER / 32GB / 1TB SSD",
      "Ryzen 7 7800X3D / RTX 4070 Ti SUPER 32GB / 1TB SSD",
    ),
    description: label(
      "Cấu hình đầu bảng dành cho game thủ và streamer, xử lý mượt mọi tựa game AAA ở độ phân giải cao với tốc độ khung hình vượt trội.",
      "ゲーマーやストリーマー向けの最上位モデル。高解像度でも快適なフレームレートで最新AAAタイトルを楽しめます。",
    ),
    price: { vi: 24_900_000, ja: 249_800 },
    specTable: [
      { label: label("CPU", "CPU"), value: label("AMD Ryzen 7 7800X3D", "AMD Ryzen 7 7800X3D") },
      { label: label("GPU", "GPU"), value: label("RTX 4070 Ti SUPER 16GB", "RTX 4070 Ti SUPER 16GB") },
      { label: label("RAM", "RAM"), value: label("32GB DDR5 6000MHz", "32GB DDR5 6000MHz") },
      { label: label("Ổ cứng", "ストレージ"), value: label("1TB SSD NVMe Gen4", "1TB SSD NVMe Gen4") },
      { label: label("Nguồn (PSU)", "電源"), value: label("850W 80+ Gold", "850W 80+ Gold") },
      { label: label("Tản nhiệt", "冷却"), value: label("Tản nước AIO 280mm", "280mm AIO 水冷") },
      { label: label("Case", "ケース"), value: label("Mid Tower kính cường lực", "強化ガラス ミドルタワー") },
      { label: label("Bảo hành", "保証"), value: label("6 tháng", "6ヶ月") },
    ],
  },
  {
    slug: "d-game-standard",
    name: "D-Game Standard",
    image: "/images/card1.png",
    tag: label("Giá tốt", "コスパ重視"),
    specs: label(
      "Ryzen 5 7600 / RTX 4060 Ti / 16GB / 1TB SSD",
      "Ryzen 5 7600 / RTX 4060 Ti 16GB / 1TB SSD",
    ),
    description: label(
      "Lựa chọn cân bằng giữa hiệu năng và chi phí, phù hợp cho game thủ muốn trải nghiệm mượt mà mà không cần đầu tư quá nhiều.",
      "性能とコストのバランスが取れた一台。予算を抑えつつ快適なゲーム体験を求める方に最適です。",
    ),
    price: { vi: 15_900_000, ja: 159_800 },
    specTable: [
      { label: label("CPU", "CPU"), value: label("AMD Ryzen 5 7600", "AMD Ryzen 5 7600") },
      { label: label("GPU", "GPU"), value: label("RTX 4060 Ti 16GB", "RTX 4060 Ti 16GB") },
      { label: label("RAM", "RAM"), value: label("16GB DDR5 5600MHz", "16GB DDR5 5600MHz") },
      { label: label("Ổ cứng", "ストレージ"), value: label("1TB SSD NVMe Gen4", "1TB SSD NVMe Gen4") },
      { label: label("Nguồn (PSU)", "電源"), value: label("650W 80+ Bronze", "650W 80+ Bronze") },
      { label: label("Tản nhiệt", "冷却"), value: label("Tản khí Tower", "タワー型空冷") },
      { label: label("Case", "ケース"), value: label("Mid Tower kính cường lực", "強化ガラス ミドルタワー") },
      { label: label("Bảo hành", "保証"), value: label("6 tháng", "6ヶ月") },
    ],
  },
  {
    slug: "d-workstation-pro",
    name: "D-Workstation Pro",
    image: "/images/ram1.png",
    tag: label("Cho Creator", "クリエイター向け"),
    specs: label(
      "Core i9-14900K / RTX 4070 / 64GB / 2TB SSD",
      "Core i9-14900K / RTX 4070 64GB / 2TB SSD",
    ),
    description: label(
      "Sức mạnh xử lý vượt trội cho dựng phim, render 3D và đa nhiệm nặng, đáp ứng tốt nhu cầu sáng tạo chuyên nghiệp.",
      "動画編集や3Dレンダリング、重いマルチタスクにも対応するハイパワー構成。プロのクリエイティブ用途に最適です。",
    ),
    price: { vi: 32_900_000, ja: 329_800 },
    specTable: [
      { label: label("CPU", "CPU"), value: label("Intel Core i9-14900K", "Intel Core i9-14900K") },
      { label: label("GPU", "GPU"), value: label("RTX 4070 12GB", "RTX 4070 12GB") },
      { label: label("RAM", "RAM"), value: label("64GB DDR5 5600MHz", "64GB DDR5 5600MHz") },
      { label: label("Ổ cứng", "ストレージ"), value: label("2TB SSD NVMe Gen4", "2TB SSD NVMe Gen4") },
      { label: label("Nguồn (PSU)", "電源"), value: label("850W 80+ Gold", "850W 80+ Gold") },
      { label: label("Tản nhiệt", "冷却"), value: label("Tản nước AIO 360mm", "360mm AIO 水冷") },
      { label: label("Case", "ケース"), value: label("Full Tower luồng khí cao", "高エアフロー フルタワー") },
      { label: label("Bảo hành", "保証"), value: label("6 tháng", "6ヶ月") },
    ],
  },
  {
    slug: "d-mini-compact",
    name: "D-Mini Compact",
    image: "/images/pc1.png",
    tag: label("Nhỏ gọn", "コンパクト"),
    specs: label(
      "Ryzen 5 5600G / iGPU / 16GB / 500GB SSD",
      "Ryzen 5 5600G / 内蔵グラフィックス 16GB / 500GB SSD",
    ),
    description: label(
      "Thân máy nhỏ gọn, tiết kiệm điện, lý tưởng cho văn phòng, học tập và giải trí cơ bản hàng ngày.",
      "コンパクトで省電力。オフィスや学習、日常的な用途に最適な一台です。",
    ),
    price: { vi: 8_900_000, ja: 89_800 },
    specTable: [
      { label: label("CPU", "CPU"), value: label("AMD Ryzen 5 5600G", "AMD Ryzen 5 5600G") },
      { label: label("GPU", "GPU"), value: label("Đồ họa tích hợp Radeon", "Radeon 内蔵グラフィックス") },
      { label: label("RAM", "RAM"), value: label("16GB DDR4 3200MHz", "16GB DDR4 3200MHz") },
      { label: label("Ổ cứng", "ストレージ"), value: label("500GB SSD NVMe", "500GB SSD NVMe") },
      { label: label("Nguồn (PSU)", "電源"), value: label("450W 80+ Bronze", "450W 80+ Bronze") },
      { label: label("Tản nhiệt", "冷却"), value: label("Tản khí stock", "リテールクーラー") },
      { label: label("Case", "ケース"), value: label("Mini ITX nhỏ gọn", "Mini ITX コンパクト") },
      { label: label("Bảo hành", "保証"), value: label("6 tháng", "6ヶ月") },
    ],
  },
];
