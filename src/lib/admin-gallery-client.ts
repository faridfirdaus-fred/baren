import type { GalleryKind } from "./validation/gallery";

export type GalleryAsset = {
  id: number;
  kind: GalleryKind;
  title: string | null;
  fileUrl: string;
  sortOrder: number;
};

export type GalleryDeleteData = GalleryAsset & { r2Deleted: boolean };

type GalleryApiResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: { message: string; fields?: Record<string, string[]> };
    };

export function parseGalleryApiResult<T>(value: unknown): GalleryApiResult<T> {
  if (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    value.ok === true &&
    "data" in value
  ) {
    return { ok: true, data: value.data as T };
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "ok" in value &&
    value.ok === false &&
    "error" in value &&
    typeof value.error === "object" &&
    value.error !== null &&
    "message" in value.error &&
    typeof value.error.message === "string"
  ) {
    const fields =
      "fields" in value.error &&
      typeof value.error.fields === "object" &&
      value.error.fields !== null
        ? (value.error.fields as Record<string, string[]>)
        : undefined;
    return { ok: false, error: { message: value.error.message, fields } };
  }
  return { ok: false, error: { message: "Respons server tidak valid." } };
}
