import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getR2Bucket() {
  const { env } = getCloudflareContext();
  const bucket = (env as { BAREN_ASSETS?: R2Bucket }).BAREN_ASSETS;
  if (!bucket) {
    throw new Error("R2 binding BAREN_ASSETS is not configured");
  }
  return bucket;
}

export async function putAsset(key: string, body: ArrayBuffer, contentType: string) {
  const bucket = getR2Bucket();
  await bucket.put(key, body, {
    httpMetadata: { contentType },
  });
  return key;
}

export async function deleteAsset(key: string) {
  const bucket = getR2Bucket();
  await bucket.delete(key);
}
