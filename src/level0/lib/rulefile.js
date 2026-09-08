// Reads a rule file: a scalar, a list of scalars, and a comment. The rules Vale
// does not hold are written in the shape Vale's own are.

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
