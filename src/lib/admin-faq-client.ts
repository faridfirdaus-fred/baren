export type FaqItem = {
  id: number;
  question: string;
  answer: string;
  sortOrder: number;
};

type FaqApiResult<T> =
  | { ok: true; data: T }
  | {
      ok: false;
      error: { message: string; fields?: Record<string, string[]> };
    };

export function parseFaqApiResult<T>(value: unknown): FaqApiResult<T> {
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
