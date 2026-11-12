import type { ReactNode } from "react";

/** The centred card both auth pages sit in. Server Component; the form inside is the client island. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-[70vh] bg-surface">
      <div className="shell flex justify-center py-10 md:py-16">
        <section className="w-full max-w-[440px] rounded-2xl border border-line-soft bg-white px-6 py-8 shadow-[0_18px_50px_-30px_oklch(20%_0.02_260/0.35)] md:px-9 md:py-10">
          <header className="mb-7 text-center">
            <h1 className="mb-2 text-[24px] leading-tight font-black md:text-[28px]">{title}</h1>
            <p className="text-[13px] leading-6 text-ink-muted">{subtitle}</p>
          </header>
          {children}
        </section>
      </div>
    </div>
  );
}
