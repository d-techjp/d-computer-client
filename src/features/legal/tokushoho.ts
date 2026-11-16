/**
 * 特定商取引法に基づく表記 (Act on Specified Commercial Transactions disclosure).
 *
 * Kept in Japanese for every locale on purpose: it is a Japanese legal notice,
 * PayPay and card networks review the Japanese wording, and a translation would
 * be a second text that could drift from the binding one.
 *
 * Plain data rather than a CMS article so it cannot be unpublished or edited
 * away by accident — payment providers re-check this URL.
 *
 * Keep it in sync with the backend: shipping is free because
 * `checkout.service.ts` charges `SHIPPING_FEE = 0`, and there is no COD fee in
 * the order total. If either changes, update the rows below too.
 */
export type TokushohoRow = { label: string; value: string[] };

export const TOKUSHOHO_UPDATED_AT = "2026-11-16";

export const TOKUSHOHO_ROWS: TokushohoRow[] = [
  { label: "販売業者", value: ["ディーテック株式会社"] },
  { label: "運営統括責任者", value: ["NGUYEN VIET DUNG"] },
  { label: "所在地", value: ["〒557-0043 大阪府大阪市西成区玉出東1-3-16 ドエル1番館103号"] },
  {
    label: "電話番号",
    // TODO(before deploy): confirm business hours.
    value: ["080-6473-2260", "受付時間：10:00〜19:00（年末年始を除く）"],
  },
  { label: "メールアドレス", value: ["support@d-techjp.com"] },
  { label: "ホームページURL", value: ["https://d-techjp.com"] },
  // TODO: if the shop sells used goods (中古品), add
  // { label: "古物商許可", value: ["大阪府公安委員会 許可 第XXXXXXXXXXXX号"] },
  {
    label: "販売価格",
    value: ["各商品ページに記載の価格（消費税10%込み）"],
  },
  {
    label: "商品代金以外の必要料金",
    value: [
      "送料：無料（日本国内）",
      "代金引換手数料：無料",
      "銀行振込の場合の振込手数料：お客様のご負担となります",
    ],
  },
  {
    label: "お支払い方法",
    value: [
      "クレジットカード（Visa / Mastercard / JCB / American Express / Diners Club）",
      "PayPay",
      "代金引換",
      "銀行振込",
    ],
  },
  {
    label: "お支払い時期",
    value: [
      "クレジットカード・PayPay：ご注文時にお支払いが確定します",
      "代金引換：商品お受け取り時にお支払いください",
      "銀行振込：ご注文後、当店からのご案内に従い7日以内にお振込みください（前払い）",
    ],
  },
  {
    label: "商品の引渡し時期",
    // TODO(before deploy): confirm lead times, especially for custom builds.
    value: [
      "在庫品：ご注文確定（銀行振込の場合はご入金確認）後、1〜3営業日以内に発送いたします",
      "カスタムPC：組立・動作確認後の発送となり、目安は5〜10営業日です",
      "お届け日数は地域により異なります",
    ],
  },
  {
    label: "キャンセル",
    value: [
      "商品発送前であれば、お電話またはメールにてキャンセルを承ります",
      "カスタムPCは組立開始後のキャンセルをお受けできない場合があります",
    ],
  },
  {
    label: "返品・交換",
    value: [
      "お客様のご都合による返品・交換は、商品の性質上お受けしておりません",
      "初期不良・誤配送の場合は、商品到着後7日以内にご連絡ください。当店負担にて交換または返金いたします",
      "保証期間・保証内容は保証規定をご確認ください",
    ],
  },
];
