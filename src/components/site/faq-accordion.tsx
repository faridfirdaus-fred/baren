"use client";

import { useState } from "react";

import { faqs as fallbackFaqs, type FaqItem } from "@/content/baren";
import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { IconMinus, IconPlus } from "./icon";

export type FaqAccordionProps = {
  /** E7-3: daftar dari DB. `undefined` = fallback statis; `[]` = seksi hilang. */
  items?: FaqItem[];
};

export function FaqAccordion({ items }: FaqAccordionProps) {
  const list = items ?? fallbackFaqs;
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useScrollReveal<HTMLElement>();

  if (list.length === 0) return null;

  return (
    <section
      ref={ref}
      id="faq"
      className="scroll-reveal bg-ink py-12 text-sand lg:py-16"
    >
      <div className="container-baren">
        <p className="eyebrow text-ember">FAQ</p>
        <h2 className="display-xl mt-4 text-sand">PERTANYAAN UMUM</h2>
        <dl className="mt-10 divide-y divide-sand/15 border-y border-sand/15">
          {list.map((f, i) => {
            const open = openIndex === i;
            return (
              <div key={f.question}>
                <dt>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(open ? null : i)}
                    aria-expanded={open}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-trigger-${i}`}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                  >
                    <span className="font-display text-lg uppercase tracking-wide text-sand lg:text-xl">
                      {f.question}
                    </span>
                    <span className="shrink-0 text-ember">
                      {open ? (
                        <IconMinus className="h-5 w-5" />
                      ) : (
                        <IconPlus className="h-5 w-5" />
                      )}
                    </span>
                  </button>
                </dt>
                <dd
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${i}`}
                  className={`grid transition-all duration-300 ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 pr-10 leading-7 text-sand/80">
                      {f.answer}
                    </p>
                  </div>
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
