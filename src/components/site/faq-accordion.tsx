"use client";

import { useState } from "react";

import { useScrollReveal } from "@/lib/use-scroll-reveal";
import { IconMinus, IconPlus } from "./icon";

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqAccordionProps = {
  eyebrow?: string | null;
  title?: string | null;
  items?: FaqItem[];
};

export function FaqAccordion({
  eyebrow,
  title,
  items = [],
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useScrollReveal<HTMLElement>();

  const resolvedTitle = title?.trim() || "PERTANYAAN UMUM (FAQ)";
  const resolvedEyebrow = eyebrow?.trim() || "SEMUA YANG PERLU KAMU KETAHUI";
  const kosong = items.length === 0;

  return (
    <section
      ref={ref}
      id="faq"
      className="scroll-reveal bg-ink py-12 text-sand lg:py-16 scroll-mt-24 border-t border-line/40"
    >
      <div className="container-baren">
        {resolvedEyebrow && (
          <p className="eyebrow text-ember">{resolvedEyebrow}</p>
        )}
        <h2 className="display-xl mt-4 text-sand">{resolvedTitle}</h2>
        {kosong ? (
          <div className="mt-8 rounded border border-dashed border-line bg-ink-800/50 p-8 text-center">
            <p className="text-sm text-sand-600">
              Pertanyaan umum sedang disusun. Pantau terus pembaruan informasi
              resmi kami.
            </p>
          </div>
        ) : (
          <dl className="mt-10 divide-y divide-sand/15 border-y border-sand/15">
            {items.map((f, i) => {
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
        )}
      </div>
    </section>
  );
}
