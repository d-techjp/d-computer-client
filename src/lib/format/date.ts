const FORMATTER = new Intl.DateTimeFormat("ja-JP", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function formatDate(iso: string): string {
  return FORMATTER.format(new Date(iso));
}
