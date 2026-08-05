export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};
