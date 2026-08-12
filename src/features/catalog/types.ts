export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  sortOrder: number;
  /** How many products sit under it — the backend counts this for us. */
  productCount: number;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};
