// Reads a rule file. Pure JavaScript with no `node:` import and no library, so
// the module and the command line read one parser.
//
// The rules that Vale does not hold are written in the same shape Vale's own
// are, so a reader moving between the folders reads one format. This covers the
// subset those files use: a scalar, a list of scalars, and a comment.

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
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
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
