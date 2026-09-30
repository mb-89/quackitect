// The index door in memory over a fake disk: each value the sidebar reads
// answers off the files the case seeds, as the Go modules answer it, and a
// fire sends one event to every watch.
// [[spec/tickets/the-sidebar-reads-v1]]

import { readYaml } from "../../.claude/skills/level0/lib/schema-yaml.js";
import { parsed } from "../../src/extension/lib/values.js";
import { LOCAL, TRACKED, valuesOf } from "../../src/extension/lib/widgets.js";

const SCHEMA = "spec/config/level0.schema.json";
const BLESS = ".se/.runtime/bless.json";
const LOG = ".se/.log/session.jsonl";
const BASE = /^spec\/views\/([^/]+)\.base$/;
const OWN = ["at", "level", "kind", "said"];

// A value as /v1 hands a projection: q.Ordered, marshalled field by field. [[spec/design_output/model#everything-on-disk-mirrors]]
export function orderedOf(value) {
  const one = {
    Keys: null,
    Fields: null,
    Items: null,
    Literal: "",
    Object: false,
    Array: false,
  };
  if (value === undefined) return one;
  if (Array.isArray(value)) return { ...one, Items: value.map(orderedOf), Array: true };
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    return {
      ...one,
      Keys: keys,
      Fields: keys.map((key) => orderedOf(value[key])),
      Object: true,
    };
  }
  return { ...one, Literal: JSON.stringify(value) };
}

// [[spec/tickets/the-sidebar-reads-v1]]
export function v1Over(files, given = {}) {
  const text = (path) => (files.exists(path) ? String(files.read(path)) : "");
  const file = (path) => (files.exists(path) ? parsed(text(path)) : undefined);
  const keys = () => valuesOf(file(TRACKED), file(LOCAL), file(SCHEMA) ?? {});
  const answers = {
    "config/keys": () =>
      [...keys()].map(([key, one]) => ({ key, value: one.value, layer: one.layer })),
    [`config/${SCHEMA}`]: () => orderedOf(file(SCHEMA)),
    [`config/${TRACKED}`]: () => orderedOf(file(TRACKED)),
    [`config/${LOCAL}`]: () => orderedOf(file(LOCAL)),
    "migration/config/sidebar": () => keys().get("migration.sidebar")?.value ?? "old",
    "bless/agent": () => file(BLESS)?.agent === true,
    "views/bases": () =>
      [...files.files.keys()]
        .map((path) => [path, BASE.exec(path)?.[1]])
        .filter(([, name]) => name)
        .sort((a, b) => a[1].localeCompare(b[1]))
        .map(([path, name]) => ({ name, said: readYaml(text(path)) })),
    "log/rows": () =>
      text(LOG)
        .split("\n")
        .filter((line) => line.trim())
        .map((line) => {
          const said = JSON.parse(line);
          const extra = Object.fromEntries(
            Object.entries(said).filter(([key]) => !OWN.includes(key)),
          );
          return {
            at: said.at,
            level: said.level,
            kind: said.kind,
            said: said.said,
            extra,
          };
        }),
  };
  const called = [];
  const watches = [];
  const values = async (name) => {
    if (name in given) return given[name];
    if (answers[name]) return answers[name]();
    if (name.startsWith("tickets/notes/"))
      return { head: text(name.slice("tickets/notes/".length)), body: "" };
    return undefined;
  };
  return {
    given,
    called,
    watches,
    values,
    calls: async (name, input) => {
      called.push({ name, input });
      return given.answers?.[name] ?? {};
    },
    watch: (names, fn) => {
      const one = { names, fn, stopped: false };
      watches.push(one);
      return { stop: () => (one.stopped = true) };
    },
    fire: async (name) => {
      for (const one of watches) {
        if (!one.stopped && one.names.includes(name))
          await one.fn(name, await values(name));
      }
    },
  };
}
