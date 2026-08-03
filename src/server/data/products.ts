import "server-only";

import type { ProductAttributes } from "@/features/products/types";
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
  /** Typed facets the listing filters and sorts on. */
  attributes: ProductAttributes;
  specTable: Array<{ label: Localized<string>; value: Localized<string> }>;
};

/** Every product carries the same standing storefront discount. */
export const DISCOUNT_PERCENT = 10;

const label = (vi: string, ja: string): Localized<string> => ({ vi, ja });

/** Part numbers read the same in both storefronts. */
const same = (value: string): Localized<string> => ({ vi: value, ja: value });

/* ---------------------------------------------------------------------------
 * Shared spec vocabulary.
 * Row labels and the handful of translated values repeat across every product,
 * so they are named once. Authoring them inline meant the same eight
 * translations were re-typed per record — the drift that produced "6 tháng" in
 * one row and "6 tháng bảo hành" in the next.
 * ------------------------------------------------------------------------ */

const ROW = {
  cpu: label("CPU", "CPU"),
  gpu: label("GPU", "GPU"),
  ram: label("RAM", "RAM"),
  storage: label("Ổ cứng", "ストレージ"),
  psu: label("Nguồn (PSU)", "電源"),
  cooling: label("Tản nhiệt", "冷却"),
  chassis: label("Case", "ケース"),
  warranty: label("Bảo hành", "保証"),
};

const COOLING = {
  aio360: label("Tản nước AIO 360mm", "360mm AIO 水冷"),
  aio280: label("Tản nước AIO 280mm", "280mm AIO 水冷"),
  aio240: label("Tản nước AIO 240mm", "240mm AIO 水冷"),
  tower: label("Tản khí Tower", "タワー型空冷"),
  stock: label("Tản khí stock", "リテールクーラー"),
};

const CHASSIS = {
  full: label("Full Tower luồng khí cao", "高エアフロー フルタワー"),
  mid: label("Mid Tower kính cường lực", "強化ガラス ミドルタワー"),
  mini: label("Mini ITX nhỏ gọn", "Mini ITX コンパクト"),
  slim: label("Slim Desktop tiết kiệm không gian", "省スペース スリムデスクトップ"),
};

const WARRANTY = label("6 tháng", "6ヶ月");

type SpecInput = {
  cpu: string;
  gpu: Localized<string>;
  ram: string;
  storage: string;
  psu: string;
  cooling: Localized<string>;
  chassis: Localized<string>;
};

function specTable(input: SpecInput): ProductRecord["specTable"] {
  return [
    { label: ROW.cpu, value: same(input.cpu) },
    { label: ROW.gpu, value: input.gpu },
    { label: ROW.ram, value: same(input.ram) },
    { label: ROW.storage, value: same(input.storage) },
    { label: ROW.psu, value: same(input.psu) },
    { label: ROW.cooling, value: input.cooling },
    { label: ROW.chassis, value: input.chassis },
    { label: ROW.warranty, value: WARRANTY },
  ];
}

const IGPU_RADEON = label("Đồ họa tích hợp Radeon", "Radeon 内蔵グラフィックス");
const IGPU_INTEL = label("Đồ họa tích hợp Intel UHD", "Intel UHD 内蔵グラフィックス");

/* ------------------------------------------------------------------------- */

/**
 * Order is meaningful: it is the "featured" sort the listing falls back to when
 * the visitor has not asked for anything else.
 */
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
    attributes: { category: "gaming", cpuBrand: "amd", gpu: "rtx40", ram: "32", storageGb: 1000 },
    specTable: specTable({
      cpu: "AMD Ryzen 7 7800X3D",
      gpu: same("RTX 4070 Ti SUPER 16GB"),
      ram: "32GB DDR5 6000MHz",
      storage: "1TB SSD NVMe Gen4",
      psu: "850W 80+ Gold",
      cooling: COOLING.aio280,
      chassis: CHASSIS.mid,
    }),
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
    attributes: { category: "gaming", cpuBrand: "amd", gpu: "rtx40", ram: "16", storageGb: 1000 },
    specTable: specTable({
      cpu: "AMD Ryzen 5 7600",
      gpu: same("RTX 4060 Ti 16GB"),
      ram: "16GB DDR5 5600MHz",
      storage: "1TB SSD NVMe Gen4",
      psu: "650W 80+ Bronze",
      cooling: COOLING.tower,
      chassis: CHASSIS.mid,
    }),
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
    attributes: { category: "creator", cpuBrand: "intel", gpu: "rtx40", ram: "64", storageGb: 2000 },
    specTable: specTable({
      cpu: "Intel Core i9-14900K",
      gpu: same("RTX 4070 12GB"),
      ram: "64GB DDR5 5600MHz",
      storage: "2TB SSD NVMe Gen4",
      psu: "850W 80+ Gold",
      cooling: COOLING.aio360,
      chassis: CHASSIS.full,
    }),
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
    attributes: {
      category: "office",
      cpuBrand: "amd",
      gpu: "integrated",
      ram: "16",
      storageGb: 500,
    },
    specTable: specTable({
      cpu: "AMD Ryzen 5 5600G",
      gpu: IGPU_RADEON,
      ram: "16GB DDR4 3200MHz",
      storage: "500GB SSD NVMe",
      psu: "450W 80+ Bronze",
      cooling: COOLING.stock,
      chassis: CHASSIS.mini,
    }),
  },
  {
    slug: "d-game-elite",
    name: "D-Game Elite",
    image: "/images/card1.png",
    tag: label("Hiệu năng cao", "ハイエンド"),
    specs: label(
      "Core i7-14700K / RTX 4080 SUPER / 32GB / 2TB SSD",
      "Core i7-14700K / RTX 4080 SUPER 32GB / 2TB SSD",
    ),
    description: label(
      "Chiến mọi tựa game ở 4K với thiết lập đồ họa tối đa, tản nhiệt nước 360mm giữ máy mát và êm trong nhiều giờ liên tục.",
      "4K・最高設定でも余裕のパフォーマンス。360mm水冷により長時間の連続プレイでも静かで安定した動作を保ちます。",
    ),
    price: { vi: 38_900_000, ja: 389_800 },
    attributes: { category: "gaming", cpuBrand: "intel", gpu: "rtx40", ram: "32", storageGb: 2000 },
    specTable: specTable({
      cpu: "Intel Core i7-14700K",
      gpu: same("RTX 4080 SUPER 16GB"),
      ram: "32GB DDR5 6400MHz",
      storage: "2TB SSD NVMe Gen4",
      psu: "1000W 80+ Gold",
      cooling: COOLING.aio360,
      chassis: CHASSIS.full,
    }),
  },
  {
    slug: "d-game-entry",
    name: "D-Game Entry",
    image: "/images/pc1.png",
    tag: label("Cho người mới", "はじめての一台"),
    specs: label(
      "Core i5-12400F / RTX 3060 / 16GB / 500GB SSD",
      "Core i5-12400F / RTX 3060 16GB / 500GB SSD",
    ),
    description: label(
      "Bộ máy nhập môn dễ tiếp cận, chơi tốt các tựa game phổ biến ở Full HD với mức đầu tư hợp lý.",
      "人気タイトルをフルHDで快適に遊べる入門モデル。はじめてのゲーミングPCに手を出しやすい価格です。",
    ),
    price: { vi: 11_900_000, ja: 119_800 },
    attributes: { category: "gaming", cpuBrand: "intel", gpu: "rtx30", ram: "16", storageGb: 500 },
    specTable: specTable({
      cpu: "Intel Core i5-12400F",
      gpu: same("RTX 3060 12GB"),
      ram: "16GB DDR4 3200MHz",
      storage: "500GB SSD NVMe",
      psu: "600W 80+ Bronze",
      cooling: COOLING.tower,
      chassis: CHASSIS.mid,
    }),
  },
  {
    slug: "d-stream-plus",
    name: "D-Stream Plus",
    image: "/images/ram1.png",
    tag: label("Cho Streamer", "配信向け"),
    specs: label(
      "Ryzen 9 7900X / RTX 4070 / 32GB / 1TB SSD",
      "Ryzen 9 7900X / RTX 4070 32GB / 1TB SSD",
    ),
    description: label(
      "12 nhân xử lý song song game và encode, giúp buổi livestream giữ khung hình ổn định mà không phải hạ thiết lập.",
      "12コアがゲームとエンコードを同時にこなし、設定を落とさずに安定した配信を実現します。",
    ),
    price: { vi: 21_900_000, ja: 219_800 },
    attributes: { category: "gaming", cpuBrand: "amd", gpu: "rtx40", ram: "32", storageGb: 1000 },
    specTable: specTable({
      cpu: "AMD Ryzen 9 7900X",
      gpu: same("RTX 4070 12GB"),
      ram: "32GB DDR5 6000MHz",
      storage: "1TB SSD NVMe Gen4",
      psu: "850W 80+ Gold",
      cooling: COOLING.aio240,
      chassis: CHASSIS.mid,
    }),
  },
  {
    slug: "d-creator-air",
    name: "D-Creator Air",
    image: "/images/card1.png",
    tag: label("Dựng phim", "動画編集"),
    specs: label(
      "Ryzen 7 7700 / Radeon RX 7800 XT / 32GB / 1TB SSD",
      "Ryzen 7 7700 / Radeon RX 7800 XT 32GB / 1TB SSD",
    ),
    description: label(
      "16GB VRAM cho timeline 4K nhiều lớp, phù hợp với dựng phim và thiết kế đồ họa hằng ngày.",
      "16GB VRAM により4Kマルチレイヤー編集も軽快。日常的な映像制作やデザイン作業に向いた構成です。",
    ),
    price: { vi: 18_900_000, ja: 189_800 },
    attributes: { category: "creator", cpuBrand: "amd", gpu: "radeon", ram: "32", storageGb: 1000 },
    specTable: specTable({
      cpu: "AMD Ryzen 7 7700",
      gpu: same("Radeon RX 7800 XT 16GB"),
      ram: "32GB DDR5 5600MHz",
      storage: "1TB SSD NVMe Gen4",
      psu: "750W 80+ Gold",
      cooling: COOLING.tower,
      chassis: CHASSIS.mid,
    }),
  },
  {
    slug: "d-creator-max",
    name: "D-Creator Max",
    image: "/images/pc1.png",
    tag: label("Cao cấp nhất", "最上位"),
    specs: label(
      "Core i9-14900KS / RTX 4090 / 64GB / 2TB SSD",
      "Core i9-14900KS / RTX 4090 64GB / 2TB SSD",
    ),
    description: label(
      "Cấu hình không thoả hiệp cho render 3D, mô phỏng và khối lượng công việc AI tại chỗ.",
      "3Dレンダリング、シミュレーション、ローカルAI処理まで妥協のない最上位構成です。",
    ),
    price: { vi: 54_900_000, ja: 549_800 },
    attributes: { category: "creator", cpuBrand: "intel", gpu: "rtx40", ram: "64", storageGb: 2000 },
    specTable: specTable({
      cpu: "Intel Core i9-14900KS",
      gpu: same("RTX 4090 24GB"),
      ram: "64GB DDR5 6400MHz",
      storage: "2TB SSD NVMe Gen4",
      psu: "1200W 80+ Platinum",
      cooling: COOLING.aio360,
      chassis: CHASSIS.full,
    }),
  },
  {
    slug: "d-studio-rx",
    name: "D-Studio RX",
    image: "/images/ram1.png",
    tag: label("Thiết kế 3D", "3D制作"),
    specs: label(
      "Ryzen 9 7950X / Radeon RX 7900 GRE / 32GB / 2TB SSD",
      "Ryzen 9 7950X / Radeon RX 7900 GRE 32GB / 2TB SSD",
    ),
    description: label(
      "16 nhân cho render CPU và card đồ họa 16GB cho dựng hình thời gian thực, cân bằng cho studio nhỏ.",
      "16コアのCPUレンダリングと16GBグラフィックスのリアルタイムプレビュー。小規模スタジオに最適なバランスです。",
    ),
    price: { vi: 26_900_000, ja: 269_800 },
    attributes: { category: "creator", cpuBrand: "amd", gpu: "radeon", ram: "32", storageGb: 2000 },
    specTable: specTable({
      cpu: "AMD Ryzen 9 7950X",
      gpu: same("Radeon RX 7900 GRE 16GB"),
      ram: "32GB DDR5 6000MHz",
      storage: "2TB SSD NVMe Gen4",
      psu: "850W 80+ Gold",
      cooling: COOLING.aio280,
      chassis: CHASSIS.full,
    }),
  },
  {
    slug: "d-office-slim",
    name: "D-Office Slim",
    image: "/images/card1.png",
    tag: label("Văn phòng", "ビジネス"),
    specs: label(
      "Core i3-13100 / iGPU / 8GB / 500GB SSD",
      "Core i3-13100 / 内蔵グラフィックス 8GB / 500GB SSD",
    ),
    description: label(
      "Máy bàn mỏng, chạy êm, đủ nhanh cho tài liệu, bảng tính và họp trực tuyến cả ngày.",
      "薄型・静音のデスクトップ。書類作成や表計算、オンライン会議を一日中こなせる性能です。",
    ),
    price: { vi: 6_900_000, ja: 69_800 },
    attributes: {
      category: "office",
      cpuBrand: "intel",
      gpu: "integrated",
      ram: "8",
      storageGb: 500,
    },
    specTable: specTable({
      cpu: "Intel Core i3-13100",
      gpu: IGPU_INTEL,
      ram: "8GB DDR4 3200MHz",
      storage: "500GB SSD NVMe",
      psu: "300W 80+ Bronze",
      cooling: COOLING.stock,
      chassis: CHASSIS.slim,
    }),
  },
  {
    slug: "d-office-pro",
    name: "D-Office Pro",
    image: "/images/pc1.png",
    tag: label("Cho doanh nghiệp", "法人向け"),
    specs: label(
      "Core i5-14400 / iGPU / 16GB / 1TB SSD",
      "Core i5-14400 / 内蔵グラフィックス 16GB / 1TB SSD",
    ),
    description: label(
      "Cấu hình tiêu chuẩn cho doanh nghiệp: nhiều cổng kết nối, dễ bảo trì và triển khai hàng loạt.",
      "拡張ポートが豊富で保守しやすい、法人の標準導入に適したスタンダード構成です。",
    ),
    price: { vi: 9_900_000, ja: 99_800 },
    attributes: {
      category: "office",
      cpuBrand: "intel",
      gpu: "integrated",
      ram: "16",
      storageGb: 1000,
    },
    specTable: specTable({
      cpu: "Intel Core i5-14400",
      gpu: IGPU_INTEL,
      ram: "16GB DDR4 3200MHz",
      storage: "1TB SSD NVMe",
      psu: "450W 80+ Bronze",
      cooling: COOLING.stock,
      chassis: CHASSIS.slim,
    }),
  },
];
