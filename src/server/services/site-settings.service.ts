import "server-only";

import { siteSettingsSchema, type SiteSettings } from "@/features/layout/api/site-settings.schema";
import { backendFetch } from "@/server/lib/backend-fetch";

/** Company name, hotline, address and social links, admin-managed, shown in the footer on every page. */
const REVALIDATE_SECONDS = 60;

export async function getSiteSettings(): Promise<SiteSettings> {
  const data = await backendFetch<unknown>(
    "/site-settings",
    undefined,
    { next: { revalidate: REVALIDATE_SECONDS } },
  );

  return siteSettingsSchema.parse(data);
}
