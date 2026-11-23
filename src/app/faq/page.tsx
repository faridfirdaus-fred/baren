import type { Metadata } from "next";
import Link from "next/link";
import { getFaqItems } from "@/lib/faq-content";
import { getLandingSettings } from "@/lib/settings-content";
import { resolveFaqCopy } from "@/lib/landing-content";
import { FaqAccordion } from "@/components/site/faq-accordion";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pertanyaan Umum (FAQ) | BAREN",
  description:
    "Jawaban atas pertanyaan seputar gameplay, platform Steam, spesifikasi, dan perilisan game aksi tim 5v5 BAREN.",
};

export default async function FaqPage() {
  const [faqs, settings] = await Promise.all([
    getFaqItems(),
    getLandingSettings(),
  ]);

  const faqCopy = resolveFaqCopy(settings);

  return (
    <main className="min-h-screen bg-ink px-4 py-12 text-sand">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 border-b border-sand/15 pb-6">
          <Link
            href="/#faq"
            className="inline-block text-sm font-semibold uppercase tracking-wider text-ember hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            ← Kembali ke Beranda
          </Link>
          <p className="eyebrow mt-4 text-ember">
            {faqCopy.eyebrow || "SEMUA YANG PERLU KAMU KETAHUI"}
          </p>
          <h1 className="display-xl mt-2 text-sand text-[clamp(2.5rem,5vw,4rem)]">
            {faqCopy.title || "PERTANYAAN UMUM (FAQ)"}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-sand/70">
            Temukan informasi penting mengenai cara bermain, jadwal akses
            perdana di Steam, spesifikasi sistem, dan cara bergabung ke dalam
            komunitas game BAREN.
          </p>
        </div>

        <FaqAccordion eyebrow={null} title={null} items={faqs ?? []} />
      </div>
    </main>
  );
}
