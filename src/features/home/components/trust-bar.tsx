import { TRUST_ICONS } from "@/config/glyphs";
import type { Dictionary } from "@/i18n/get-dictionary";

import { RevealSection } from "./reveal-section";

export function TrustBar({ t }: { t: Dictionary }) {
  return (
    <RevealSection className="border-y border-line">
      <div className="shell grid grid-cols-1 gap-5 py-7 xs:grid-cols-2 md:gap-6 md:py-9 lg:grid-cols-4">
        {t.trustItems.map((item, index) => {
          const Icon = TRUST_ICONS[index];

          return (
            <div key={item.title} className="flex items-center gap-3.5">
              <span
                className="flex size-[42px] flex-none items-center justify-center rounded-full bg-mist text-ink-body"
                aria-hidden
              >
                <Icon />
              </span>
              <span>
                <span className="block text-[14.5px] font-bold">{item.title}</span>
                <span className="block text-[12.5px] text-ink-subtle">{item.sub}</span>
              </span>
            </div>
          );
        })}
      </div>
    </RevealSection>
  );
}
