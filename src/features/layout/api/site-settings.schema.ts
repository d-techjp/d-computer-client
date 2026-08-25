import { z } from "zod";

/** One footer social link: logo image + outbound link. */
export const socialLinkSchema = z.object({
  id: z.string(),
  name: z.string(),
  // Admin can enter a relative path to a static asset (e.g. `/fb.png`), so this
  // is intentionally not `.url()` — see `SocialLinkDto.logoUrl` on the backend.
  logoUrl: z.string(),
  url: z.string().url(),
});

/** One footer nav link. `url` is either a storefront-relative path (e.g. `/products`), an
 * absolute external URL, or `""` when the destination page doesn't exist yet. */
export const footerLinkSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string(),
});

/** One footer nav column, e.g. "Sản phẩm · Dịch vụ". */
export const footerColumnSchema = z.object({
  id: z.string(),
  title: z.string(),
  links: z.array(footerLinkSchema),
});

/** Public payload returned by `GET /site-settings`. */
export const siteSettingsSchema = z.object({
  companyName: z.string(),
  phone: z.string(),
  address: z.string(),
  socialLinks: z.array(socialLinkSchema),
  footerColumns: z.array(footerColumnSchema),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type FooterLink = z.infer<typeof footerLinkSchema>;
export type FooterColumn = z.infer<typeof footerColumnSchema>;
