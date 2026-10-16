export type ApiResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: { message: string; fields?: Record<string, string[]> };
    };

export type BrandingSettings = {
  namaGame: string | null;
  tagline: string | null;
  logoUrl: string | null;
  faviconUrl: string | null;
  emailKontak: string | null;
};

export type BrandingFormValues = {
  namaGame: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
};

export type BrandingUpdatePayload = {
  namaGame?: string;
  tagline?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
};

export function parseBrandingApiResult<T>(value: unknown): ApiResult<T> {
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

export function toBrandingFormValues(
  data: Partial<BrandingSettings> | null | undefined,
): BrandingFormValues {
  return {
    namaGame: data?.namaGame ?? "",
    tagline: data?.tagline ?? "",
    logoUrl: data?.logoUrl ?? "",
    faviconUrl: data?.faviconUrl ?? "",
  };
}

export function toBrandingUpdatePayload(
  values: BrandingFormValues,
): BrandingUpdatePayload {
  const namaTrim = values.namaGame.trim();
  const tagTrim = values.tagline.trim();
  const logoTrim = values.logoUrl.trim();
  const favTrim = values.faviconUrl.trim();

  return {
    ...(namaTrim.length > 0 ? { namaGame: namaTrim } : {}),
    tagline: tagTrim.length > 0 ? tagTrim : null,
    logoUrl: logoTrim.length > 0 ? logoTrim : null,
    faviconUrl: favTrim.length > 0 ? favTrim : null,
  };
}

export async function fetchBranding(
  fetcher: typeof fetch = fetch,
  signal?: AbortSignal,
): Promise<ApiResult<BrandingSettings>> {
  try {
    const response = await fetcher("/api/settings", {
      cache: "no-store",
      signal,
    });
    return parseBrandingApiResult<BrandingSettings>(await response.json());
  } catch {
    return {
      ok: false,
      error: {
        message: "Pengaturan branding tidak dapat dimuat. Coba lagi.",
      },
    };
  }
}

export async function saveBranding(
  payload: BrandingUpdatePayload,
  fetcher: typeof fetch = fetch,
): Promise<ApiResult<BrandingSettings>> {
  try {
    const response = await fetcher("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return parseBrandingApiResult<BrandingSettings>(await response.json());
  } catch {
    return {
      ok: false,
      error: {
        message: "Pengaturan branding tidak dapat disimpan. Coba lagi.",
      },
    };
  }
}
