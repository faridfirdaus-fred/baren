/**
 * Helper Cloudflare R2 untuk BAREN (E4-1).
 *
 * Temuan audit:
 * - Binding `BAREN_ASSETS` hanya untuk akses server-side (head/hapus).
 *   Binding TIDAK dapat menandatangani URL upload langsung browser.
 * - Upload langsung browser ke R2 memakai presigned URL S3 (SigV4) yang
 *   dibuat server dengan kredensial API R2 (secret Workers), tanpa
 *   mem-proxy byte berkas lewat Worker.
 * - URL publik permanen (`R2_PUBLIC_URL`) terpisah dari `uploadUrl`.
 * - Kadaluarsa presign maksimal 600 detik (NFR-SEC-05).
 * - Hanya Web Crypto (`crypto.subtle`), tanpa modul native Node (C-04).
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

export const PRESIGNED_URL_MAX_EXPIRY_SECONDS = 600;
export const R2_S3_REGION = "auto";
export const R2_S3_SERVICE = "s3";
export const ASSET_KEY_PREFIX = "assets/";

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "video/mp4": "mp4",
};

const EXTENSION_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  svg: "image/svg+xml",
  mp4: "video/mp4",
};

export type R2PresignEnv = {
  accountId: string;
  bucketName: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
};

function readEnvValue(name: string): string | undefined {
  try {
    const { env } = getCloudflareContext();
    const value = (env as unknown as Record<string, unknown>)[name];
    if (typeof value === "string" && value.length > 0) {
      return value;
    }
  } catch {
    // Di luar runtime Workers, fallback ke process.env.
  }
  const fallback = process.env[name];
  return typeof fallback === "string" && fallback.length > 0
    ? fallback
    : undefined;
}

/** Baca konfigurasi R2 dari env; lempar error deskriptif bila belum diset. */
export function getR2PresignEnv(): R2PresignEnv {
  const accountId = readEnvValue("R2_ACCOUNT_ID");
  const bucketName =
    readEnvValue("R2_BUCKET_NAME") ??
    readEnvValue("R2_BUCKET") ??
    "baren-assets";
  const accessKeyId = readEnvValue("R2_ACCESS_KEY_ID");
  const secretAccessKey = readEnvValue("R2_SECRET_ACCESS_KEY");
  const publicBaseUrl = readEnvValue("R2_PUBLIC_URL");

  const missing: string[] = [];
  if (!accountId) missing.push("R2_ACCOUNT_ID");
  if (!accessKeyId) missing.push("R2_ACCESS_KEY_ID");
  if (!secretAccessKey) missing.push("R2_SECRET_ACCESS_KEY");
  if (!publicBaseUrl) missing.push("R2_PUBLIC_URL");
  if (missing.length > 0) {
    throw new Error(
      `Konfigurasi R2 belum lengkap (hilang: ${missing.join(", ")}). ` +
        "Lihat docs/R2_ASSETS_SETUP.md.",
    );
  }

  return {
    accountId: accountId as string,
    bucketName,
    accessKeyId: accessKeyId as string,
    secretAccessKey: secretAccessKey as string,
    publicBaseUrl: publicBaseUrl as string,
  };
}

/** Ambil bucket R2 via binding untuk operasi server-side (head/hapus). */
export function getR2Bucket() {
  const { env } = getCloudflareContext();
  const bucket = (env as { BAREN_ASSETS?: R2Bucket }).BAREN_ASSETS;
  if (!bucket) {
    throw new Error("R2 binding BAREN_ASSETS is not configured");
  }
  return bucket;
}

/** Validasi key milik bucket ini; tolak traversal dan key asing. */
export function assertAssetKey(key: string): void {
  if (!key || key.length > 1024) {
    throw new Error("Key aset tidak valid");
  }
  if (
    !key.startsWith(ASSET_KEY_PREFIX) ||
    key.includes("..") ||
    key.startsWith("/") ||
    !/^[A-Za-z0-9/_.-]+$/.test(key)
  ) {
    throw new Error("Key aset tidak valid");
  }
}

/** Buat key acak `assets/<purpose>/YYYY/MM/<uuid>.<ext>` dari MIME. */
export function createAssetKey(purpose: string, mimeType: string): string {
  const safePurpose = purpose.trim().toLowerCase();
  if (!/^[a-z0-9-]{1,32}$/.test(safePurpose)) {
    throw new Error("Purpose aset tidak valid");
  }
  const extension = MIME_TO_EXTENSION[mimeType];
  if (!extension) {
    throw new Error(`Tipe berkas tidak didukung: ${mimeType}`);
  }
  const now = new Date();
  const year = String(now.getUTCFullYear());
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const id =
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
  return `${ASSET_KEY_PREFIX}${safePurpose}/${year}/${month}/${id}.${extension}`;
}

/** Petakan ekstensi nama file ke MIME (jangan dipercaya sendirian). */
export function mimeFromExtension(fileName: string): string | undefined {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_TO_MIME[ext];
}

/** Bangun URL publik permanen dari key (bukan signed URL). */
export function buildPublicAssetUrl(key: string, baseUrl?: string): string {
  assertAssetKey(key);
  const base =
    baseUrl ?? readEnvValue("R2_PUBLIC_URL") ?? "https://pub-xxx.r2.dev";
  if (!base.startsWith("https://")) {
    throw new Error("R2_PUBLIC_URL harus diawali https://");
  }
  return `${base.replace(/\/+$/, "")}/${key}`;
}

function encodeRfc3986(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function encodeKeyPath(key: string): string {
  return key
    .split("/")
    .map((segment) => encodeRfc3986(segment))
    .join("/");
}

function toAmzDate(date: Date): { amzDate: string; dateStamp: string } {
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    amzDate:
      `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
      `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`,
    dateStamp: `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`,
  };
}

async function hmacSha256(
  key: ArrayBuffer | Uint8Array,
  data: string,
): Promise<Uint8Array> {
  const keyBytes =
    key instanceof Uint8Array ? key : new Uint8Array(key as ArrayBuffer);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(data),
  );
  return new Uint8Array(signature);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type PresignedPutInput = {
  key: string;
  contentType: string;
  expiresInSeconds?: number;
  env?: Partial<R2PresignEnv>;
};

/**
 * Buat presigned URL PUT S3 untuk upload langsung browser ke R2.
 * `Content-Type` ikut ditandatangani sehingga klien wajib mengirim
 * MIME yang sama; expiry dibatasi maksimal 600 detik.
 */
export async function createPresignedPutUrl(input: PresignedPutInput): Promise<{
  uploadUrl: string;
  key: string;
  expiresInSeconds: number;
}> {
  assertAssetKey(input.key);
  if (!input.contentType || input.contentType.length > 128) {
    throw new Error("Content-Type tidak valid");
  }
  const expiresInSeconds = input.expiresInSeconds ?? 600;
  if (
    !Number.isInteger(expiresInSeconds) ||
    expiresInSeconds < 1 ||
    expiresInSeconds > PRESIGNED_URL_MAX_EXPIRY_SECONDS
  ) {
    throw new Error(`Expiry harus 1-${PRESIGNED_URL_MAX_EXPIRY_SECONDS} detik`);
  }

  const resolved = input.env ?? {};
  const accountId = resolved.accountId ?? readEnvValue("R2_ACCOUNT_ID");
  const bucketName =
    resolved.bucketName ??
    readEnvValue("R2_BUCKET_NAME") ??
    readEnvValue("R2_BUCKET") ??
    "baren-assets";
  const accessKeyId = resolved.accessKeyId ?? readEnvValue("R2_ACCESS_KEY_ID");
  const secretAccessKey =
    resolved.secretAccessKey ?? readEnvValue("R2_SECRET_ACCESS_KEY");
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Kredensial R2 (R2_ACCOUNT_ID/R2_ACCESS_KEY_ID/R2_SECRET_ACCESS_KEY) belum dikonfigurasi",
    );
  }

  const host = `${accountId}.r2.cloudflarestorage.com`;
  const canonicalUri = `/${encodeRfc3986(bucketName)}/${encodeKeyPath(input.key)}`;
  const { amzDate, dateStamp } = toAmzDate(new Date());
  const credentialScope = `${dateStamp}/${R2_S3_REGION}/${R2_S3_SERVICE}/aws4_request`;
  const signedHeaders = "content-type;host";

  const query: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${accessKeyId}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresInSeconds),
    "X-Amz-SignedHeaders": signedHeaders,
  };
  const canonicalQueryString = Object.keys(query)
    .sort()
    .map((k) => `${encodeRfc3986(k)}=${encodeRfc3986(query[k])}`)
    .join("&");

  const canonicalHeaders =
    `content-type:${input.contentType.trim()}\n` + `host:${host}\n`;
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQueryString,
    canonicalHeaders,
    signedHeaders,
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const canonicalHash = toHex(
    new Uint8Array(
      await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(canonicalRequest),
      ),
    ),
  );
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    canonicalHash,
  ].join("\n");

  const encoder = new TextEncoder();
  const kDate = await hmacSha256(
    encoder.encode(`AWS4${secretAccessKey}`),
    dateStamp,
  );
  const kRegion = await hmacSha256(kDate, R2_S3_REGION);
  const kService = await hmacSha256(kRegion, R2_S3_SERVICE);
  const kSigning = await hmacSha256(kService, "aws4_request");
  const signature = toHex(await hmacSha256(kSigning, stringToSign));

  const uploadUrl =
    `https://${host}${canonicalUri}?${canonicalQueryString}` +
    `&X-Amz-Signature=${signature}`;
  return { uploadUrl, key: input.key, expiresInSeconds };
}

export type StoredAssetExpectation = {
  contentType?: string;
  maxBytes?: number;
};

/**
 * Verifikasi metadata objek yang sudah terunggah (tahap commit/objek E4-3).
 */
export async function verifyStoredAsset(
  key: string,
  expected?: StoredAssetExpectation,
): Promise<{ exists: boolean; size?: number; contentType?: string }> {
  assertAssetKey(key);
  const bucket = getR2Bucket();
  const object = await bucket.head(key);
  if (!object) {
    return { exists: false };
  }
  const size = object.size;
  const contentType = object.httpMetadata?.contentType;
  if (expected?.maxBytes !== undefined && size > expected.maxBytes) {
    throw new Error(`Ukuran berkas melebihi batas (${size} byte)`);
  }
  if (
    expected?.contentType &&
    contentType &&
    contentType !== expected.contentType
  ) {
    throw new Error(`Tipe berkas tidak sesuai (${contentType})`);
  }
  return { exists: true, size, contentType };
}

/** Hapus objek milik bucket ini (dipakai endpoint delete admin E4-5). */
export async function deleteAsset(key: string) {
  assertAssetKey(key);
  const bucket = getR2Bucket();
  await bucket.delete(key);
}
