export type ProductStatus = "draft" | "active" | "out_of_stock" | "archived";
export type ProductType = "standard" | "bundle" | "service";
export type BundleInventoryPolicy = "derived_from_components" | "own_stock";

export type CategoryRef = { id: string; name: string; slug: string };
export type BrandRef = { id: string; name: string; slug: string };
export type ProductOptionValue = {
  id: string;
  optionId: string;
  value: string;
  position: number;
  option?: {
    id: string;
    name: string;
    position: number;
  };
};

export type ProductOption = {
  id: string;
  name: string;
  position: number;
  values: {
    id: string;
    optionId: string;
    value: string;
    position: number;
  }[];
};

export type ProductVariant = {
  id: string;
  productId: string;
  name: string;
  sku: string;
  barcode: string | null;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  lowStockThreshold: number;
  weightGrams: number | null;
  thumbnail: string | null;
  images: string[];
  position: number;
  isDefault: boolean;
  isActive: boolean;
  trackInventory: boolean;
  bundleInventoryPolicy: BundleInventoryPolicy | null;
  soldCount: number;
  optionValues: ProductOptionValue[];
};

export type ProductBundleItem = {
  id: string;
  bundleVariantId: string;
  componentVariantId: string;
  quantity: number;
  position: number;
  isOptional: boolean;
  componentVariant?: ProductVariant & {
    product?: {
      id: string;
      name: string;
      slug: string;
      thumbnail: string | null;
    };
  };
};

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
  name: string;
  productType: ProductType;
  shortDescription: string | null;
  description: string | null;
  thumbnail: string | null;
  images: string[];
  hasVariants: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  totalStock: number;
  status: ProductStatus;
  isFeatured: boolean;
  viewCount: number;
  soldCount: number;
  specifications: Record<string, string> | null;
  category: CategoryRef | null;
  brand: BrandRef | null;
  variants: ProductVariant[];
  options: ProductOption[];
  galleryImages: string[];
};

export type SpecRow = { label: string; value: string };

const FALLBACK_IMAGE = "/images/pc1.png";

export function productImage(product: Pick<Product, "thumbnail">): string {
  return product.thumbnail ?? FALLBACK_IMAGE;
}

export function productGalleryImages(
  product: Pick<Product, "thumbnail" | "images" | "galleryImages">,
): string[] {
  return uniqueImages([product.thumbnail, ...product.images, ...product.galleryImages]);
}

export function variantImages(
  product: Pick<Product, "thumbnail" | "images" | "galleryImages">,
  variant: Pick<ProductVariant, "thumbnail" | "images"> | null | undefined,
): string[] {
  const preferred = uniqueImages([variant?.thumbnail, ...(variant?.images ?? [])]);
  return preferred.length > 0 ? preferred : productGalleryImages(product);
}

export function defaultVariant(product: Pick<Product, "variants">): ProductVariant | null {
  return product.variants.find((variant) => variant.isDefault) ?? product.variants[0] ?? null;
}

export function displayPrice(product: Pick<Product, "minPrice" | "variants">): number {
  const variant = defaultVariant(product);
  return variant?.price ?? product.minPrice ?? 0;
}

export function displayCompareAtPrice(product: Pick<Product, "variants">): number | null {
  return defaultVariant(product)?.compareAtPrice ?? null;
}

export function isVariantInStock(
  variant: Pick<ProductVariant, "isActive" | "trackInventory" | "stock"> | null | undefined,
): boolean {
  if (!variant?.isActive) return false;
  return !variant.trackInventory || variant.stock > 0;
}

export function isInStock(product: Pick<Product, "status" | "totalStock" | "variants">): boolean {
  const variant = defaultVariant(product);
  return (
    product.status === "active" &&
    (variant ? isVariantInStock(variant) : product.totalStock > 0)
  );
}

/** `0` when there is nothing to strike through, or the compare price is not actually higher. */
export function discountPercent(product: Pick<Product, "minPrice" | "variants">): number {
  const price = displayPrice(product);
  const compareAtPrice = displayCompareAtPrice(product);
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round((1 - price / compareAtPrice) * 100);
}

export function variantDiscountPercent(
  variant: Pick<ProductVariant, "price" | "compareAtPrice">,
): number {
  if (!variant.compareAtPrice || variant.compareAtPrice <= variant.price) return 0;
  return Math.round((1 - variant.price / variant.compareAtPrice) * 100);
}

export function specRows(product: Pick<Product, "specifications">): SpecRow[] {
  if (!product.specifications) return [];
  return Object.entries(product.specifications).map(([label, value]) => ({ label, value }));
}

function uniqueImages(values: (string | null | undefined)[]): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value))));
}
