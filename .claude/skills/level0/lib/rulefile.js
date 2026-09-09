// Reads a rule file: a scalar, a list of scalars, and a comment. The rules Vale
// does not hold are written in the shape Vale's own are. A file of entries, one
// rule each, reads through readEntries.
// [[spec/design_output/stop#where-the-rules-live]]

export function readEntries(text) {
  const out = [];
  let held = [];

  for (const raw of String(text ?? "").split(/\r?\n/)) {
    const opens = /^-\s+(\S.*)$/.exec(raw.replace(/\s+$/, ""));
    if (opens) {
      if (held.length) out.push(readRule(held.join("\n")));
      held = [opens[1]];
      continue;
    }
    if (held.length) held.push(raw.replace(/^\s{0,2}/, ""));
  }
  if (held.length) out.push(readRule(held.join("\n")));
  return out.filter((one) => Object.keys(one).length);
}

export function readRule(text) {
  const out = {};
  let list = null;

  for (const raw of String(text ?? "").split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, "");
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const item = /^\s*-\s+(.*)$/.exec(line);
    if (item && list) {
      out[list].push(unquote(item[1]));
      continue;
    }

    const pair = /^([A-Za-z_][A-Za-z0-9_]*):\s*(.*)$/.exec(line);
    if (!pair) continue;

    const [, key, value] = pair;
    if (!value.trim()) {
      out[key] = [];
      list = key;
      continue;
    }
    list = null;
    out[key] = asValue(unquote(value));
  }
  return out;
}

function unquote(said) {
  const t = said.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1);
  }
  return t;
}

function asValue(said) {
  if (said === "true") return true;
  if (said === "false") return false;
  if (/^-?\d+$/.test(said)) return Number(said);
  return said;
}
