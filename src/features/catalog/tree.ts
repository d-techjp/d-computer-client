import type { Category } from "./types";

export type CategoryNode = Category & { children: CategoryNode[] };

const bySortOrder = (a: Category, b: Category) =>
  a.sortOrder - b.sortOrder || a.name.localeCompare(b.name);

/**
 * Folds the backend's flat category list into a tree.
 *
 * The list arrives flat and unordered with respect to depth — a child can come
 * before its parent — so this makes two passes rather than assuming order.
 * Depth is not capped: the mega menu renders a third level as column headings
 * when one exists, and a two-level catalogue simply produces empty
 * `children` arrays there.
 *
 * A node whose `parentId` points at something missing from the list (an
 * inactive parent, say) is dropped rather than promoted to the top level —
 * surfacing it as a root would misfile it in every menu that renders this.
 */
export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const nodes = new Map<string, CategoryNode>(
    categories.map((category) => [category.id, { ...category, children: [] }]),
  );

  const roots: CategoryNode[] = [];

  for (const node of nodes.values()) {
    if (node.parentId === null) roots.push(node);
    else nodes.get(node.parentId)?.children.push(node);
  }

  for (const node of nodes.values()) node.children.sort(bySortOrder);

  return roots.sort(bySortOrder);
}
