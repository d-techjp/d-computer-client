import Image from "next/image";

import { Button } from "@/components/ui/button";
import { STEP_GLYPHS } from "@/config/glyphs";
import type { Dictionary } from "@/i18n/get-dictionary";

import { RevealSection } from "./reveal-section";

export function CustomPcSection({ t }: { t: Dictionary }) {
  return (
    <RevealSection className="relative overflow-hidden text-white">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/custom-bg.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#FAF9F500,#F2F2F290_75%,transparent_88%)]" />
      </div>

      <div className="shell relative z-10 py-12 md:py-16">
        <div className="grid max-w-[560px] grid-cols-1 items-center gap-6 sm:grid-cols-2">
          <div>
            <h2 className="mb-4 text-[24px] leading-[1.3] font-black text-[#595656] md:text-[30px]">
              {t.customTitle1}
              <br />
              {t.customTitle2}
            </h2>
            <p className="mb-6 text-[14.5px] leading-[1.7] text-[#6A6767]">{t.customDesc}</p>
            <Button>
              {t.customCta} <span aria-hidden>→</span>
            </Button>
          </div>

          <div className="flex flex-col gap-5">
            {t.steps.map((step, index) => (
              <div key={step.title} className="flex items-start gap-3.5">
                <span
                  className="flex size-[34px] flex-none items-center justify-center rounded-full border border-[#595656] bg-[#F1F1F2] text-[13px] font-bold text-[#595656]"
                  aria-hidden
                >
                  {STEP_GLYPHS[index]}
                </span>
                <span>
                  <span className="block text-[14.5px] font-bold text-[#3a3838]">{step.title}</span>
                  <span className="block text-[12.5px] text-[#6A6767]">{step.sub}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RevealSection>
  );
}
