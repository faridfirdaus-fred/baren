"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useScrollReveal } from "@/lib/use-scroll-reveal";

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqAccordionProps = {
  eyebrow?: string | null;
  title?: string | null;
  items?: FaqItem[];
};

// Fallback FAQ items sesuai mockup BAREN-1
const DEFAULT_FAQ: FaqItem[] = [
  {
    question: "Berapa pemain yang bisa bermain sekaligus?",
    answer:
      "BAREN dimainkan 4 orang dalam dua tim, masing-masing berisi dua pemain, pada satu perangkat yang sama (shared screen co-op).",
  },
  {
    question: "Kapan BAREN dirilis?",
    answer:
      "BAREN dijadwalkan hadir segera di Steam! Tambahkan ke Wishlist sekarang untuk menerima kabar rilis dan akses uji coba pertama.",
  },
  {
    question: "Di platform apa BAREN tersedia?",
    answer:
      "Pada rilis perdana, BAREN hadir di PC melalui Steam dengan dukungan gamepad/controller serta keyboard lokal co-op.",
  },
  {
    question: "Apakah BAREN bisa dimainkan online?",
    answer:
      "Fokus utama kami saat ini adalah pesta main bersama satu layar (local multiplayer), namun kamu juga bisa menggunakan Steam Remote Play Together untuk main bareng teman secara online!",
  },
];

export function FaqAccordion({
  eyebrow,
  title,
  items = [],
}: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const ref = useScrollReveal<HTMLElement>();

  const resolvedTitle = title?.trim() || "Pertanyaan yang sering muncul";
  const resolvedEyebrow = eyebrow?.trim() || "FAQ";
  const displayItems = items.length > 0 ? items : DEFAULT_FAQ;

  return (
    <section
      ref={ref}
      id="faq"
      className="scroll-reveal relative w-full py-16 sm:py-24 bg-[#faf6ee] text-[#2f180a] overflow-hidden"
    >
      <div className="container-baren">
        <div className="flex flex-col items-center text-center gap-3 mb-12 sm:mb-16">
          <span className="pill-eyebrow">
            <HelpCircle className="w-3.5 h-3.5" /> {resolvedEyebrow}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#2f180a]">
            {resolvedTitle}
          </h2>
        </div>

        <div className="max-w-3xl mx-auto flex flex-col gap-3.5 sm:gap-4">
          {displayItems.map((f, i) => {
            const open = openIndex === i;
            return (
              <div
                key={f.question}
                className="rounded-2xl bg-white border-2 border-[#2f180a]/12 shadow-sm overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-trigger-${i}`}
                  className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left transition-colors hover:bg-[#faf6ee]/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f59e0b]"
                >
                  <span className="text-base sm:text-lg font-black text-[#2f180a] tracking-tight">
                    {f.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      open
                        ? "bg-[#c83820] text-white rotate-180"
                        : "bg-[#faf6ee] text-[#2f180a] border border-[#2f180a]/15"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </button>

                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${i}`}
                  className={`grid transition-all duration-300 ${
                    open
                      ? "grid-rows-[1fr] opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-sm sm:text-base leading-relaxed text-[#542d14] border-t border-[#2f180a]/8">
                      {f.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
