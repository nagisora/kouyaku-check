import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import yaml from "js-yaml";

type Label = "行動一致" | "公約実現" | "ズレ" | "不明";
type ClaimKind = "hard" | "soft";
type LabelCounts = Record<Label, number>;

interface QualityEntry {
  label: Label;
  claim_kind?: ClaimKind;
}

interface PinnedLedger {
  counts: LabelCounts;
  entryCount: number;
}

const DATA_DIR = path.join(process.cwd(), "data", "politicians");
const LABEL_SET: ReadonlySet<string> = new Set(["行動一致", "公約実現", "ズレ", "不明"]);
const CLAIM_KIND_SET: ReadonlySet<string> = new Set(["hard", "soft"]);
const SOURCE_TYPE_SET: ReadonlySet<string> = new Set(["bulletin", "party", "minutes", "vote", "none", "statement", "bill"]);
const AGENCY_CAPACITY_SET: ReadonlySet<string> = new Set(["individual", "caucus_or_party", "cabinet_or_executive", "unknown"]);
const VOTING_METHOD_SET: ReadonlySet<string> = new Set(["named_rollcall", "pushbutton", "standing_or_voice", "no_objection", "unknown"]);
const HORIZON_STATUS_SET: ReadonlySet<string> = new Set(["achieved", "in_flight", "truncated_dissolution", "horizon_not_reached", "not_applicable"]);

const PINNED_LEDGERS: Record<string, PinnedLedger> = {
  "hc-7025005": {
    counts: { 行動一致: 9, 公約実現: 0, ズレ: 0, 不明: 3 },
    entryCount: 12,
  },
  "hr-230": {
    counts: { 行動一致: 4, 公約実現: 6, ズレ: 1, 不明: 2 },
    entryCount: 13,
  },
  "hr-258": {
    counts: { 行動一致: 6, 公約実現: 0, ズレ: 2, 不明: 4 },
    entryCount: 12,
  },
  "hr-135": {
    counts: { 行動一致: 9, 公約実現: 0, ズレ: 0, 不明: 5 },
    entryCount: 14,
  },
  "hc-7019010": {
    counts: { 行動一致: 0, 公約実現: 2, ズレ: 0, 不明: 5 },
    entryCount: 7,
  },
};

function fail(message: string): void {
  console.error(message);
  process.exitCode = 1;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

function asText(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number") {
    return String(value);
  }
  return "";
}

function toMessage(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (value === null || value === undefined) {
    return "";
  }
  return typeof value;
}

function isLabel(value: unknown): value is Label {
  return typeof value === "string" && LABEL_SET.has(value);
}

function isClaimKind(value: unknown): value is ClaimKind {
  return typeof value === "string" && CLAIM_KIND_SET.has(value);
}

function emptyCounts(): LabelCounts {
  return { 行動一致: 0, 公約実現: 0, ズレ: 0, 不明: 0 };
}

function formatCounts(counts: LabelCounts): string {
  return `${toMessage(counts.行動一致)} 行動一致 / ${toMessage(counts.公約実現)} 公約実現 / ${toMessage(counts.ズレ)} ズレ / ${toMessage(counts.不明)} 不明`;
}

function addCount(counts: LabelCounts, label: Label): void {
  switch (label) {
    case "行動一致":
      counts.行動一致 += 1;
      return;
    case "公約実現":
      counts.公約実現 += 1;
      return;
    case "ズレ":
      counts.ズレ += 1;
      return;
    case "不明":
      counts.不明 += 1;
      return;
    default: {
      const unused: never = label;
      return unused;
    }
  }
}

function countsMatch(actual: LabelCounts, expected: LabelCounts): boolean {
  return actual.行動一致 === expected.行動一致 && actual.公約実現 === expected.公約実現 && actual.ズレ === expected.ズレ && actual.不明 === expected.不明;
}

function shouldWarnSoftOnlyProcess(entries: readonly QualityEntry[]): boolean {
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

function listYamlFiles(): string[] {
  return fs
    .readdirSync(DATA_DIR)
    .filter((name) => name.endsWith(".yaml") || name.endsWith(".yml"))
    .sort((left, right) => left.localeCompare(right));
}

function requireTextField(fileName: string, field: string, value: unknown): void {
  if (asText(value).trim() === "") {
    fail(`${fileName}: missing ${field}`);
  }
}

function readOptionalTagged(value: unknown, field: string, allowed: ReadonlySet<string>, fileName: string, entryId: string): void {
  if (value === undefined || value === null || value === "") {
    return;
  }
  if (typeof value !== "string" || !allowed.has(value)) {
    fail(`${fileName}: invalid ${field} at ${entryId}`);
  }
}

function readAgencyActor(entry: Record<string, unknown>, fileName: string, entryId: string): void {
  const value = entry.agency_actor;
  if (value === undefined || value === null || value === "") {
    return;
  }
  if (typeof value !== "string") {
    fail(`${fileName}: invalid agency_actor at ${entryId}`);
  }
}

function readOptionalEntryFields(entry: Record<string, unknown>, fileName: string, entryId: string): void {
  readOptionalTagged(entry.agency_capacity, "agency_capacity", AGENCY_CAPACITY_SET, fileName, entryId);
  readOptionalTagged(entry.voting_method, "voting_method", VOTING_METHOD_SET, fileName, entryId);
  readOptionalTagged(entry.horizon_status, "horizon_status", HORIZON_STATUS_SET, fileName, entryId);
  readAgencyActor(entry, fileName, entryId);
}

function readClaimKind(entry: Record<string, unknown>, fileName: string, entryId: string): ClaimKind | undefined {
  const value = entry.claim_kind;
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (!isClaimKind(value)) {
    fail(`${fileName}: invalid claim_kind at ${entryId}`);
    return undefined;
  }
  return value;
}

function validateEntry(fileName: string, entry: unknown, index: number, ids: Set<string>, counts: LabelCounts): QualityEntry | undefined {
  const slot = `entries[${toMessage(index)}]`;
  if (!isRecord(entry) || !isRecord(entry.claim) || !isRecord(entry.action)) {
    fail(`${fileName}: ${slot} needs claim and action`);
    return undefined;
  }
  const entryId = toMessage(entry.id);
  if (ids.has(entryId)) {
    fail(`${fileName}: duplicate entry id ${entryId}`);
  }
  ids.add(entryId);
  const labelValue = entry.label;
  if (!isLabel(labelValue)) {
    fail(`${fileName}: invalid label at ${entryId}`);
    return undefined;
  }
  addCount(counts, labelValue);
  if (!SOURCE_TYPE_SET.has(asText(entry.claim.source_type)) || !SOURCE_TYPE_SET.has(asText(entry.action.source_type))) {
    fail(`${fileName}: invalid source_type at ${entryId}`);
  }
  if (typeof entry.claim.summary !== "string" || entry.claim.summary.length > 60) {
    fail(`${fileName}: claim.summary must be a short paraphrase at ${entryId}`);
  }
  if (typeof entry.action.summary !== "string" || entry.action.summary.length > 60) {
    fail(`${fileName}: action.summary must be a short paraphrase at ${entryId}`);
  }
  const claimKind = readClaimKind(entry, fileName, entryId);
  readOptionalEntryFields(entry, fileName, entryId);
  return claimKind === undefined ? { label: labelValue } : { label: labelValue, claim_kind: claimKind };
}

function pinnedLedger(politicianId: string): PinnedLedger | undefined {
  switch (politicianId) {
    case "hc-7025005":
      return PINNED_LEDGERS["hc-7025005"];
    case "hr-230":
      return PINNED_LEDGERS["hr-230"];
    case "hr-258":
      return PINNED_LEDGERS["hr-258"];
    case "hr-135":
      return PINNED_LEDGERS["hr-135"];
    case "hc-7019010":
      return PINNED_LEDGERS["hc-7019010"];
    default:
      return undefined;
  }
}

function pinLedger(fileName: string, politicianId: string, counts: LabelCounts, entryCount: number): void {
  const expected = pinnedLedger(politicianId);
  if (expected === undefined) {
    return;
  }
  if (!countsMatch(counts, expected.counts)) {
    fail(`${fileName}: expected ${formatCounts(expected.counts)}, got ${formatCounts(counts)}`);
  }
  if (entryCount !== expected.entryCount) {
    fail(`${fileName}: expected ${toMessage(expected.entryCount)} entries`);
  }
}

function validateFile(fileName: string): string | undefined {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = yaml.load(fs.readFileSync(filePath, "utf8"));
  if (!isRecord(raw)) {
    fail(`${fileName}: root must be an object`);
    return undefined;
  }

  const expectedId = fileName.replace(/\.ya?ml$/, "");
  const politicianId = asText(raw.id);
  if (politicianId !== expectedId) {
    fail(`${fileName}: id must be ${expectedId}`);
  }

  requireTextField(fileName, "name", raw.name);
  requireTextField(fileName, "name_kana", raw.name_kana);
  requireTextField(fileName, "house", raw.house);
  requireTextField(fileName, "party", raw.party);
  requireTextField(fileName, "profile_url", raw.profile_url);
  requireTextField(fileName, "updated_at", raw.updated_at);

  if (!isRecord(raw.window) || asText(raw.window.from).trim() === "") {
    fail(`${fileName}: window.from is required`);
  }

  if (!Array.isArray(raw.entries)) {
    fail(`${fileName}: entries must be an array`);
    return politicianId === "" ? undefined : politicianId;
  }

  const counts = emptyCounts();
  const ids = new Set<string>();
  const qualityEntries: QualityEntry[] = [];

  for (const [index, entry] of raw.entries.entries()) {
    const parsed = validateEntry(fileName, entry, index, ids, counts);
    if (parsed !== undefined) {
      qualityEntries.push(parsed);
    }
  }

  pinLedger(fileName, politicianId, counts, raw.entries.length);

  if (shouldWarnSoftOnlyProcess(qualityEntries)) {
    console.error(`${fileName}: WARN 公約実現が0件で、行動一致がすべて soft です。柔らかい過程だけで台帳を埋めないでください。`);
  }

  console.log(`${fileName}: ${formatCounts(counts)}`);
  return politicianId === "" ? undefined : politicianId;
}

function validatePoliticianFiles(): void {
  const files = listYamlFiles();
  if (files.length === 0) {
    fail("No politician YAML files found.");
    return;
  }

  const seenIds = new Set<string>();
  for (const fileName of files) {
    const politicianId = validateFile(fileName);
    if (politicianId !== undefined) {
      seenIds.add(politicianId);
    }
  }

  for (const pinnedId of Object.keys(PINNED_LEDGERS)) {
    if (!seenIds.has(pinnedId)) {
      fail(`${pinnedId}.yaml must be present and listed.`);
    }
  }

  if (process.exitCode) {
    process.exit(process.exitCode);
  }

  console.log("YAML validation passed.");
}

const invoked = process.argv[1];
if (invoked !== undefined && import.meta.url === pathToFileURL(path.resolve(invoked)).href) {
  validatePoliticianFiles();
}
