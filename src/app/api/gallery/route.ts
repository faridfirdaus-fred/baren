// E3-5: GET galeri publik (filter ?kind= opsional) + POST aset (admin).

import { eq } from "drizzle-orm";

import { getDb } from "@/db";
import { galleryAssets } from "@/db/schema";
import { requireAdminResponse } from "@/lib/api/guard";
import { toDbResult } from "@/lib/api/db-errors";
import { fromResult } from "@/lib/api/response";
import { parseJsonBody } from "@/lib/api/parse";
import {
  readGallery,
  type GalleryCreator,
  type GalleryLister,
  type GalleryRow,
} from "@/lib/api/gallery";
import {
  galleryCreateSchema,
  galleryKinds,
  type GalleryKind,
} from "@/lib/validation/gallery";

export const dynamic = "force-dynamic";

type Db = ReturnType<typeof getDb>;

function toRow(r: typeof galleryAssets.$inferSelect): GalleryRow {
  return {
    id: r.id,
    kind: (r.kind ?? "image") as GalleryKind,
    title: r.title,
    fileUrl: r.fileUrl,
    sortOrder: r.sortOrder,
  };
}

function lister(db: Db): GalleryLister {
  return {
    async list(kind?: GalleryKind): Promise<GalleryRow[]> {
      const rows =
        kind === undefined
          ? await db.select().from(galleryAssets)
          : await db
              .select()
              .from(galleryAssets)
              .where(eq(galleryAssets.kind, kind));
      return rows.map(toRow);
    },
  };
}

function creator(db: Db): GalleryCreator {
  return {
    async create(input): Promise<GalleryRow> {
      const rows = await db
        .insert(galleryAssets)
        .values({
          kind: input.kind,
          title: input.title ?? null,
          fileUrl: input.fileUrl,
          sortOrder: input.sortOrder ?? 0,
        })
        .returning();
      const created = rows[0];
      if (!created) throw new Error("Gagal menambah aset galeri.");
      return toRow(created);
    },
  };
}

/** Publik: daftar aset (saring ?kind=image|screenshot|artwork|banner|video). */
export async function GET(request: Request): Promise<Response> {
  const raw = new URL(request.url).searchParams.get("kind");
  if (raw !== null && !(galleryKinds as readonly string[]).includes(raw)) {
    return fromResult({
      ok: false,
      status: 400,
      code: "VALIDATION_ERROR",
      message: "Validasi gagal. Periksa kembali kolom yang ditandai.",
      fields: {
        kind: [`Jenis harus salah satu: ${galleryKinds.join(", ")}.`],
      },
    });
  }
  try {
    const db = getDb();
    return fromResult({
      ok: true,
      data: await readGallery(
        lister(db),
        (raw ?? undefined) as GalleryKind | undefined,
      ),
    });
  } catch (error) {
    console.error("GET /api/gallery gagal:", error);
    return fromResult(toDbResult(error));
  }
}

/** Admin: tambah aset (metadata key/URL dari uploader R2). */
export async function POST(request: Request): Promise<Response> {
  const denied = await requireAdminResponse("POST /api/gallery");
  if (denied) return denied;
  const parsed = await parseJsonBody(request, galleryCreateSchema);
  if (!parsed.ok) return fromResult(parsed);
  try {
    return fromResult({
      ok: true,
      data: await creator(getDb()).create(parsed.data),
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/gallery gagal:", error);
    return fromResult(toDbResult(error));
  }
}
