/**
 * The reference dictionary. Its inferred shape *is* the `Dictionary` type, so
 * every other locale is checked against it. Deliberately not `as const`:
 * literal types here would force translations to repeat the Japanese strings.
 */
const ja = {
  topbarItems: [
    "全国配送対応・最短翌日お届け",
    "安心の動作確認・丁寧な梱包",
    "カスタム相談無料",
  ],
  contact: "お問い合わせ",
  about: "会社概要",
  tagline: "パフォーマンスで、体験を変える。",
  navItems: [
    "ホーム",
    "製品一覧",
    "カスタムPC",
    "ご利用ガイド",
    "サポート",
    "ブログ",
  ],
  searchPlaceholder: "製品を検索する",
  searchEmpty: "該当する製品が見つかりません",
  searchError: "検索に失敗しました。もう一度お試しください。",
  login: "ログイン",
  heroKicker: "D COMPUTER",
  heroTitle1: "その一台が、",
  heroTitle2: "あなたの世界を",
  heroAccent: "変える",
  heroTitle3: "。",
  heroDesc: "高品質パーツと確かな技術で、最高のパフォーマンスをお届けします。",
  heroCta: "製品を見る",
  productsTitle: "おすすめPC",
  viewAll: "一覧を見る",
  customTitle1: "自分だけの一台を。",
  customTitle2: "カスタムPC",
  customDesc:
    "用途やご予算に合わせて、最適な構成をご提案。パーツの変更やこだわりの構成も自由自在。",
  customCta: "カスタムPCを相談する",
  blogTitle: "お知らせ・ブログ",
  copyright: "© 2026 D COMPUTER All Rights Reserved.",
  cartTitle: "カート",
  cartItemsUnit: "点",
  cartQty: "数量:",
  cartSubtotal: "小計",
  cartCheckout: "レジに進む",
  cartEmpty: "カートは空です",
  cartRemove: "削除",
  cartIncrease: "数量を増やす",
  cartDecrease: "数量を減らす",
  detailSpecs: "詳細スペック",
  detailAddToCart: "カートに追加",
  detailBack: "一覧に戻る",
  specShowAll: "詳細スペックをすべて見る",
  specShowLess: "閉じる",
  notFoundTitle: "ページが見つかりません",
  notFoundDesc: "お探しのページは移動または削除された可能性があります。",
  errorTitle: "問題が発生しました",
  errorDesc: "しばらくしてからもう一度お試しください。",
  errorRetry: "再試行",
  sideBadges: [
    { title: "安心の6ヶ月保証", sub: "長くご安心してお使いいただけます" },
    { title: "全国配送対応", sub: "最短翌日お届け" },
    { title: "サポート365日対応", sub: "いつでもサポートいたします" },
    { title: "各種決済対応", sub: "分割払いOK" },
  ],
  trustItems: [
    { title: "高品質パーツのみ使用", sub: "信頼できるメーカーのパーツを厳選" },
    { title: "徹底した動作検証", sub: "すべてのPCは負荷テストを実施して出荷" },
    { title: "カスタム自由自在", sub: "用途・予算に合わせた最適な構成をご提案" },
    { title: "丁寧なサポート", sub: "購入後も安心のアフターサポート" },
  ],
  steps: [
    { title: "用途を選ぶ", sub: "ゲーム / 配信 / クリエイティブ / ビジネスなど" },
    { title: "予算を決める", sub: "ご希望の予算に合わせてご提案" },
    { title: "構成をカスタマイズ", sub: "パーツ変更やオプション追加も可能" },
  ],
  footerColumns: [
    {
      title: "製品・サービス",
      links: ["製品一覧", "カスタムPC", "パーツ一覧", "セール・キャンペーン"],
    },
    {
      title: "ご利用ガイド",
      links: [
        "お支払いについて",
        "配送について",
        "返品・交換について",
        "よくあるご質問",
      ],
    },
    {
      title: "サポート",
      links: [
        "お問い合わせ",
        "保証について",
        "サポート情報",
        "ドライバダウンロード",
      ],
    },
    {
      title: "会社情報",
      links: ["会社概要", "特定商取引法に基づく表記", "プライバシーポリシー"],
    },
  ],
};

export default ja;
