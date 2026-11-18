import type { ReactNode } from "react";

export function PanelHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-black">{title}</h2>
        {description ? (
          <p className="mt-1.5 text-[13px] leading-5 text-ink-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
