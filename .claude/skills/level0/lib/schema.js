// The schema reader and the note checker. A file in spec/schemas says what one
// kind of note holds, this reads it, and the checker weighs a note against it.
// The caller hands the tree in, so a test drives both over a fake one.
// [[spec/design_output/schema#the-reader-and-the-checker]]

import { matches } from "./paths.js";
import { bodyFaults, placeholderFaults } from "./schema-body.js";
import {
  empty,
  fault,
  LEFT,
  lineOf,
  linked,
  linkless,
  show,
  solved,
  typed,
  typeOf,
} from "./schema-fault.js";
import { kindOf, readNote } from "./schema-read.js";
import { refersFaults, slotFaults } from "./schema-route.js";
import { keyed, readYaml } from "./schema-yaml.js";

export {
  bodyFaults,
  CHECKED,
  chaptersWanted,
  itemsIn,
  left,
  minted,
  placeholderFaults,
} from "./schema-body.js";
export {
  empty,
  fault,
  LEFT,
  LINK,
  lineOf,
  linked,
  linkless,
  refOf,
  SEVERITY,
  show,
  solved,
  typed,
  typeOf,
} from "./schema-fault.js";
export { FENCE, kindOf, readNote, sectionAt } from "./schema-read.js";
export {
  canonicalOf,
  entriesIn,
  entryNamed,
  hashOf,
  names,
  OUTSIDE,
  processHash,
  refersFaults,
  slotFaults,
  wanted,
} from "./schema-route.js";

export { readYaml };

export const SCHEMAS = "spec/schemas";

export const END = ".schema.yaml";

export const MINT_TOOL = "mint_note";

// [[spec/design_output/schema#a-schema-names-its-chapters]]
export function isNoteSchema(said) {
  return Boolean(said?.kind) && Boolean(said?.body?.sections?.length);
}

// [[spec/design_output/schema#a-data-schema-holds-yaml]]
export function isDataSchema(said) {
  return Boolean(said?.kind) && Boolean(said?.data);
}

// [[spec/design_output/schema#the-schemas-read-once]]
export function schemasIn(tree) {
  return kindsIn(tree, isNoteSchema);
}

// [[spec/design_output/schema#a-data-schema-holds-yaml]]
export function dataSchemasIn(tree) {
  return kindsIn(tree, isDataSchema);
}

// [[spec/design_output/schema#one-home-for-a-shape]]
export function allSchemasIn(tree) {
  return kindsIn(tree, (said) => Boolean(said?.kind));
}

function kindsIn(tree, holds) {
  const out = new Map();
  for (const name of tree.names(SCHEMAS, END)) {
    const said = readYaml(tree.read(`${SCHEMAS}/${name}`));
    if (holds(said)) out.set(String(said.kind), said);
  }
  return out;
}

// [[spec/design_output/schema#a-folder-names-its-kind]]
export function governorOf(schemas, path) {
  const where = String(path ?? "")
    .split("\\")
    .join("/");
  for (const schema of schemas?.values?.() ?? []) {
    for (const glob of [schema.governs ?? []].flat()) {
      if (matches(glob, where)) return schema;
    }
  }
  return null;
}

// [[spec/design_output/schema#a-folder-names-its-kind]]
export function strangerFault(text, schema, where) {
  const held = String(schema?.kind ?? "");
  const kind = kindOf(text);
  if (!held || kind === held) return null;
  if (!kind) {
    return fault(
      "Kind",
      where,
      1,
      `${where} names no kind, and the ${held} schema governs this path.`,
    );
  }
  return fault(
    "Kind",
    where,
    1,
    `${where} reads as a ${kind}, and the ${held} schema governs this path.`,
  );
}

// [[spec/design_output/schema#a-finding-names-the-section]]
export function checkNote(text, schema, where, schemas) {
  const note = readNote(text);
  const kind = String(schema?.kind ?? "");
  const spec = schema?.frontmatter ?? {};
  if (!note.front.stands) {
    return [fault("Frontmatter", where, 1, `A ${kind} note opens with frontmatter.`)];
  }
  const held = heldIn(note.front, schema, kind, where, "frontmatter", schemas);
  return [
    ...mapFaults(note.front.said ?? {}, spec, held, ""),
    ...slotFaults(note.front.said ?? {}, where, note.front.lines),
    ...bodyFaults(note, schema?.body ?? {}, kind, where),
  ];
}

// [[spec/design_output/schema#a-data-schema-holds-yaml]]
export function checkData(text, schema, where, schemas) {
  const lines = new Map();
  const said = readYaml(text, lines);
  const spec = schema?.data ?? {};
  const kind = String(schema?.kind ?? "");
  const front = { said, lines: Object.fromEntries(lines) };
  return [
    ...mapFaults(said, spec, heldIn(front, schema, kind, where, "file", schemas), ""),
    ...slotFaults(said, where, front.lines),
  ];
}

// [[spec/design_output/schema#the-checker-walks-every-key]]
function heldIn(front, schema, kind, where, calls, schemas) {
  return {
    kind,
    where,
    lines: front.lines ?? {},
    root: front.said ?? {},
    calls,
    schema,
    schemas,
  };
}

// [[spec/design_output/schema#a-finding-names-the-section]]
function waitsForFill(said, rule) {
  const from = rule?.["x-filled-by"];
  return Boolean(from) && Object.hasOwn(said ?? {}, from) && empty(said[from]);
}

// [[spec/design_output/schema#the-checker-walks-every-key]]
function mapFaults(said, spec, held, path) {
  const out = [];
  const props = spec.properties ?? {};

  for (const key of spec.required ?? []) {
    if (!empty(said?.[key]) || waitsForFill(said, props[key])) continue;
    out.push(
      fault(
        key,
        held.where,
        lineOf(held, path),
        path
          ? `${path} names ${key}, and a ${held.kind} names it on every entry.`
          : `A ${held.kind} names ${key} in its ${held.calls}.`,
      ),
    );
  }

  for (const [key, value] of Object.entries(said ?? {})) {
    const at = keyed(path, key);
    const rule = props[key];
    const line = lineOf(held, at);
    if (!rule) {
      if (spec.additionalProperties === false) {
        out.push(
          fault(
            key,
            held.where,
            line,
            path
              ? `The ${held.kind} schema names no ${key} under ${path}.`
              : `The ${held.kind} schema names no ${key}.`,
          ),
        );
      }
      continue;
    }
    out.push(...fieldFaults(key, value, solved(rule, held), held, at, line));
  }
  return out;
}

function fieldFaults(key, value, rule, held, at, line) {
  const out = [];
  const kind = held.kind;
  const where = held.where;
  const said = rule["x-link"] ? linkless(value) : value;

  if (rule["x-link"] && !linked(value)) {
    out.push(
      fault(key, where, line, `${key} names a link, and this reads ${show(value)}.`),
    );
  }
  if (rule.const !== undefined && said !== rule.const) {
    out.push(
      fault(
        key,
        where,
        line,
        `${key} reads ${show(said)}, and a ${kind} note names ${rule.const}.`,
      ),
    );
  }
  if (Array.isArray(rule.enum) && !rule.enum.includes(said)) {
    out.push(
      fault(
        key,
        where,
        line,
        `${key} reads ${show(said)}, and the schema allows ${rule.enum.join(", ")}.`,
      ),
    );
  }
  if (rule.type && !typed(value, rule.type)) {
    out.push(
      fault(
        key,
        where,
        line,
        `${key} takes ${[rule.type].flat().join(" or ")}, and this reads ${typeOf(value)}.`,
      ),
    );
  }
  out.push(...refersFaults(key, value, rule, held, at, line));
  out.push(...deeperFaults(value, rule, held, at));
  return out;
}

// [[spec/design_output/schema#the-checker-walks-every-key]]
function deeperFaults(value, rule, held, at) {
  const out = [];
  const items = solved(rule.items, held);
  if (items?.properties && Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      if (!value[i] || typeof value[i] !== "object") continue;
      out.push(...mapFaults(value[i], items, held, `${at}[${i}]`));
    }
  }
  if (rule.properties && value && typeof value === "object" && !Array.isArray(value)) {
    out.push(...mapFaults(value, rule, held, at));
  }
  return out;
}

// [[spec/design_output/schema#the-sweep-over-the-tree]]
export function schemaFaults(tree) {
  const schemas = schemasIn(tree);
  const data = dataSchemasIn(tree);
  const every = allSchemasIn(tree);
  const out = [];
  if (!schemas.size) return out;

  for (const path of tree.paths()) {
    if (!path.endsWith(".md")) {
      const governor = governorOf(data, path);
      if (governor) out.push(...checkData(tree.read(path), governor, path, every));
      else if (governorOf(schemas, path)) out.push(folderFault(path, governorOf(schemas, path)));
      continue;
    }
    const text = tree.read(path);
    const kind = kindOf(text);
    const governor = governorOf(schemas, path);

    if (governor && governor.kind !== kind) {
      out.push(strangerFault(text, governor, path));
      continue;
    }
    if (!kind) continue;

    const schema = schemas.get(kind);
    if (!schema) {
      out.push(
        fault(
          "Kind",
          path,
          1,
          `${kind} names no schema, and ${SCHEMAS} holds ${[...schemas.keys()].sort().join(", ")}.`,
        ),
      );
      continue;
    }
    out.push(...checkNote(text, schema, path, every));
    out.push(...placeholderFaults(text, schema, path));
  }
  return out;
}

// A governed folder holds its own kind alone, so a page or a picture there stands at warning until the owner moves it. [[spec/tickets/each-folder-holds-its-kind]]
export function folderFault(where, schema) {
  const kind = String(schema?.kind ?? "");
  return {
    ...fault(
      "Folder",
      where,
      1,
      `${where} stands in a folder the ${kind} schema governs, which holds ${kind} notes alone. Move it off the governed folder.`,
    ),
    severity: LEFT,
  };
}

// [[spec/design_output/schema#the-door-refuses-a-departure]]
export function schemasFrom(files) {
  return kindsFrom(files, isNoteSchema);
}

// [[spec/design_output/schema#a-data-schema-holds-yaml]]
export function dataSchemasFrom(files) {
  return kindsFrom(files, isDataSchema);
}

// [[spec/design_output/schema#one-home-for-a-shape]]
export function allSchemasFrom(files) {
  return kindsFrom(files, (said) => Boolean(said?.kind));
}

function kindsFrom(files, holds) {
  const out = new Map();
  for (const one of files ?? []) {
    const said = readYaml(one.text);
    if (holds(said)) out.set(String(said.kind), said);
  }
  return out;
}

export function refusedNote(where, kind, found) {
  return [
    `The ${kind} schema refuses this write to ${where}.`,
    "",
    ...found.map(
      (one) => `  ${where}:${one.line}:${one.column}  ${one.rule}\n    ${one.message}`,
    ),
    "",
    `Run ./RUNME.sh mint ${kind} <path> for the shape it names, or park a draft as _name.md.`,
  ].join("\n");
}

// [[spec/design_output/schema#a-folder-names-its-kind]]
export function refusedKind(where, schema, found) {
  const kind = String(schema?.kind ?? "");
  return [
    `${SCHEMAS}/${kind}${END} governs ${where}, and it refuses this write.`,
    "",
    `  ${where}:${found.line}:${found.column}  ${found.rule}`,
    `    ${found.message}`,
    "",
    `Call ${MINT_TOOL} with kind ${kind}, this path and the fields, and it writes the note.`,
    "A draft named _name.md stands outside every rule while a kind settles.",
  ].join("\n");
}
