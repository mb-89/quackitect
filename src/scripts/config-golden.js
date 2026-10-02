// The JavaScript config readers' sections of the readers golden file: each
// reader over one fixture, the default file as it stood, a local file and a
// few variables. node test/level0/config-golden.js writes them again.
// [[spec/tickets/cfg-topic-holds-one-resolver]]

import { join } from "node:path";
import {
  configOf,
  flatten,
  LOCAL,
  TRACKED,
} from "../../.claude/skills/level0/lib/config.js";
import { asksText, whereFrom } from "../bridge/config.js";
import widgets from "../extension/lib/widgets.js";

const ROOT = join(import.meta.dirname, "..", "..");
export const TESTDATA = join(ROOT, "src", "quack", "testdata");
export const GOLDEN = join(TESTDATA, "readers.golden.json");
const SECTION = "readers";
const SCHEMA_AT = "spec/config/level0.schema.json";

// The names each JavaScript reader stands under in the golden file. [[spec/tickets/cfg-topic-holds-one-resolver]]
export const READERS = {
  configOf: ".claude/skills/level0/lib/config.js configOf",
  whereFrom: "src/bridge/config.js whereFrom",
  asksText: "src/bridge/config.js asksText",
  valuesOf: "src/extension/lib/widgets.js valuesOf",
};

// The fixture's files by the name each stands under in the testdata folder. [[spec/tickets/cfg-topic-holds-one-resolver]]
export const FIXTURE = {
  tracked: "readers.tracked.json",
  local: "readers.local.json",
  schema: "readers.schema.json",
  env: "readers.env.json",
};

function fixture(files) {
  const read = (name) => String(files.read(join(TESTDATA, name)));
  return {
    tracked: read(FIXTURE.tracked),
    local: read(FIXTURE.local),
    schema: read(FIXTURE.schema),
    env: JSON.parse(read(FIXTURE.env)),
  };
}

// A disk holding the fixture's files in memory, where every reader looks for them. [[spec/tickets/cfg-topic-holds-one-resolver]]
function heldIn(said) {
  const held = new Map([
    [TRACKED, said.tracked],
    [LOCAL, said.local],
    [SCHEMA_AT, said.schema],
    [join("/method", TRACKED), said.tracked],
    [join("/work", LOCAL), said.local],
  ]);
  return {
    read(at) {
      if (!held.has(at)) throw new Error(`${at} stands nowhere`);
      return held.get(at);
    },
  };
}

// Every reader's answer for every key the fixture's two files hold, the value beside the layer it names. [[spec/tickets/cfg-topic-holds-one-resolver]]
export async function readersOf(files) {
  const said = fixture(files);
  const tracked = JSON.parse(said.tracked);
  const local = JSON.parse(said.local);
  const keys = [
    ...new Set([...flatten(tracked).keys(), ...flatten(local).keys()]),
  ].sort();
  const held = heldIn(said);
  const resolver = configOf({
    read: async (path) => held.read(path),
    readEnv: async (names) =>
      Object.fromEntries(names.map((name) => [name, said.env[name] ?? ""])),
  });
  const box = { disk: held, method: "/method", work: "/work", env: said.env };
  const values = widgets.valuesOf(tracked, local);
  const all = new Map((await resolver.all()).map((one) => [one.key, one]));
  const out = Object.fromEntries(Object.values(READERS).map((name) => [name, {}]));
  for (const key of keys) {
    const one = all.get(key);
    if (one) out[READERS.configOf][key] = { value: one.value, layer: one.layer };
    const where = whereFrom(box, key);
    if (where.value !== undefined) out[READERS.whereFrom][key] = where;
    const text = asksText(box, key);
    if (text !== undefined) out[READERS.asksText][key] = { value: text, layer: "" };
    const shown = values.get(key);
    if (shown) out[READERS.valuesOf][key] = { value: shown.value, layer: shown.layer };
  }
  return out;
}

// The golden file as it stands, or an empty one. [[spec/tickets/cfg-topic-holds-one-resolver]]
export function goldenOf(files) {
  try {
    return JSON.parse(String(files.read(GOLDEN)));
  } catch {
    return { [SECTION]: {} };
  }
}

// Keys in name order, as Go writes a map, and a reader's row as value then layer, as Go writes the struct. [[spec/tickets/cfg-topic-holds-one-resolver]]
function sorted(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [
        key,
        key === SECTION ? sortedSection(value[key]) : sorted(value[key]),
      ]),
  );
}

function sortedSection(section) {
  const out = {};
  for (const reader of Object.keys(section ?? {}).sort()) {
    out[reader] = {};
    for (const key of Object.keys(section[reader]).sort()) {
      const row = section[reader][key];
      out[reader][key] = { value: row.value, layer: row.layer };
    }
  }
  return out;
}

// Writes the JavaScript readers' sections into the golden file, and keeps every other section. [[spec/tickets/cfg-topic-holds-one-resolver]]
export async function writeGolden(files) {
  const golden = goldenOf(files);
  golden[SECTION] = { ...(golden[SECTION] ?? {}), ...(await readersOf(files)) };
  files.write(GOLDEN, `${JSON.stringify(sorted(golden), null, 2)}\n`);
}
