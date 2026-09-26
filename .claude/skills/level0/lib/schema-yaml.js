// The YAML reader a schema file goes through: a map, a list, a flow list, a
// link and a scalar, each read at the line it stands on.
// [[spec/design_output/schema#the-yaml-a-schema-reads]]

const LINK = /^\[\[(.+)\]\]$/;
const PAIR = /^([^:\s][^:]*):\s*(.*)$/;

// [[spec/design_output/schema#the-yaml-a-schema-reads]]
// [[spec/design_output/schema#a-line-per-nested-key]]
export function readYaml(text, lines) {
  const rows = [];
  let at = 0;
  for (const raw of String(text ?? "").split(/\r?\n/)) {
    at += 1;
    const line = raw.replace(/\s+$/, "");
    if (!line.trim() || /^\s*#/.test(line)) continue;
    rows.push({ indent: line.search(/\S/), said: line.trim(), line: at });
  }
  const cursor = { at: 0, lines: lines ?? null };
  return rows.length ? block(rows, cursor, rows[0].indent, "") : {};
}

// [[spec/design_output/schema#a-line-per-nested-key]]
function mark(cursor, path, line) {
  if (cursor.lines && path && !cursor.lines.has(path)) cursor.lines.set(path, line);
}

export function keyed(path, key) {
  return path ? `${path}.${key}` : key;
}

function block(rows, cursor, indent, path) {
  return rows[cursor.at].said.startsWith("- ")
    ? listAt(rows, cursor, indent, path)
    : mapAt(rows, cursor, indent, path);
}

function mapAt(rows, cursor, indent, path) {
  const out = {};
  while (cursor.at < rows.length) {
    const one = rows[cursor.at];
    if (one.indent !== indent) break;
    const pair = PAIR.exec(one.said);
    if (!pair) break;
    cursor.at += 1;
    const key = pair[1].trim();
    const at = keyed(path, key);
    mark(cursor, at, one.line);
    out[key] = pair[2].trim()
      ? scalar(pair[2].trim())
      : under(rows, cursor, one.indent, at);
  }
  return out;
}

function listAt(rows, cursor, indent, path) {
  const out = [];
  while (cursor.at < rows.length) {
    const one = rows[cursor.at];
    if (one.indent !== indent || !one.said.startsWith("- ")) break;
    cursor.at += 1;

    const at = `${path}[${out.length}]`;
    mark(cursor, at, one.line);
    const rest = one.said.slice(2).trim();
    // [[spec/design_output/projection#the-second-target]]
    if (rest.startsWith("{")) {
      out.push(scalar(rest));
      continue;
    }
    const pair = quotedWhole(rest) ? null : PAIR.exec(rest);
    if (!pair) {
      out.push(scalar(rest));
      continue;
    }

    const item = {};
    const first = keyed(at, pair[1].trim());
    mark(cursor, first, one.line);
    item[pair[1].trim()] = pair[2].trim()
      ? scalar(pair[2].trim())
      : under(rows, cursor, one.indent + 2, first);
    while (cursor.at < rows.length && rows[cursor.at].indent > one.indent) {
      const next = rows[cursor.at];
      const more = PAIR.exec(next.said);
      if (!more) break;
      cursor.at += 1;
      const deeper = keyed(at, more[1].trim());
      mark(cursor, deeper, next.line);
      item[more[1].trim()] = more[2].trim()
        ? scalar(more[2].trim())
        : under(rows, cursor, next.indent, deeper);
    }
    out.push(item);
  }
  return out;
}

// An item reads as quoted text where its closing quote stands last, so a colon inside stays text, and `"a": "b"` stays a pair. [[spec/tickets/the-quoted-pair-stays-paired]]
export function quotedWhole(said) {
  const quote = said[0];
  if (quote !== '"' && quote !== "'") return false;
  for (let at = 1; at < said.length; at += 1) {
    if (quote === '"' && said[at] === "\\") {
      at += 1;
      continue;
    }
    if (said[at] !== quote) continue;
    if (quote === "'" && said[at + 1] === "'") {
      at += 1;
      continue;
    }
    return at === said.length - 1;
  }
  return false;
}

function under(rows, cursor, indent, path) {
  const next = rows[cursor.at];
  if (!next) return null;
  if (next.indent > indent) return block(rows, cursor, next.indent, path);
  if (next.indent === indent && next.said.startsWith("- ")) {
    return listAt(rows, cursor, indent, path);
  }
  return null;
}

function scalar(said) {
  const flat = unquote(said);
  if (LINK.test(flat)) return flat;
  // [[spec/design_output/projection#the-second-target]]
  if (flat.startsWith("{") && flat.endsWith("}")) return mapping(flat.slice(1, -1));
  if (flat.startsWith("[") && flat.endsWith("]")) {
    return flowItems(flat.slice(1, -1))
      .map((one) => unquote(one.trim()))
      .filter((one) => one !== "");
  }
  if (flat === "true") return true;
  if (flat === "false") return false;
  if (/^-?\d+$/.test(flat)) return Number(flat);
  return flat;
}

// [[spec/design_output/pull#the-fields-hold-their-forms]]
function flowItems(inside) {
  const out = [];
  let held = "";
  let quote = "";
  for (const char of inside) {
    if (quote) {
      held += char;
      if (char === quote) quote = "";
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      held += char;
      continue;
    }
    if (char === ",") {
      out.push(held);
      held = "";
      continue;
    }
    held += char;
  }
  out.push(held);
  return out;
}

// [[spec/design_output/projection#the-second-target]]
function mapping(said) {
  const out = {};
  for (const one of parted(said)) {
    const pair = PAIR.exec(one.trim());
    if (!pair) continue;
    out[pair[1].trim()] = scalar(pair[2].trim());
  }
  return out;
}

// A comma inside a bracket belongs to its own list. [[spec/design_output/projection#the-second-target]]
function parted(said) {
  const out = [];
  let depth = 0;
  let held = "";
  for (const one of String(said)) {
    if (one === "[" || one === "{") depth += 1;
    if (one === "]" || one === "}") depth -= 1;
    if (one === "," && depth === 0) {
      out.push(held);
      held = "";
      continue;
    }
    held += one;
  }
  out.push(held);
  return out.filter((one) => one.trim() !== "");
}

function unquote(said) {
  const flat = String(said).trim();
  const quoted =
    (flat.startsWith('"') && flat.endsWith('"')) ||
    (flat.startsWith("'") && flat.endsWith("'"));
  return quoted && flat.length > 1 ? flat.slice(1, -1) : flat;
}
