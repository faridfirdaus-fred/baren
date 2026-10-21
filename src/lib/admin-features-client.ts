// Parser dan normalisasi respons fitur untuk panel admin (E16-1).

import { parseApiEnvelope, type ApiEnvelope } from "./api/client-response.ts";

export type AdminFeature = {
  id: number;
  title: string;
  description: string | null;
  iconUrl: string | null;
  sortOrder: number;
};

function isFeature(
  value: unknown,
): value is { id: number; title: string } & Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "number" &&
    "title" in value &&
    typeof value.title === "string" &&
    value.title.trim().length > 0
  );
}

function optionalText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

export function parseAdminFeatures(
  value: unknown,
): ApiEnvelope<AdminFeature[]> {
  const envelope = parseApiEnvelope<unknown>(value);
  if (!envelope.ok) return envelope;
  if (!Array.isArray(envelope.data)) {
    return { ok: false, message: "Respons server tidak valid." };
  }

  return {
    ok: true,
    data: envelope.data.filter(isFeature).map((feature) => ({
      id: feature.id,
      title: feature.title,
      description: optionalText(feature.description),
      iconUrl: optionalText(feature.iconUrl),
      sortOrder:
        typeof feature.sortOrder === "number" &&
        Number.isFinite(feature.sortOrder)
          ? feature.sortOrder
          : 0,
    })),
  };
}
