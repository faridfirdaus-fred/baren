import { describe, it } from "node:test";
import assert from "node:assert/strict";

const {
  parseBrandingApiResult,
  toBrandingFormValues,
  toBrandingUpdatePayload,
  fetchBranding,
  saveBranding,
} = await import("./admin-branding-client.ts");

describe("parseBrandingApiResult", () => {
  it("parses valid success response", () => {
    const raw = {
      ok: true,
      data: {
        namaGame: "BAREN",
        tagline: "Rebut benteng.",
        logoUrl: "https://pub-r2.dev/logo.png",
        faviconUrl: "https://pub-r2.dev/favicon.ico",
        emailKontak: "kontak@baren.id",
      },
    };
    const parsed = parseBrandingApiResult(raw);
    assert.deepEqual(parsed, raw);
  });

  it("parses error response with field errors", () => {
    const raw = {
      ok: false,
      error: {
        message: "Data tidak valid.",
        fields: {
          logoUrl: ["URL logo harus diawali https://."],
        },
      },
    };
    const parsed = parseBrandingApiResult(raw);
    assert.deepEqual(parsed, raw);
  });

  it("rejects non-object or malformed responses", () => {
    assert.deepEqual(parseBrandingApiResult(null), {
      ok: false,
      error: { message: "Respons server tidak valid." },
    });
    assert.deepEqual(parseBrandingApiResult({ ok: "not-a-bool" }), {
      ok: false,
      error: { message: "Respons server tidak valid." },
    });
  });
});

describe("toBrandingFormValues", () => {
  it("converts null or missing properties to empty strings", () => {
    assert.deepEqual(toBrandingFormValues(null), {
      namaGame: "",
      tagline: "",
      logoUrl: "",
      faviconUrl: "",
    });

    assert.deepEqual(
      toBrandingFormValues({
        namaGame: "BAREN",
        logoUrl: null,
      }),
      {
        namaGame: "BAREN",
        tagline: "",
        logoUrl: "",
        faviconUrl: "",
      },
    );
  });
});

describe("toBrandingUpdatePayload", () => {
  it("maps empty strings to null or omits if empty", () => {
    const payload = toBrandingUpdatePayload({
      namaGame: "  BAREN  ",
      tagline: "   ",
      logoUrl: "https://pub-r2.dev/logo.png",
      faviconUrl: "",
    });

    assert.deepEqual(payload, {
      namaGame: "BAREN",
      tagline: null,
      logoUrl: "https://pub-r2.dev/logo.png",
      faviconUrl: null,
    });
  });
});

describe("fetchBranding", () => {
  it("catches network error and returns user friendly error", async () => {
    const mockFetcher = async () => {
      throw new Error("Network error");
    };
    const result = await fetchBranding(mockFetcher);
    assert.deepEqual(result, {
      ok: false,
      error: {
        message: "Pengaturan branding tidak dapat dimuat. Coba lagi.",
      },
    });
  });

  it("calls fetcher with correct endpoint", async () => {
    let calledPath = "";
    const mockFetcher = async (path) => {
      calledPath = String(path);
      return {
        json: async () => ({
          ok: true,
          data: {
            namaGame: "BAREN",
            tagline: "Game seru",
            logoUrl: null,
            faviconUrl: null,
            emailKontak: null,
          },
        }),
      };
    };

    const result = await fetchBranding(mockFetcher);
    assert.equal(calledPath, "/api/settings");
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.namaGame, "BAREN");
    }
  });
});

describe("saveBranding", () => {
  it("sends PUT with payload and handles success", async () => {
    let sentMethod = "";
    let sentBody = "";
    const mockFetcher = async (_path, init) => {
      sentMethod = init?.method ?? "";
      sentBody = String(init?.body);
      return {
        json: async () => ({
          ok: true,
          data: {
            namaGame: "BAREN NEW",
            tagline: null,
            logoUrl: null,
            faviconUrl: null,
            emailKontak: null,
          },
        }),
      };
    };

    const result = await saveBranding({ namaGame: "BAREN NEW" }, mockFetcher);
    assert.equal(sentMethod, "PUT");
    assert.equal(JSON.parse(sentBody).namaGame, "BAREN NEW");
    assert.equal(result.ok, true);
  });
});
