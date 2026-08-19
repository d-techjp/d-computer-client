import { z } from "zod";

/** Public payload returned by `GET /tiktok-videos`. */
export const publicTiktokVideoSchema = z.object({
  id: z.string(),
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().nullable(),
  description: z.string().nullable(),
  sortOrder: z.number().int(),
  createdAt: z.string(),
});

export const publicTiktokVideoListSchema = z.array(publicTiktokVideoSchema);

export type PublicTiktokVideo = z.infer<typeof publicTiktokVideoSchema>;
