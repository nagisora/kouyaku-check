import { LABELS, SOURCE_TYPES } from "./types";
import type { Label, SourceType } from "./types";

export function formatDietSession(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  throw new Error("diet_session must be a string, number, or empty");
}

export function isLabel(value: unknown): value is Label {
  return typeof value === "string" && LABELS.some((item) => item === value);
}

export function isSourceType(value: unknown): value is SourceType {
  return typeof value === "string" && SOURCE_TYPES.some((item) => item === value);
}
