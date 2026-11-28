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
    "Jawaban atas pertanyaan seputar gameplay party game lokal 2 vs 2, platform Steam, dan cara bergabung ke wishlist BAREN.",
};

export default async function FaqPage() {
  const [faqs, settings] = await Promise.all([
    getFaqItems(),
    getLandingSettings(),
  ]);

  const faqCopy = resolveFaqCopy(settings);

  return (
    <div className="bg-white pt-24 pb-20 sm:pt-28">
      <div className="container-baren max-w-4xl">
        <div className="mb-10 border-b border-zinc-200 pb-6">
          <Link
            href="/#faq"
            className="inline-block text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-900"
          >
            &larr; Kembali ke Beranda
          </Link>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
            {faqCopy.title || "Pertanyaan yang Sering Muncul"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600 sm:text-base">
            Informasi seputar aturan bermain 2 vs 2, dukungan perangkat di
            Steam, dan pendaftaran wishlist game BAREN.
          </p>
        </div>

        <FaqAccordion hideHeader items={faqs ?? []} />
      </div>
    </div>
  );
}
