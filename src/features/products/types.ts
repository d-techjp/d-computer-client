export type ProductStatus = "draft" | "active" | "out_of_stock" | "archived";

export type CategoryRef = { id: string; name: string; slug: string };
export type BrandRef = { id: string; name: string; slug: string };

/**
 * The shape a component consumes, mirroring the real backend's product
 * entity: one price (not a per-locale price book — the storefront prices in
 * VND only), an optional `compareAtPrice` for a strike-through instead of a
 * standing discount percentage, and a free-form `specifications` object
 * instead of typed facet attributes.
 */
export type Product = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  shortDescription: string | null;
  description: string | null;
  thumbnail: string | null;
  images: string[];
  price: number;
  compareAtPrice: number | null;
  stock: number;
  status: ProductStatus;
  isFeatured: boolean;
  viewCount: number;
  specifications: Record<string, string> | null;
  category: CategoryRef | null;
  brand: BrandRef | null;
};

export type SpecRow = { label: string; value: string };

const FALLBACK_IMAGE = "/images/pc1.png";

export function productImage(product: Pick<Product, "thumbnail">): string {
  return product.thumbnail ?? FALLBACK_IMAGE;
}

export function isInStock(product: Pick<Product, "stock" | "status">): boolean {
  return product.status === "active" && product.stock > 0;
}

/** `0` when there is nothing to strike through, or the compare price is not actually higher. */
export function discountPercent(product: Pick<Product, "price" | "compareAtPrice">): number {
  const { price, compareAtPrice } = product;
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round((1 - price / compareAtPrice) * 100);
}

export function specRows(product: Pick<Product, "specifications">): SpecRow[] {
  if (!product.specifications) return [];
  return Object.entries(product.specifications).map(([label, value]) => ({ label, value }));
}
