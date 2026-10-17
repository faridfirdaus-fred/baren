import type { SettingsBranding } from "./api/settings";
import { isEmail } from "./validation/email.ts";

export function resolveGameFeaturesCopy(
  settings: SettingsBranding | null | undefined,
) {
  return {
    eyebrow: settings?.featuresEyebrow ?? null,
    title: settings?.featuresTitle ?? null,
    emptyMessage: settings?.featuresEmptyMessage ?? null,
  };
}

export function resolveGalleryCopy(
  settings: SettingsBranding | null | undefined,
) {
  return {
    eyebrow: settings?.galleryEyebrow ?? null,
    title: settings?.galleryTitle ?? null,
    description: settings?.galleryDescription ?? null,
    emptyTitle: settings?.galleryEmptyTitle ?? null,
    emptyMessage: settings?.galleryEmptyMessage ?? null,
  };
}

export function resolveNewsCopy(settings: SettingsBranding | null | undefined) {
  return {
    title: settings?.newsTitle ?? null,
    ctaLabel: settings?.newsCtaLabel ?? null,
  };
}

export function resolveFaqCopy(settings: SettingsBranding | null | undefined) {
  return {
    eyebrow: settings?.faqEyebrow ?? null,
    title: settings?.faqTitle ?? null,
  };
}

export function resolveHowToPlayCopy(
  settings: SettingsBranding | null | undefined,
) {
  return {
    title: settings?.howToPlayTitle ?? null,
  };
}

export function resolveCommentsCopy(
  settings: SettingsBranding | null | undefined,
) {
  return {
    title: settings?.commentsTitle ?? null,
    loginPrompt: settings?.commentsLoginPrompt ?? null,
    emptyMessage: settings?.commentsEmptyMessage ?? null,
    submitLabel: settings?.commentsSubmitLabel ?? null,
    submitError: settings?.commentsSubmitError ?? null,
  };
}

export function resolveContactCopy(
  settings: SettingsBranding | null | undefined,
) {
  const email = settings?.emailKontak?.trim() ?? null;
  return {
    eyebrow: settings?.contactEyebrow ?? null,
    title: settings?.contactTitle ?? null,
    description: settings?.contactDescription ?? null,
    emailLabel: settings?.contactEmailLabel ?? null,
    contactEmail: isEmail(email) ? email : null,
    socialTitle: settings?.contactSocialTitle ?? null,
    socialEmptyMessage: settings?.contactSocialEmptyMessage ?? null,
  };
}
