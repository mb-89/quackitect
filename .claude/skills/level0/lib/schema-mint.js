// The mint: a valid note off a schema and the fields a caller names, and
// the tool that writes it.
// [[spec/design_output/schema#mint-writes-a-valid-note]]

import { isDraft } from "./paths.js";
import { checkNote, governorOf, MINT_TOOL, refusedNote, SCHEMAS } from "./schema.js";
import { chaptersWanted, minted, placeholderFaults } from "./schema-body.js";
import { LINK } from "./schema-fault.js";
import { readNote } from "./schema-read.js";
import { tableRows } from "./schema-table.js";
import { slugOf } from "./slug.js";

// [[spec/design_output/schema#mint-writes-a-valid-note]]
// [[spec/design_output/schema#the-render-follows-the-tree]]
export function mintNote(schema, fields) {
  const spec = schema?.frontmatter ?? {};
  const props = spec.properties ?? {};
  const given = handedIn(fields);
  const required = spec.required ?? [];
  const rows = ["---"];
  const front = {};

  for (const key of required) rows.push(...frontRows(key, props[key], given, front));
  for (const key of Object.keys(props)) {
    if (required.includes(key) || !given.has(slugOf(key))) continue;
    rows.push(...frontRows(key, props[key], given, front));
  }
  rows.push("---", "");

  const level = schema?.body?.headingLevel ?? 1;
  for (const one of chaptersWanted(schema?.body?.sections ?? [], front, level)) {
    rows.push(`${"#".repeat(one.level ?? level)} ${one.header}`, "");
    const said = given.get(slugOf(one.header));
    if (said !== undefined && String(said).trim()) {
      rows.push(String(said).trim(), "");
      continue;
    }
    if (one.description) rows.push(`<!-- ${one.description} -->`, "");
    if (one.form) rows.push(`<!-- the form is ${one.form} -->`, "");
    if (one.list)
      rows.push(
        one.ordered ? "1. Say the first one here." : "- Say the first one here.",
        "",
      );
    if (one.table) rows.push(...tableRows(one.table), "");
  }
  return `${rows.join("\n").trimEnd()}\n`;
}

// [[spec/design_output/schema#the-render-follows-the-tree]]
function frontRows(key, rule, given, front) {
  const said = given.get(slugOf(key));
  const bare =
    said === undefined || (typeof said !== "object" && String(said).trim() === "");

  if (rule?.const !== undefined) {
    front[key] = rule.const;
    return [`${key}: ${minted(rule)}`];
  }
  const value = bare ? rule?.default : said;
  if (
    value !== undefined &&
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    front[key] = value;
    return [`${key}:`, ...yamlRows(value, 2)];
  }
  if (Array.isArray(value) && value.some((one) => one && typeof one === "object")) {
    front[key] = value;
    return [`${key}:`, ...yamlRows(value, 2)];
  }
  if (bare && rule?.default === undefined) {
    front[key] = minted(rule);
    return [`${key}: ${minted(rule)}`];
  }
  front[key] = value;
  return [`${key}: ${written(value, rule)}`];
}

// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
export function reRouted(text, schema, route, hash) {
  const note = readNote(text);
  const front = { ...(note.front.said ?? {}), steps: route };
  if (hash) front.process_hash = hash;

  const level = schema?.body?.headingLevel ?? 1;
  const held = new Map(
    note.sections.map((one) => [`${one.level} ${one.header}`, one.own]),
  );
  const rows = ["---", ...frontRowsHeld(front, schema), "---", ""];

  for (const one of chaptersWanted(schema?.body?.sections ?? [], front, level)) {
    const deep = one.level ?? level;
    rows.push(`${"#".repeat(deep)} ${one.header}`, "");
    const own = trimmed(held.get(`${deep} ${one.header}`));
    if (own.length) {
      rows.push(...own, "");
      continue;
    }
    if (one.description) rows.push(`<!-- ${one.description} -->`, "");
    if (one.form) rows.push(`<!-- the form is ${one.form} -->`, "");
  }
  return `${rows.join("\n").trimEnd()}\n`;
}

// [[spec/design_output/schema#the-render-follows-the-tree]]
function frontRowsHeld(front, schema) {
  const props = Object.keys(schema?.frontmatter?.properties ?? {});
  const keys = [
    ...props.filter((key) => front[key] !== undefined),
    ...Object.keys(front).filter((key) => !props.includes(key)),
  ];
  return keys.flatMap((key) => keyRows(key, front[key], 0));
}

function trimmed(own) {
  const rows = [...(own ?? [])];
  while (rows.length && !rows[0].trim()) rows.shift();
  while (rows.length && !rows[rows.length - 1].trim()) rows.pop();
  return rows;
}

// [[spec/design_output/schema#the-render-follows-the-tree]]
function yamlRows(value, pad) {
  const gap = " ".repeat(pad);
  if (Array.isArray(value)) {
    return value.flatMap((one) => {
      if (!one || typeof one !== "object" || Array.isArray(one)) {
        return [`${gap}- ${flatOf(one)}`];
      }
      const rows = Object.entries(one).flatMap(([key, said]) =>
        keyRows(key, said, pad + 2),
      );
      return [`${gap}- ${rows[0].trim()}`, ...rows.slice(1)];
    });
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, said]) => keyRows(key, said, pad));
  }
  return [`${gap}${flatOf(value)}`];
}

function keyRows(key, said, pad) {
  const gap = " ".repeat(pad);
  if (said && typeof said === "object" && !Array.isArray(said)) {
    return [`${gap}${key}:`, ...yamlRows(said, pad + 2)];
  }
  if (Array.isArray(said) && said.some((one) => one && typeof one === "object")) {
    return [`${gap}${key}:`, ...yamlRows(said, pad + 2)];
  }
  return [`${gap}${key}: ${flatOf(said)}`];
}

function flatOf(said) {
  if (Array.isArray(said)) return `[${said.map((one) => `"${one}"`).join(", ")}]`;
  const flat = String(said ?? "");
  // [[spec/design_output/pull#a-person-step-goes-in]]
  if (/: |^[[{"'#&*!|>%@`]|: *$| #/.test(flat) && !/^\[\[.*\]\]$/.test(flat)) {
    return `"${flat.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  }
  return flat;
}

export { slugOf };

function handedIn(fields) {
  const out = new Map();
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return out;
  for (const [key, value] of Object.entries(fields)) out.set(slugOf(key), value);
  return out;
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

// [[spec/design_output/schema#the-fields-a-caller-names]]
export function fieldsIn(argv, schema) {
  const named = new Map();
  for (const key of Object.keys(schema?.frontmatter?.properties ?? {})) {
    named.set(slugOf(key), key);
  }
  for (const one of schema?.body?.sections ?? [])
    named.set(slugOf(one.header), one.header);

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
    return {
      why: `${MINT_TOOL} takes a kind and a path. ${SCHEMAS} holds ${kinds}.`,
    };
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
  const found = checkNote(text, schema, path, schemas);
  if (found.length) return { why: refusedNote(path, kind, found), found };
  return { text, path, kind, left: placeholderFaults(text, schema, path) };
}
