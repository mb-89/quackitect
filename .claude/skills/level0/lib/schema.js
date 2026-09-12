// The schema reader and the note checker. A file in spec/schemas says what one
// kind of note holds, this reads it, and the checker weighs a note against it.
// The caller hands the tree in, so a test drives both over a fake one.
// [[spec/design_output/schema#the-reader-and-the-checker]]

import { isDraft, matches } from "./paths.js";

export const SCHEMAS = "spec/schemas";
export const END = ".schema.yaml";
export const SEVERITY = "error";
export const LEFT = "warning";
export const MINT_TOOL = "mint_note";

const HEADING = /^(#{1,6})\s+(.+?)\s*$/;
const FENCE = /^\s*(```|~~~)/;
const ITEM = /^\s*(?:\d+[.)]|[-*+])\s+\S/;
const LINK = /^\[\[(.+)\]\]$/;
const NUMBERED = /^(\d+)[.)]?\s/;
const PAIR = /^([^:\s][^:]*):\s*(.*)$/;
const COMMENT = /<!--[\s\S]*?-->/g;

// [[spec/design_output/schema#the-yaml-a-schema-reads]]
export function readYaml(text) {
  const rows = [];
  for (const raw of String(text ?? "").split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim() || /^\s*#/.test(line)) continue;
    rows.push({ indent: line.search(/\S/), said: line.trim() });
  }
  const cursor = { at: 0 };
  return rows.length ? block(rows, cursor, rows[0].indent) : {};
}

function block(rows, cursor, indent) {
  return rows[cursor.at].said.startsWith("- ")
    ? listAt(rows, cursor, indent)
    : mapAt(rows, cursor, indent);
}

function mapAt(rows, cursor, indent) {
  const out = {};
  while (cursor.at < rows.length) {
    const one = rows[cursor.at];
    if (one.indent !== indent) break;
    const pair = PAIR.exec(one.said);
    if (!pair) break;
    cursor.at += 1;
    out[pair[1].trim()] = pair[2].trim()
      ? scalar(pair[2].trim())
      : under(rows, cursor, one.indent);
  }
  return out;
}

function listAt(rows, cursor, indent) {
  const out = [];
  while (cursor.at < rows.length) {
    const one = rows[cursor.at];
    if (one.indent !== indent || !one.said.startsWith("- ")) break;
    cursor.at += 1;

    const rest = one.said.slice(2).trim();
    const pair = PAIR.exec(rest);
    if (!pair) {
      out.push(scalar(rest));
      continue;
    }

    const item = {};
    item[pair[1].trim()] = pair[2].trim()
      ? scalar(pair[2].trim())
      : under(rows, cursor, one.indent + 2);
    while (cursor.at < rows.length && rows[cursor.at].indent > one.indent) {
      const next = rows[cursor.at];
      const more = PAIR.exec(next.said);
      if (!more) break;
      cursor.at += 1;
      item[more[1].trim()] = more[2].trim()
        ? scalar(more[2].trim())
        : under(rows, cursor, next.indent);
    }
    out.push(item);
  }
  return out;
}

function under(rows, cursor, indent) {
  const next = rows[cursor.at];
  if (!next) return null;
  if (next.indent > indent) return block(rows, cursor, next.indent);
  if (next.indent === indent && next.said.startsWith("- ")) {
    return listAt(rows, cursor, indent);
  }
  return null;
}

function scalar(said) {
  const flat = unquote(said);
  if (LINK.test(flat)) return flat;
  if (flat.startsWith("[") && flat.endsWith("]")) {
    return flat
      .slice(1, -1)
      .split(",")
      .map((one) => unquote(one.trim()))
      .filter((one) => one !== "");
  }
  if (flat === "true") return true;
  if (flat === "false") return false;
  if (/^-?\d+$/.test(flat)) return Number(flat);
  return flat;
}

function unquote(said) {
  const flat = String(said).trim();
  const quoted =
    (flat.startsWith('"') && flat.endsWith('"')) ||
    (flat.startsWith("'") && flat.endsWith("'"));
  return quoted && flat.length > 1 ? flat.slice(1, -1) : flat;
}

// [[spec/design_output/schema#what-a-note-reads-as]]
export function readNote(text) {
  const rows = String(text ?? "").split(/\r?\n/);
  return { front: frontOf(rows), sections: sectionsOf(rows) };
}

function frontOf(rows) {
  if (rows[0]?.trim() !== "---") return { stands: false, said: {}, lines: {} };
  const close = rows.findIndex((line, i) => i > 0 && line.trim() === "---");
  if (close < 0) return { stands: false, said: {}, lines: {} };

  const held = rows.slice(1, close);
  const lines = {};
  for (let i = 0; i < held.length; i++) {
    const pair = PAIR.exec(held[i]);
    if (pair && held[i].search(/\S/) === 0) lines[pair[1].trim()] = i + 2;
  }
  return { stands: true, said: readYaml(held.join("\n")), lines };
}

function sectionsOf(rows) {
  const out = [];
  let fenced = false;
  for (let i = 0; i < rows.length; i++) {
    if (FENCE.test(rows[i])) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const found = HEADING.exec(rows[i]);
    if (found) {
      out.push({ header: found[2], level: found[1].length, line: i + 1, own: [] });
      continue;
    }
    if (out.length) out[out.length - 1].own.push(rows[i]);
  }
  return out;
}

// [[spec/design_output/schema#what-a-note-reads-as]]
export function kindOf(text) {
  const said = frontOf(String(text ?? "").split(/\r?\n/)).said.kind;
  return said ? String(linkless(said)) : "";
}

// [[spec/design_output/schema#the-schemas-read-once]]
export function schemasIn(tree) {
  const out = new Map();
  for (const name of tree.names(SCHEMAS, END)) {
    const said = readYaml(tree.read(`${SCHEMAS}/${name}`));
    if (describesANote(said)) out.set(String(said.kind), said);
  }
  return out;
}

// [[spec/design_output/schema#a-folder-names-its-kind]]
export function describesANote(said) {
  return Boolean(said?.kind) && Boolean(said?.body?.sections?.length);
}

// [[spec/design_output/schema#a-folder-names-its-kind]]
export function governorOf(schemas, path) {
  const where = String(path ?? "").split("\\").join("/");
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
export function checkNote(text, schema, where) {
  const note = readNote(text);
  const kind = String(schema?.kind ?? "");
  return [
    ...frontFaults(note, schema?.frontmatter ?? {}, kind, where),
    ...bodyFaults(note, schema?.body ?? {}, kind, where),
  ];
}

function frontFaults(note, spec, kind, where) {
  if (!note.front.stands) {
    return [fault("Frontmatter", where, 1, `A ${kind} note opens with frontmatter.`)];
  }

  const out = [];
  const said = note.front.said ?? {};
  const props = spec.properties ?? {};

  for (const key of spec.required ?? []) {
    if (!empty(said[key])) continue;
    out.push(fault(key, where, 1, `A ${kind} note names ${key} in its frontmatter.`));
  }

  for (const [key, value] of Object.entries(said)) {
    const rule = props[key];
    const line = note.front.lines[key] ?? 1;
    if (!rule) {
      if (spec.additionalProperties === false) {
        out.push(fault(key, where, line, `The ${kind} schema names no ${key}.`));
      }
      continue;
    }
    out.push(...fieldFaults(key, value, rule, kind, where, line));
  }
  return out;
}

function fieldFaults(key, value, rule, kind, where, line) {
  const out = [];
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
  return out;
}

function bodyFaults(note, spec, kind, where) {
  const level = spec.headingLevel ?? 1;
  const wanted = spec.sections ?? [];
  const standing = note.sections.filter((one) => one.level === level);
  const named = new Map(wanted.map((one) => [one.header, one]));
  const out = [];

  for (const one of wanted) {
    if (!one.required || standing.some((held) => held.header === one.header)) continue;
    out.push(
      fault(one.header, where, 1, `A ${kind} note carries a ${one.header} chapter.`),
    );
  }

  for (const held of standing) {
    if (named.has(held.header)) continue;
    if (spec.extraSections === false) {
      out.push(
        fault(
          held.header,
          where,
          held.line,
          `The ${kind} schema names no ${held.header} chapter.`,
        ),
      );
    }
  }

  if (spec.order === "strict") out.push(...orderFaults(standing, wanted, kind, where));
  out.push(...lastFaults(standing, wanted, where));

  for (const held of standing) {
    const rule = named.get(held.header);
    if (rule) out.push(...sectionFaults(held, rule, note, where));
  }
  return out;
}

function orderFaults(standing, wanted, kind, where) {
  const order = wanted.map((one) => one.header);
  const held = standing.filter((one) => order.includes(one.header));
  const out = [];
  for (let i = 1; i < held.length; i++) {
    if (order.indexOf(held[i].header) > order.indexOf(held[i - 1].header)) continue;
    out.push(
      fault(
        held[i].header,
        where,
        held[i].line,
        `${held[i].header} stands after ${held[i - 1].header}, and a ${kind} note puts it first.`,
      ),
    );
  }
  return out;
}

function lastFaults(standing, wanted, where) {
  const out = [];
  for (const one of wanted) {
    if (one.position !== "last") continue;
    const at = standing.findIndex((held) => held.header === one.header);
    if (at < 0 || at === standing.length - 1) continue;
    out.push(
      fault(
        one.header,
        where,
        standing[at].line,
        `${one.header} closes this note, and ${standing[at + 1].header} stands after it.`,
      ),
    );
  }
  return out;
}

function sectionFaults(held, rule, note, where) {
  const out = [];
  const items = itemsIn(held.own);

  if (rule.list && !items.length) {
    out.push(
      fault(held.header, where, held.line, `${held.header} holds a list of items.`),
    );
  }
  if (rule.ordered && items.some((one) => !NUMBERED.test(one.said))) {
    out.push(
      fault(held.header, where, held.line, `${held.header} numbers every item.`),
    );
  }
  if (rule.maxItems && items.length > rule.maxItems) {
    out.push(
      fault(
        held.header,
        where,
        held.line + items[rule.maxItems].line,
        `A note holds ${rule.maxItems} items.`,
      ),
    );
  }
  if (rule.subsections) {
    out.push(...underFaults(held, rule, note, where));
  }
  return out;
}

function underFaults(held, rule, note, where) {
  const spec = rule.subsections ?? {};
  const level = spec.headingLevel ?? held.level + 1;
  const at = note.sections.indexOf(held);
  const out = [];
  const numbers = [];

  for (const one of note.sections.slice(at + 1)) {
    if (one.level <= held.level) break;
    if (one.level !== level) continue;
    const found = NUMBERED.exec(one.header);
    if (spec.numbered && !found) {
      out.push(
        fault(
          held.header,
          where,
          one.line,
          `A chapter under ${held.header} opens with the number of the item it argues.`,
        ),
      );
      continue;
    }
    if (found)
      numbers.push({ said: Number(found[1]), line: one.line, header: one.header });
  }

  if (spec.order !== "strict") return out;
  for (let i = 1; i < numbers.length; i++) {
    if (numbers[i].said > numbers[i - 1].said) continue;
    out.push(
      fault(
        held.header,
        where,
        numbers[i].line,
        `${numbers[i].header} stands after ${numbers[i - 1].header}, and the numbers run up.`,
      ),
    );
  }
  return out;
}

// [[spec/design_output/schema#a-comment-counts-toward-nothing]]
export function itemsIn(rows) {
  const out = [];
  let fenced = false;
  for (let i = 0; i < rows.length; i++) {
    if (FENCE.test(rows[i])) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const said = String(rows[i]).replace(COMMENT, "").trim();
    if (ITEM.test(said)) out.push({ said, line: i + 1 });
  }
  return out;
}

// [[spec/design_output/schema#a-placeholder-stands-at-warning]]
export function placeholderFaults(text, schema, where) {
  const rows = String(text ?? "").split(/\r?\n/);
  const note = readNote(text);
  const props = schema?.frontmatter?.properties ?? {};
  const out = [];

  for (const [key, line] of Object.entries(note.front.lines ?? {})) {
    const rule = props[key];
    if (!rule || rule.const !== undefined || Array.isArray(rule.enum)) continue;
    if (String(rows[line - 1] ?? "").trim() !== `${key}: ${minted(rule)}`) continue;
    out.push(left(where, line, key));
  }

  const named = new Map(
    (schema?.body?.sections ?? [])
      .filter((one) => one.description)
      .map((one) => [one.header, `<!-- ${one.description} -->`]),
  );
  for (const held of note.sections) {
    const said = named.get(held.header);
    if (!said) continue;
    const at = held.own.findIndex((line) => String(line).trim() === said);
    if (at < 0) continue;
    out.push(left(where, held.line + at + 1, held.header));
  }
  return out;
}

function left(file, line, what) {
  return {
    file,
    rule: "Schema.Placeholder",
    line,
    column: 1,
    message: `${what} still carries the placeholder mint writes. Say what stands there.`,
    severity: LEFT,
  };
}

// [[spec/design_output/schema#the-sweep-over-the-tree]]
export function schemaFaults(tree) {
  const schemas = schemasIn(tree);
  const out = [];
  if (!schemas.size) return out;

  for (const path of tree.paths()) {
    if (!path.endsWith(".md")) continue;
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
    out.push(...checkNote(text, schema, path));
    out.push(...placeholderFaults(text, schema, path));
  }
  return out;
}

// [[spec/design_output/schema#the-door-refuses-a-departure]]
export function schemasFrom(files) {
  const out = new Map();
  for (const one of files ?? []) {
    const said = readYaml(one.text);
    if (describesANote(said)) out.set(String(said.kind), said);
  }
  return out;
}

export function refusedNote(where, kind, found) {
  return [
    `The ${kind} schema refuses this write to ${where}.`,
    "",
    ...found.map((one) => `  ${where}:${one.line}:${one.column}  ${one.rule}\n    ${one.message}`),
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

// [[spec/design_output/schema#mint-writes-a-valid-note]]
export function mintNote(schema, fields) {
  const spec = schema?.frontmatter ?? {};
  const props = spec.properties ?? {};
  const given = handedIn(fields);
  const required = spec.required ?? [];
  const rows = ["---"];

  for (const key of required) rows.push(`${key}: ${valueOf(key, props[key], given)}`);
  for (const key of Object.keys(props)) {
    if (required.includes(key) || !given.has(slugOf(key))) continue;
    rows.push(`${key}: ${valueOf(key, props[key], given)}`);
  }
  rows.push("---", "");

  const hashes = "#".repeat(schema?.body?.headingLevel ?? 1);
  for (const one of schema?.body?.sections ?? []) {
    rows.push(`${hashes} ${one.header}`, "");
    const said = given.get(slugOf(one.header));
    if (said !== undefined && String(said).trim()) {
      rows.push(String(said).trim(), "");
      continue;
    }
    if (one.description) rows.push(`<!-- ${one.description} -->`, "");
    if (one.list)
      rows.push(
        one.ordered ? "1. Say the first one here." : "- Say the first one here.",
        "",
      );
  }
  return `${rows.join("\n").trimEnd()}\n`;
}

// [[spec/design_output/schema#the-fields-a-person-and-a-session-hand-in]]
export function slugOf(said) {
  return String(said ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function handedIn(fields) {
  const out = new Map();
  for (const [key, value] of Object.entries(fields ?? {})) out.set(slugOf(key), value);
  return out;
}

function valueOf(key, rule, given) {
  if (rule?.const !== undefined) return minted(rule);
  const said = given.get(slugOf(key));
  if (said === undefined || String(said).trim() === "") return minted(rule);
  return written(said, rule);
}

function written(said, rule) {
  const list = [said].flat().filter((one) => String(one).trim() !== "");
  const each = list.map((one) =>
    rule?.["x-link"] && !LINK.test(String(one).trim())
      ? `[[${String(one).trim()}]]`
      : String(one).trim(),
  );
  if (Array.isArray(said) || [rule?.type].flat().includes("array")) {
    return `[${each.map((one) => `"${one}"`).join(", ")}]`;
  }
  return each[0] ?? "";
}

// [[spec/design_output/schema#the-fields-a-person-and-a-session-hand-in]]
export function fieldsIn(argv, schema) {
  const named = new Map();
  for (const key of Object.keys(schema?.frontmatter?.properties ?? {})) {
    named.set(slugOf(key), key);
  }
  for (const one of schema?.body?.sections ?? []) named.set(slugOf(one.header), one.header);

  const fields = {};
  for (const arg of argv ?? []) {
    const pair = /^--([^=]+)=([\s\S]*)$/.exec(String(arg));
    if (!pair) continue;
    const key = named.get(slugOf(pair[1]));
    if (!key) {
      return {
        why: `${pair[1]} names no field of a ${schema?.kind} note. It takes ${[...named.values()].join(", ")}.`,
      };
    }
    fields[key] = pair[2];
  }
  return { fields };
}

// [[spec/design_output/schema#the-tool-writes-the-note]]
export function mintSpec(schemas) {
  const kinds = [...(schemas?.keys?.() ?? [])].sort();
  return {
    name: MINT_TOOL,
    description: [
      "Writes a new note of a kind, in the shape its schema names. Hand the",
      "frontmatter values and the text under each chapter in fields, by header.",
      "A field left out takes the placeholder its schema describes, which the",
      "sweep names at warning until you fill it in. The tool runs the checker",
      `over what it writes, and no file lands where the schema refuses it. ${SCHEMAS}`,
      `holds ${kinds.join(", ")}.`,
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        kind: {
          type: "string",
          enum: kinds,
          description: "the kind of note, which names the schema it is minted from",
        },
        path: {
          type: "string",
          description: "where the note lands, such as spec/funnel/a-name.md",
        },
        fields: {
          type: "object",
          description:
            "the frontmatter values and the text under each chapter, keyed by field name and by header",
        },
      },
      required: ["kind", "path"],
    },
  };
}

// [[spec/design_output/schema#the-tool-writes-the-note]]
export function mintedNote(schemas, ask) {
  const kind = String(ask?.kind ?? "").trim();
  const path = String(ask?.path ?? "").trim();
  const kinds = [...(schemas?.keys?.() ?? [])].sort().join(", ");

  if (!kind || !path) {
    return { why: `${MINT_TOOL} takes a kind and a path. ${SCHEMAS} holds ${kinds}.` };
  }
  if (!path.endsWith(".md")) return { why: `${path} names no markdown file.` };

  const schema = schemas.get(kind);
  if (!schema) return { why: `${SCHEMAS} holds no ${kind}. It holds ${kinds}.` };

  const governor = isDraft(path) ? null : governorOf(schemas, path);
  if (governor && governor.kind !== kind) {
    return {
      why: `${governor.kind} governs ${path}, and this note names ${kind}. Name a path the ${kind} schema governs.`,
    };
  }

  const text = mintNote(schema, ask?.fields);
  const found = checkNote(text, schema, path);
  if (found.length) return { why: refusedNote(path, kind, found), found };
  return { text, path, kind, left: placeholderFaults(text, schema, path) };
}

function minted(rule) {
  if (rule?.const !== undefined) {
    return rule["x-link"] ? `[[${rule.const}]]` : String(rule.const);
  }
  if (Array.isArray(rule?.enum)) return String(rule.enum[0]);

  const said = String(rule?.description ?? "what goes here");
  if ([rule?.type].flat().includes("array")) return `["${said}"]`;
  return rule?.["x-link"] ? `[[${said}]]` : said;
}

function fault(rule, file, line, message) {
  return {
    file,
    rule: `Schema.${nameOf(rule)}`,
    line,
    column: 1,
    message,
    severity: SEVERITY,
  };
}

function nameOf(said) {
  const parts = String(said)
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  if (parts.length === 1) return parts[0];
  return parts.map((one) => one[0].toUpperCase() + one.slice(1)).join("");
}

function empty(said) {
  if (said === undefined || said === null) return true;
  if (Array.isArray(said)) return said.length === 0;
  return String(said).trim() === "";
}

function linked(said) {
  if (Array.isArray(said))
    return said.length > 0 && said.every((one) => LINK.test(String(one)));
  return LINK.test(String(said ?? ""));
}

function linkless(said) {
  if (Array.isArray(said)) return said.map((one) => linkless(one));
  return String(said ?? "").replace(LINK, "$1");
}

function typed(value, type) {
  return [type].flat().some((one) => {
    if (one === "array") return Array.isArray(value);
    if (one === "object") return Boolean(value) && typeof value === "object";
    if (one === "string") return typeof value === "string";
    if (one === "integer" || one === "number") return typeof value === "number";
    if (one === "boolean") return typeof value === "boolean";
    return true;
  });
}

function typeOf(value) {
  if (Array.isArray(value)) return "a list";
  if (value && typeof value === "object") return "a map";
  return "one line";
}

function show(said) {
  const flat = Array.isArray(said) ? said.join(", ") : String(said ?? "");
  return flat.length > 40 ? `${flat.slice(0, 37)}...` : flat;
}
