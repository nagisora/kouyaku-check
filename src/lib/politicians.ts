import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { compareFileNames } from "./file-names";
import { entrySlot, formatDietSession, isActionKind, isLabel, isSourceType } from "./yaml-values";
import type { Action, Claim, Entry, Politician, PoliticianMeta } from "./types";

const DATA_DIR = path.join(process.cwd(), "data", "politicians");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown, field: string): string {
  const coerced = coerceString(value);
  if (coerced === null || coerced.trim() === "") {
    throw new Error(`Expected non-empty string for ${field}`);
  }
  return coerced;
}

function coerceString(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number") {
    return String(value);
  }
  return null;
}

function asOptionalString(value: unknown): string | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const coerced = coerceString(value);
  if (coerced === null) {
    throw new Error("Expected string or empty value");
  }
  return coerced;
}

function asSourceType(value: unknown, field: string) {
  if (!isSourceType(value)) {
    throw new Error(`Invalid source_type for ${field}: ${String(value)}`);
  }
  return value;
}

function parseMeta(raw: unknown): PoliticianMeta | undefined {
  if (!isRecord(raw)) {
    return undefined;
  }
  return {
    wikidata: typeof raw.wikidata === "string" ? raw.wikidata : undefined,
    elected_on: typeof raw.elected_on === "string" ? raw.elected_on : undefined,
    in_office_from: typeof raw.in_office_from === "string" ? raw.in_office_from : undefined,
    district: typeof raw.district === "string" ? raw.district : undefined,
    window_note: typeof raw.window_note === "string" ? raw.window_note : undefined,
  };
}

function parseClaim(raw: Record<string, unknown>, slot: string): Claim {
  return {
    summary: asString(raw.summary, `${slot}.claim.summary`),
    date: asOptionalString(raw.date),
    source_url: typeof raw.source_url === "string" ? raw.source_url : "",
    source_type: asSourceType(raw.source_type, `${slot}.claim`),
  };
}

function parseActionKind(value: unknown, field: string) {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (!isActionKind(value)) {
    throw new Error(`Invalid action_kind for ${field}`);
  }
  return value;
}

function parseAction(raw: Record<string, unknown>, slot: string): Action {
  const actionKind = parseActionKind(raw.action_kind, `${slot}.action`);
  return {
    summary: asString(raw.summary, `${slot}.action.summary`),
    date: asOptionalString(raw.date),
    source_url: typeof raw.source_url === "string" ? raw.source_url : "",
    source_type: asSourceType(raw.source_type, `${slot}.action`),
    diet_session: formatDietSession(raw.diet_session),
    ...(actionKind === undefined ? {} : { action_kind: actionKind }),
  };
}

function parseEntry(raw: unknown, index: number, filePath: string): Entry {
  const slot = entrySlot(index);
  if (!isRecord(raw)) {
    throw new Error(`${slot} must be an object in ${filePath}`);
  }
  const claim = raw.claim;
  const action = raw.action;
  if (!isRecord(claim) || !isRecord(action)) {
    throw new Error(`${slot} needs claim and action in ${filePath}`);
  }
  const label = raw.label;
  if (!isLabel(label)) {
    throw new Error(`Invalid label in ${slot} of ${filePath}`);
  }

  return {
    id: asString(raw.id, `${slot}.id`),
    topic: asString(raw.topic, `${slot}.topic`),
    claim: parseClaim(claim, slot),
    action: parseAction(action, slot),
    label,
    notes: typeof raw.notes === "string" ? raw.notes : "",
  };
}

function parsePolitician(raw: unknown, filePath: string): Politician {
  if (!isRecord(raw)) {
    throw new Error(`YAML root must be an object: ${filePath}`);
  }

  const windowRaw = raw.window;
  if (!isRecord(windowRaw)) {
    throw new Error(`Missing window in ${filePath}`);
  }

  const entriesRaw = raw.entries;
  if (!Array.isArray(entriesRaw)) {
    throw new Error(`entries must be an array in ${filePath}`);
  }

  return {
    id: asString(raw.id, "id"),
    slug: typeof raw.slug === "string" ? raw.slug : undefined,
    name: asString(raw.name, "name"),
    name_kana: asString(raw.name_kana, "name_kana"),
    house: asString(raw.house, "house"),
    party: asString(raw.party, "party"),
    profile_url: asString(raw.profile_url, "profile_url"),
    updated_at: asString(raw.updated_at, "updated_at"),
    window: {
      from: asString(windowRaw.from, "window.from"),
      to: asOptionalString(windowRaw.to),
    },
    meta: parseMeta(raw.meta),
    entries: entriesRaw.map((entry, index) => parseEntry(entry, index, filePath)),
  };
}

export function loadPoliticians(): Politician[] {
  if (!fs.existsSync(DATA_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(DATA_DIR)
    .filter((name: string) => name.endsWith(".yaml") || name.endsWith(".yml"))
    .sort(compareFileNames);

  return files.map((fileName: string) => {
    const filePath = path.join(DATA_DIR, fileName);
    const raw = yaml.load(fs.readFileSync(filePath, "utf8"));
    const politician = parsePolitician(raw, filePath);
    const expectedId = fileName.replace(/\.ya?ml$/, "");
    if (politician.id !== expectedId) {
      throw new Error(`${fileName}: id "${politician.id}" must match filename "${expectedId}"`);
    }
    return politician;
  });
}

export function getPoliticianByRoute(routeId: string): Politician | undefined {
  return loadPoliticians().find((politician) => politician.id === routeId || politician.slug === routeId);
}

export function politicianRoutes(politician: Politician): string[] {
  return politician.slug ? [politician.id, politician.slug] : [politician.id];
}
