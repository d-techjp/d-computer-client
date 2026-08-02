# D COMPUTER

Storefront Next.js được convert từ `d-computer.html` (một bundled artifact 28MB dùng React 18 UMD + custom template runtime `x-dc`).

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Zustand 5 · Axios · Zod

```bash
npm install
npm run dev      # http://localhost:3000 -> redirect sang /ja hoặc /vi
npm run build
npm run lint
```

---

## 1. Cấu trúc thư mục — Feature-based, không phải type-based

```
src/
├── app/                        # Chỉ routing + composition, không chứa business logic
│   ├── [locale]/
│   │   ├── layout.tsx          # ROOT layout (chứa <html lang>)
│   │   ├── page.tsx            # Trang chủ (Server Component)
│   │   ├── error.tsx           # Error boundary theo segment
│   │   ├── not-found.tsx
│   │   └── products/[slug]/page.tsx
│   └── api/products/route.ts   # Route Handler (BFF)
│
├── features/                   # Mỗi feature tự chứa: components + store + api + hooks
│   ├── cart/       ├── products/    ├── search/
│   ├── home/       └── layout/
│
├── server/                     # Chỉ chạy trên server (đánh dấu bằng "server-only")
│   ├── data/                   # Nguồn dữ liệu thô (thay cho DB/CMS)
│   └── services/               # Business logic: dịch, tính giá, discount
│
├── components/ui/              # Primitive dùng chung (Button, QuantityStepper, icons)
├── lib/                        # Hạ tầng: axios client, format tiền, cn()
├── i18n/                       # Locale config + dictionaries + provider
├── hooks/                      # Hook dùng chung (useReveal, useDebouncedValue…)
└── proxy.ts                    # Locale negotiation ở edge (Next 16 gọi là proxy, trước là middleware)
```

**Tại sao:** chia theo *feature* thay vì theo *loại file* (`components/`, `hooks/`, `stores/`). Khi sửa giỏ hàng, mọi thứ liên quan nằm trong `features/cart/`. Khi xoá một feature, xoá một thư mục. Đây là cách scale tốt nhất khi codebase lớn dần.

---

## 2. Các design pattern đã áp dụng

### 2.1. Server Components mặc định — "client boundary as a leaf"

Toàn bộ cây mặc định là Server Component. Chỉ những chỗ **thật sự** cần tương tác mới có `"use client"`:

| Client Component | Lý do |
|---|---|
| `ProductSearch` | input + fetch |
| `CartMenu` | Zustand + localStorage |
| `LanguageSwitcher` | dropdown + router |
| `AddToCart`, `SpecTable` | state cục bộ |
| `RevealSection`, `Hero`, `SiteFooter` | animation / IntersectionObserver |

`SiteHeader` là **Server Component** dù bên trong nó có 2 client island — logo, nav, tagline không tốn 1 byte JS nào.

`RevealSection` là ví dụ đáng chú ý: nó là client component nhưng nhận `children` từ server. Section bên trong (`TrustBar`, `FeaturedProducts`…) vẫn được render trên server và stream xuống như một cây đã hoàn chỉnh.

### 2.2. Service Layer vs Repository Layer — hai đường đi cho hai môi trường

Đây là pattern quan trọng nhất và hay bị làm sai:

```
Server Component ──────────────► productService (đọc data trực tiếp)
                                       ▲
Route Handler /api/products ───────────┘
       ▲
       │ axios
Client Component ──────────► productRepository
```

- `server/services/product.service.ts` — **nguồn chân lý duy nhất**: dịch locale, chọn currency, áp discount. Cả Server Component *và* Route Handler đều gọi nó, nên quy tắc giá không bao giờ lệch nhau giữa API và trang SSR.
- Server Component **không** fetch `/api/products` của chính nó. Server tự gọi HTTP endpoint của mình là một round trip vô nghĩa qua network stack.
- `features/products/api/product.repository.ts` — dành cho browser. Component gọi `searchProducts()`, không gọi URL. Đổi sang GraphQL sau này chỉ sửa 1 file.

Đổi in-memory array sang Prisma/upstream API = chỉ sửa `product.service.ts`.

### 2.3. Axios: một instance duy nhất + normalize lỗi

`lib/api/client.ts` là **chỗ duy nhất** import `axios`. Mọi cross-cutting concern (baseURL, timeout, auth header, tracing) nằm ở đây.

Interceptor chuyển mọi lỗi thành một class `ApiError` duy nhất:

```ts
instance.interceptors.response.use(
  (r) => r,
  (error) => Promise.reject(toApiError(error)),
);
```

Nhờ vậy component chỉ cần `catch (e) { if (e instanceof ApiError) ... }`, không phải mò `err.response?.data?.message`.

### 2.4. Zod ở biên network

TypeScript biến mất lúc runtime. Backend đổi tên field hay trả `null` sẽ nổ sâu bên trong component. `product.repository.ts` parse response qua Zod schema → lỗi rõ ràng ngay tại call site.

Thêm một assertion để schema và domain type không trôi khỏi nhau:

```ts
const _assertShape: ProductDto extends Product ? true : never = true;
```

### 2.5. Zustand: tách store theo vòng đời, không theo màn hình

| Store | Persist? | Nội dung |
|---|---|---|
| `cart.store.ts` | ✅ localStorage | Domain data |
| `ui.store.ts` | ❌ | Panel nào đang mở |

Hai thứ này có vòng đời khác nhau nên **không** gộp: giỏ hàng persist không nên mang theo rác UI, và mở dropdown không nên ghi vào localStorage.

`ui.store` dùng **một** giá trị `openPanel: 'cart' | 'language' | 'search' | null` thay vì mỗi panel một boolean — "chỉ 1 overlay mở tại một thời điểm" trở thành bất biến, không thể làm sai.

**Selector hooks** — quan trọng cho performance:

```ts
export const useCartCount = () =>
  useCartStore((s) => s.lines.reduce((t, l) => t + l.quantity, 0));
```

Subscribe cả store sẽ re-render mọi consumer khi bất kỳ thứ gì đổi. Mỗi hook chỉ subscribe đúng phần nó cần; `useShallow` cho array/object.

### 2.6. Hydration của persisted store — cạm bẫy kinh điển

Server không có `localStorage` nên luôn render state khởi tạo. Nếu client rehydrate **trước** hydration pass, markup lệch và React vứt cả cây đi.

Giải pháp: `skipHydration: true` + rehydrate trong effect, và cờ hydrated lấy từ `useSyncExternalStore` với server snapshot rõ ràng là `false`:

```ts
useSyncExternalStore(subscribe, () => persist.hasHydrated(), () => false)
```

Badge số lượng render rỗng ở lần paint đầu (`suppressHydrationWarning`) rồi mới hiện số thật.

### 2.7. i18n bằng route segment, không bằng state

Bản HTML gốc đổi ngôn ngữ bằng `state.lang` → URL không đổi → không bookmark được, không share được, Google không index được bản tiếng Việt.

Giờ: `/ja/...` và `/vi/...` là hai trang thật, prerender sẵn, có `alternates.languages` cho SEO. `proxy.ts` đọc `Accept-Language` để điều hướng `/`.

Dictionary load bằng dynamic `import()` → chỉ locale đang dùng vào bundle. `get-dictionary.ts` đánh dấu `server-only` nên import nhầm từ client là lỗi build.

`vi.ts` được type theo `typeof ja` → thêm key ở `ja` mà quên `vi` là **compile error**, không phải string rỗng lúc production.

### 2.8. Design tokens trong `@theme` (Tailwind v4)

Bản gốc rải ~200 inline style với literal `oklch(...)`. Giờ đặt tên một lần trong `globals.css`:

```css
@theme {
  --color-accent: oklch(55% 0.18 25);
  --color-ink-strong: oklch(15% 0.01 260);
}
```

Tailwind tự sinh `bg-accent`, `text-ink-strong`, `border-line`… Đổi màu thương hiệu = sửa 1 dòng.

### 2.9. CVA cho component variants

`components/ui/button.tsx` khai báo variant bằng data thay vì chuỗi ternary trong JSX. TypeScript bắt lỗi `variant="primry"` lúc compile. `cn()` (clsx + tailwind-merge) đảm bảo `className` của caller thắng khi conflict.

### 2.10. Data fetching: `Promise.all`, không waterfall

```ts
const [t, products, posts] = await Promise.all([...]);
```

Ba lời gọi độc lập chạy song song thay vì nối đuôi nhau.

### 2.11. Derived state thay vì stored state

`useProductSearch` **không** lưu `status`. Nó chỉ lưu "query nào đã settle", còn loading/error/ready được **suy ra**:

```ts
const status = !enabled ? "idle"
  : failedQuery === query ? "error"
  : settledQuery === query ? "ready"
  : "loading";
```

Lưu thêm `status` nghĩa là hai nguồn chân lý phải đồng bộ — đúng loại bug tạo ra spinner quay mãi. Cách này cũng loại bỏ `setState` đồng bộ trong effect (React Compiler lint bắt lỗi này).

### 2.12. Race condition trong search

Mỗi keystroke abort request cũ qua `AbortSignal`:

```ts
const controller = new AbortController();
searchProducts({ ..., signal: controller.signal })
return () => controller.abort();
```

Không có nó, response chậm của query cũ có thể về sau và ghi đè kết quả mới. Request bị abort **không** được coi là lỗi.

### 2.13. Error & Loading boundaries

`app/[locale]/error.tsx` bắt mọi throw trong segment, có `reset()` để retry không cần reload. `error.digest` để đối chiếu với stack trace đầy đủ ở server log.

---

## 3. Những thay đổi so với bản HTML gốc

| Vấn đề ở bản gốc | Đã sửa |
|---|---|
| Trang chi tiết là `view: 'detail'` trong state — 1 URL cho cả site | Route thật `/[locale]/products/[slug]`, prerender 8 trang |
| Card sản phẩm là `div` + onClick | `<Link>` — có href, middle-click, keyboard focus, crawler đọc được |
| `scroll` listener gọi `getBoundingClientRect()` mỗi lần scroll | `IntersectionObserver`, disconnect sau lần đầu |
| 4 `setTimeout` lồng nhau, leak khi unmount | Phase machine, mọi timer được clear |
| ~200KB `@font-face` inline + preconnect Google Fonts | `next/font/google`, self-host, không layout shift |
| Dropdown chỉ đóng khi bấm lại trigger | `useDismissable` — click ngoài + phím Escape |
| `toLocaleString()` không truyền locale | `Intl.NumberFormat` cố định → không lệch server/client |
| Icon dùng ký tự `☎`, `⚙`, `☺` | SVG thật — `☎` bị render thành emoji đỏ trên nhiều platform |
| Thiếu space: "thay đổi**thế** giới" (bản vi) | Đã sửa trong dictionary |
| Không có `<html lang>`, không metadata, không OG tags | Đầy đủ metadata + canonical + `alternates.languages` |

---

## 4. Gợi ý bước tiếp theo

Những thứ **chưa** làm vì ngoài scope, nhưng nên cân nhắc khi đi production:

1. **TanStack Query** — nếu client-side fetching nhiều hơn (hiện chỉ có search). Nó dùng axios làm fetcher, không thay thế axios. Được cache, retry, dedupe miễn phí.
2. **Server Actions** cho mutation (checkout, đăng nhập) thay vì Route Handler + axios — progressive enhancement, chạy được cả khi JS chưa load.
3. **Optimistic update** với `useOptimistic` cho thao tác giỏ hàng.
4. **`next/image` remote loader** khi ảnh chuyển sang CDN. Ảnh hiện tại (PNG 1.5–4.7MB) nên được convert sang WebP/AVIF và resize — đây là điểm nghẽn performance lớn nhất còn lại.
5. **Testing**: Vitest cho `product.service` + `cart.store` (pure logic, dễ test nhất), Playwright cho luồng add-to-cart.
6. **`@next/bundle-analyzer`** để canh chừng client bundle.

---

## 5. Ghi chú về dữ liệu

- Ảnh trong `public/images/` được giải nén từ manifest base64 của file HTML gốc.
- Bản gốc **không có ảnh riêng cho product card** (`<image-slot>` không có `src`). Ở đây 4 sản phẩm tái sử dụng 3 ảnh hero (`pc1`, `card1`, `ram1`) để layout không bị trống — thay bằng ảnh thật khi có.
- Giỏ hàng khởi tạo sẵn 2 món (giống bản gốc) để demo. Đổi `INITIAL_LINES` trong `cart.store.ts` thành `[]` khi lên production.
