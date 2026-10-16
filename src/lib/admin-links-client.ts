export type ApiResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: { message: string; fields?: Record<string, string[]> };
    };

export type SocialLink = {
  id: number;
  platform: string;
  url: string;
  sortOrder: number;
};

export type DownloadLink = SocialLink & { label: string };

export type Settings = {
  namaGame: string | null;
  tagline: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  emailKontak: string | null;
};

export type FetchLinks = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<{ json(): Promise<unknown> }>;

export async function fetchLinksApiResult<T>(
  fetcher: FetchLinks,
  path: string,
): Promise<ApiResult<T>> {
  try {
    return parseLinksApiResult<T>(await (await fetcher(path)).json());
  } catch {
    return {
      ok: false,
      error: {
        message: "Tautan dan pengaturan tidak dapat dimuat. Coba lagi.",
      },
    };
  }
}

export function parseLinksApiResult<T>(value: unknown): ApiResult<T> {
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
