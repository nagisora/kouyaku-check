import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { compareFileNames } from "./file-names";
import { formatDietSession, isLabel, isSourceType } from "./yaml-values";
import type { Politician } from "./types";

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

  const metaRaw = raw.meta;
  const meta = isRecord(metaRaw)
    ? {
        wikidata: typeof metaRaw.wikidata === "string" ? metaRaw.wikidata : undefined,
        elected_on: typeof metaRaw.elected_on === "string" ? metaRaw.elected_on : undefined,
        in_office_from: typeof metaRaw.in_office_from === "string" ? metaRaw.in_office_from : undefined,
        window_note: typeof metaRaw.window_note === "string" ? metaRaw.window_note : undefined,
      }
    : undefined;

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
    meta,
    entries: entriesRaw.map((entry, index) => {
      if (!isRecord(entry)) {
        throw new Error(`entries[${index}] must be an object in ${filePath}`);
      }
      const claim = entry.claim;
      const action = entry.action;
      if (!isRecord(claim) || !isRecord(action)) {
        throw new Error(`entries[${index}] needs claim and action in ${filePath}`);
      }
      const label = entry.label;
      if (!isLabel(label)) {
        throw new Error(`Invalid label in entries[${index}] of ${filePath}`);
      }

      return {
        id: asString(entry.id, `entries[${index}].id`),
        topic: asString(entry.topic, `entries[${index}].topic`),
        claim: {
          summary: asString(claim.summary, `entries[${index}].claim.summary`),
          date: asOptionalString(claim.date),
          source_url: typeof claim.source_url === "string" ? claim.source_url : "",
          source_type: asSourceType(claim.source_type, `entries[${index}].claim`),
        },
        action: {
          summary: asString(action.summary, `entries[${index}].action.summary`),
          date: asOptionalString(action.date),
          source_url: typeof action.source_url === "string" ? action.source_url : "",
          source_type: asSourceType(action.source_type, `entries[${index}].action`),
          diet_session: formatDietSession(action.diet_session),
        },
        label,
        notes: typeof entry.notes === "string" ? entry.notes : "",
      };
    }),
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
