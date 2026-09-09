import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const DATA_DIR = path.join(process.cwd(), "data", "politicians");
const LABELS = new Set(["一致", "ズレ", "不明"]);
const SOURCE_TYPES = new Set(["bulletin", "party", "minutes", "vote", "none"]);

function fail(message) {
  console.error(message);
  process.exitCode = 1;
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

function asText(value) {
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

const files = fs
  .readdirSync(DATA_DIR)
  .filter((name) => name.endsWith(".yaml") || name.endsWith(".yml"))
  .sort();

if (files.length === 0) {
  fail("No politician YAML files found.");
}

let listedAnno = false;

for (const fileName of files) {
  const filePath = path.join(DATA_DIR, fileName);
  const raw = yaml.load(fs.readFileSync(filePath, "utf8"));
  if (!isRecord(raw)) {
    fail(`${fileName}: root must be an object`);
    continue;
  }

  const expectedId = fileName.replace(/\.ya?ml$/, "");
  if (raw.id !== expectedId) {
    fail(`${fileName}: id must be ${expectedId}`);
  }

  for (const key of ["name", "name_kana", "house", "party", "profile_url", "updated_at"]) {
    if (asText(raw[key]).trim() === "") {
      fail(`${fileName}: missing ${key}`);
    }
  }

  if (!isRecord(raw.window) || asText(raw.window.from).trim() === "") {
    fail(`${fileName}: window.from is required`);
  }

  if (!Array.isArray(raw.entries)) {
    fail(`${fileName}: entries must be an array`);
    continue;
  }

  const counts = { 一致: 0, ズレ: 0, 不明: 0 };
  const ids = new Set();

  for (const [index, entry] of raw.entries.entries()) {
    if (!isRecord(entry) || !isRecord(entry.claim) || !isRecord(entry.action)) {
      fail(`${fileName}: entries[${index}] needs claim and action`);
      continue;
    }
    if (ids.has(entry.id)) {
      fail(`${fileName}: duplicate entry id ${entry.id}`);
    }
    ids.add(entry.id);
    if (!LABELS.has(entry.label)) {
      fail(`${fileName}: invalid label at ${entry.id}`);
    } else {
      counts[entry.label] += 1;
    }
    if (!SOURCE_TYPES.has(entry.claim.source_type) || !SOURCE_TYPES.has(entry.action.source_type)) {
      fail(`${fileName}: invalid source_type at ${entry.id}`);
    }
    if (typeof entry.claim.summary !== "string" || entry.claim.summary.length > 60) {
      fail(`${fileName}: claim.summary must be a short paraphrase at ${entry.id}`);
    }
    if (typeof entry.action.summary !== "string" || entry.action.summary.length > 60) {
      fail(`${fileName}: action.summary must be a short paraphrase at ${entry.id}`);
    }
  }

  if (raw.id === "hc-7025005") {
    listedAnno = true;
    if (counts.一致 !== 9 || counts.ズレ !== 0 || counts.不明 !== 3) {
      fail(`${fileName}: expected 9 一致 / 0 ズレ / 3 不明, got ${counts.一致} / ${counts.ズレ} / ${counts.不明}`);
    }
    if (raw.entries.length !== 12) {
      fail(`${fileName}: expected 12 entries`);
    }
  }

  console.log(`${fileName}: ${counts.一致} 一致 / ${counts.ズレ} ズレ / ${counts.不明} 不明`);
}

if (!listedAnno) {
  fail("hc-7025005.yaml must be present and listed.");
}

if (process.exitCode) {
  process.exit(process.exitCode);
}

console.log("YAML validation passed.");
