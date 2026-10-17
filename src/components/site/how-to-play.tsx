import Image from "next/image";

import { SectionShell } from "@/components/site/section-shell";
import { ScrollRevealWrapper } from "@/components/site/scroll-reveal-wrapper";
import type { HowToPlayContent } from "@/lib/how-to-play-content";

type Props = {
  content: HowToPlayContent;
  title?: string | null;
};

export function HowToPlay({ content, title }: Props) {
  if (!title) return null;

  return (
    <ScrollRevealWrapper>
      <SectionShell id="cara-main" tone="dark">
        <h2 className="display-xl text-center text-[clamp(2rem,4vw,3.25rem)]">
          {title}
        </h2>

        {content.videoUrl && (
          <div className="mx-auto mt-12 max-w-4xl">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-ink-700">
              <video
                className="h-full w-full"
                controls
                poster="/media/hero-poster.jpg"
              >
                <source src={content.videoUrl} type="video/mp4" />
                Browser Anda tidak mendukung video.
              </video>
            </div>
          </div>
        )}

        <div className="mt-16 grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {content.steps.map((step) => (
            <div key={step.id} className="flex flex-col">
              {step.mediaUrl && (
                <div className="relative aspect-video overflow-hidden rounded-lg bg-ink-700">
                  <Image
                    src={step.mediaUrl}
                    fill
                    sizes="(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw"
                    className="object-cover"
                    alt={step.title}
                  />
                </div>
              )}
              <div className="mt-6">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ember-700 text-2xl font-bold text-white">
                    {step.step}
                  </span>
                  <h3 className="text-2xl font-bold">{step.title}</h3>
                </div>
                {step.description && (
                  <p className="mt-4 text-ink-600 leading-relaxed">
                    {step.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionShell>
    </ScrollRevealWrapper>
  );
}
