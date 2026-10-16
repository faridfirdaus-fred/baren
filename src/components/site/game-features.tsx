import Image from "next/image";

import { getFeatures } from "@/lib/features-content";
import { SectionShell } from "@/components/site/section-shell";

export async function GameFeatures() {
  const features = await getFeatures();

  if (features.length === 0) {
    return (
      <SectionShell id="fitur" tone="light" className="border-t border-ink/10">
        <p className="eyebrow text-ember-700">KEUNGGULAN</p>
        <h2 className="display-xl mt-4 text-ink">FITUR UTAMA</h2>
        <p className="mt-6 text-ink/60">
          Fitur belum tersedia. Tambahkan melalui panel admin.
        </p>
      </SectionShell>
    );
  }

  return (
    <SectionShell id="fitur" tone="light" className="border-t border-ink/10">
      <p className="eyebrow text-ember-700">KEUNGGULAN</p>
      <h2 className="display-xl mt-4 text-ink">FITUR UTAMA</h2>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {features.map((feature, index) => (
          <article
            key={feature.id}
            className="border border-sand-600 bg-sand"
          >
            <div className="relative aspect-square overflow-hidden bg-ink-700">
              <Image
                src={feature.iconUrl || "/art/placeholder-feature.jpg"}
                alt={feature.title}
                fill
                sizes="(min-width:768px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <p className="font-display text-3xl text-ember-700">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-display text-xl uppercase text-ink">
                {feature.title}
              </h3>
              <p className="mt-3 leading-7 text-ink/75">
                {feature.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
