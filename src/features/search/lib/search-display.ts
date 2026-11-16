import type { Product } from "@/features/products/types";

export type HighlightPart = { text: string; match: boolean };

/** One char at a time so every normalized index maps back to an original one. */
function normalizeChar(char: string): string {
  return char.normalize("NFKC").toLowerCase();
}

/**
 * Query → lowercase NFKC words. NFKC folds full-width input from a Japanese
 * IME (`ＲＴＸ`) into the half-width text product names are written in.
 */
export function searchTokens(query: string): string[] {
  return query.normalize("NFKC").toLowerCase().split(/\s+/).filter(Boolean);
}

/**
 * Splits `text` into matched / unmatched runs for every token, ignoring case
 * and full-/half-width differences, so the UI can bold what the shopper typed.
 */
export function highlightParts(text: string, tokens: string[]): HighlightPart[] {
  if (tokens.length === 0) return [{ text, match: false }];

  let normalized = "";
  const origin: number[] = [];
  Array.from(text).forEach((char, index) => {
    for (const piece of normalizeChar(char)) {
      normalized += piece;
      origin.push(index);
    }
  });

  const chars = Array.from(text);
  const marked = new Array<boolean>(chars.length).fill(false);
  for (const token of tokens) {
    let from = normalized.indexOf(token);
    while (from !== -1) {
      for (let i = from; i < from + token.length; i += 1) marked[origin[i]] = true;
      from = normalized.indexOf(token, from + token.length);
    }
  }

  const parts: HighlightPart[] = [];
  chars.forEach((char, index) => {
    const last = parts.at(-1);
    if (last && last.match === marked[index]) last.text += char;
    else parts.push({ text: char, match: marked[index] });
  });
  return parts;
}

/** Drops trailing detail like `（最大5.2GHz / 14コア…）` — too long for one line. */
function shortValue(value: string): string {
  return value.replace(/\s*[（(].*$/, "").trim();
}

/**
 * "CPU · GPU" from the spec table, which is what a shopper scans a PC list
 * for. Falls back to the short description (now marketing prose) or the
 * category when a product has no such specs.
 */
export function keySpecsLine(
  product: Pick<Product, "specifications" | "shortDescription" | "category">,
): string {
  const specs = product.specifications ?? [];
  const cpu = specs.find((spec) => spec.name.trim().toUpperCase() === "CPU");
  const gpu = specs.find((spec) => /GPU|VGA|グラフィック/i.test(spec.name));
  // The board partner ("ASUS", "ZOTAC GAMING") pushes the chip — what people
  // compare — past the truncation point, so the GPU line starts at the chip.
  const gpuChip = gpu ? shortValue(gpu.value).replace(/^.*?(?=GeForce|Radeon|Arc\b)/i, "") : "";
  const line = [cpu ? shortValue(cpu.value) : "", gpuChip].filter(Boolean).join(" · ");

  return line || product.shortDescription || product.category?.name || "";
}

export function isSoldOut(product: Pick<Product, "status" | "totalStock">): boolean {
  return product.status === "out_of_stock" || product.totalStock <= 0;
}
