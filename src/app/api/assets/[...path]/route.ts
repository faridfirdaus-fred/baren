import { assertAssetKey, getR2Bucket } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await params;
  if (!path || path.length === 0) {
    return new Response("Not Found", { status: 404 });
  }

  let key = path.join("/");
  if (!key.startsWith("assets/")) {
    key = `assets/${key}`;
  }

  try {
    assertAssetKey(key);
  } catch {
    return new Response("Invalid Key", { status: 400 });
  }

  try {
    try {
      const bucket = getR2Bucket();
      const object = await bucket.get(key);
      if (!object) {
        return new Response("Not Found", { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("cache-control", "public, max-age=31536000, immutable");

      const ifNoneMatch = request.headers.get("if-none-match");
      if (ifNoneMatch && ifNoneMatch === object.httpEtag) {
        return new Response(null, { status: 304, headers });
      }

      return new Response(object.body, { headers });
    } catch {
      // Di luar runtime Workers (misal saat `next dev`), fallback fetch via server Node.js
      const publicBase =
        process.env.R2_PUBLIC_URL ||
        "https://pub-f330816cf497437ba8aa9a6b803e3083.r2.dev";
      const remoteRes = await fetch(`${publicBase.replace(/\/+$/, "")}/${key}`);
      if (!remoteRes.ok) {
        return new Response("Not Found", { status: remoteRes.status });
      }
      const headers = new Headers();
      const ct = remoteRes.headers.get("content-type");
      if (ct) headers.set("content-type", ct);
      const et = remoteRes.headers.get("etag");
      if (et) headers.set("etag", et);
      headers.set("cache-control", "public, max-age=31536000, immutable");
      return new Response(remoteRes.body, { status: 200, headers });
    }
  } catch (error) {
    console.error("GET /api/assets/[...path] gagal:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
