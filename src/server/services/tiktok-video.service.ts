import "server-only";

import {
  publicTiktokVideoListSchema,
  type PublicTiktokVideo,
} from "@/features/home/api/tiktok-video.schema";
import { backendFetch } from "@/server/lib/backend-fetch";

/** Reads the admin-managed, active TikTok videos in their configured display order. */
export async function listTiktokVideos(): Promise<PublicTiktokVideo[]> {
  const data = await backendFetch<unknown>("/tiktok-videos");
  return publicTiktokVideoListSchema.parse(data);
}
