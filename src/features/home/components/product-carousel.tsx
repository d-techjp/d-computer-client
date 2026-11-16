import type { PublicCarousel } from "@/features/home/api/carousel.schema";

import { ProductCarouselTrack } from "./product-carousel-track";

/**
 * A single carousel section from the public homepage list endpoint.
 */
export function ProductCarousel({
  carousel,
}: {
  carousel: PublicCarousel;
}) {
  if (carousel.products.length === 0) return null;

  return (
    <ProductCarouselTrack
      products={carousel.products}
     
      title={carousel.name}
    />
  );
}
