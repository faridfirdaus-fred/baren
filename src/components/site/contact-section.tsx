// E7-5 & E14-3 — Seksi kontak situs publik (Server Component).
// Copy dan surel disuplai dari settings, dan tautan sosial dari social_links.
// Tautan medsos adalah tautan keluar sehingga memakai target="_blank"
// rel="noopener noreferrer" (E7-6/EI-07); mailto: tidak memakai atribut tab baru.

import { ScrollRevealWrapper } from "@/components/site/scroll-reveal-wrapper";
import { isEmail } from "@/lib/validation/email";
import {
  IconArrowUpRight,
  IconDiscord,
  IconInstagram,
  IconMail,
  IconTiktok,
  IconYoutube,
} from "./icon";
import { SectionShell } from "./section-shell";

export type ContactSocialItem = {
  platform: string;
  url: string;
};

export type ContactSectionProps = {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  emailLabel?: string | null;
  contactEmail?: string | null;
  socialTitle?: string | null;
  socialEmptyMessage?: string | null;
  socials?: ContactSocialItem[] | null;
};

function SocialIcon({
  platform,
  className = "h-5 w-5",
}: {
  platform: string;
  className?: string;
}) {
  const name = platform.toLowerCase();
  if (name.includes("instagram")) {
    return <IconInstagram className={className} />;
  }
  if (name.includes("youtube") || name.includes("youtu")) {
    return <IconYoutube className={className} />;
  }
  if (name.includes("discord")) {
    return <IconDiscord className={className} />;
  }
  if (name.includes("tiktok") || name.includes("tik tok")) {
    return <IconTiktok className={className} />;
  }
  return <IconArrowUpRight className={className} />;
}

export function ContactSection({
  eyebrow,
  title,
  description,
  emailLabel,
  contactEmail,
  socialTitle,
  socialEmptyMessage,
  socials,
}: ContactSectionProps) {
  if (!title) return null;

  const validEmail = isEmail(contactEmail) ? contactEmail!.trim() : null;
  const list = socials ?? [];

  return (
    <ScrollRevealWrapper>
      <SectionShell id="kontak" tone="light" className="border-t border-ink/10">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="min-w-0">
            {eyebrow && <p className="eyebrow text-ember-700">{eyebrow}</p>}
            <h2 className="display-lg mt-4 text-ink">{title}</h2>
            {description && (
              <p className="mt-4 max-w-xl leading-7 text-ink/75">
                {description}
              </p>
            )}
            {validEmail && (
              <>
                {emailLabel && (
                  <p className="eyebrow mt-8 text-ink/60">{emailLabel}</p>
                )}
                <a
                  href={`mailto:${validEmail}`}
                  aria-label={`Kirim surel ke ${validEmail}`}
                  className="mt-3 inline-flex max-w-full items-center gap-2 break-words text-lg font-medium text-ember-700 transition-colors hover:text-ember-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                >
                  <IconMail className="h-5 w-5 shrink-0" aria-hidden="true" />
                  {validEmail}
                </a>
              </>
            )}
          </div>

          <nav aria-label="Media sosial Baren" className="min-w-0">
            {socialTitle && (
              <p className="eyebrow text-ink/60">{socialTitle}</p>
            )}
            {list.length > 0 ? (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {list.map((item) => (
                  <li key={`${item.platform}-${item.url}`} className="min-w-0">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${item.platform} Baren (membuka tab baru)`}
                      className="flex min-w-0 items-center gap-3 border border-ink/15 bg-sand px-4 py-3 text-ink transition-colors hover:border-ember-700 hover:text-ember-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-10 w-10 shrink-0 items-center justify-center bg-ink text-sand"
                      >
                        <SocialIcon platform={item.platform} />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold uppercase tracking-[0.08em]">
                        {item.platform}
                      </span>
                      <IconArrowUpRight
                        className="h-4 w-4 shrink-0"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              socialEmptyMessage && (
                <p className="mt-4 leading-7 text-ink/75">
                  {socialEmptyMessage}
                </p>
              )
            )}
          </nav>
        </div>
      </SectionShell>
    </ScrollRevealWrapper>
  );
}
