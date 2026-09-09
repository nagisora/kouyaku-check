import type { ClaimKind, Label } from "./types";

export interface ClaimQualityInput {
  label: Label;
  claim_kind?: ClaimKind;
}

export function shouldWarnSoftOnlyProcess(entries: readonly ClaimQualityInput[]): boolean {
  const processEntries = entries.filter((entry) => entry.label === "行動一致");
  if (processEntries.length === 0) {
    return false;
  }
  const reachedOutcome = entries.some((entry) => entry.label === "公約実現");
  if (reachedOutcome) {
    return false;
  }
  return processEntries.every((entry) => entry.claim_kind === "soft");
}
