"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqAccordionProps = {
  eyebrow?: string | null;
  title?: string | null;
  items?: FaqItem[];
  hideHeader?: boolean;
};

const DEFAULT_FAQ: FaqItem[] = [
  {
    question: "Berapa pemain yang bisa bermain sekaligus?",
    answer:
      "BAREN dimainkan 4 orang dalam dua tim (2 vs 2) pada satu perangkat yang sama (shared screen co-op).",
  },
  {
    question: "Kapan BAREN dirilis?",
    answer:
      "BAREN dijadwalkan hadir segera di Steam. Gabung ke Wishlist sekarang untuk menerima kabar rilis dan sesi uji main berikutnya.",
  },
  {
    question: "Di platform apa BAREN tersedia?",
    answer:
      "Pada rilis perdana, BAREN hadir di PC melalui Steam dengan dukungan penuh controller maupun keyboard lokal.",
  },
  {
    question: "Apakah BAREN bisa dimainkan jarak jauh bersama teman?",
    answer:
      "Fokus utama kami adalah keseruan main satu layar bersama, dan di Steam kamu juga dapat memanfaatkan fitur Steam Remote Play Together.",
  },
];

export function FaqAccordion({
  title,
  items = [],
  hideHeader = false,
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useScrollReveal<HTMLElement>();

  const resolvedTitle = title?.trim() || "Pertanyaan yang sering muncul";
  const displayItems = items.length > 0 ? items : DEFAULT_FAQ;

  const listContent = (
    <div className="mx-auto flex max-w-3xl flex-col gap-3">
      {displayItems.map((f, i) => {
        const open = openIndex === i;
        return (
          <div
            key={f.question}
            className="overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-colors hover:border-zinc-300"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              aria-controls={`faq-panel-${i}`}
              id={`faq-trigger-${i}`}
              className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-zinc-50/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
            >
              <span className="text-sm font-semibold text-zinc-950 sm:text-base">
                {f.question}
              </span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 transition-transform duration-200 ${
                  open
                    ? "rotate-180 border-zinc-900 bg-zinc-900 text-white"
                    : "bg-white text-zinc-600"
                }`}
              >
                <ChevronDown className="h-4 w-4" />
              </span>
            </button>

            <div
              id={`faq-panel-${i}`}
              role="region"
              aria-labelledby={`faq-trigger-${i}`}
              className={`grid transition-all duration-200 ${
                open
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-zinc-100 px-5 pt-3 pb-5 text-sm leading-relaxed text-zinc-600">
                  {f.answer}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (hideHeader) {
    return listContent;
  }

  return (
    <section
      ref={ref}
      id="faq"
      className="scroll-reveal w-full border-t border-zinc-100 bg-zinc-50/70 py-16 sm:py-24"
    >
      <div className="container-baren">
        <div className="mb-10 flex flex-col items-center gap-3 text-center sm:mb-12">
          <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
            {resolvedTitle}
          </h2>
        </div>

        {listContent}
      </div>
    </section>
  );
}
