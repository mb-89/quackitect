// A strict YAML *subset* for ledger frontmatter. Obsidian renders it as
// properties; the engine refuses anything outside the subset rather than
// guessing (schema makes invalid states unrepresentable, §5).
//
// Supported:
//   key: scalar
//   key: "quoted scalar"
//   key: [a, b, c]
//   key:            (block list)
//     - item
//   key:            (one-level nested map; values are scalars or lists)
//     sub: scalar
//     sub2: [a, b]
// Scalars are always strings. No anchors, no multi-line scalars, no deeper
// nesting. Two-space indentation exactly.

export type YamliteValue = string | string[] | Record<string, string | string[]>;
export type YamliteMap = Record<string, YamliteValue>;

export class YamliteError extends Error {
  readonly line: number;
  constructor(msg: string, line: number) {
    super(`frontmatter line ${line}: ${msg}`);
    this.name = "YamliteError";
    this.line = line;
  }
}

function parseScalar(raw: string, line: number): string {
  const s = raw.trim();
  if (s.startsWith('"')) {
    if (!s.endsWith('"') || s.length < 2) throw new YamliteError(`unterminated quote`, line);
    return JSON.parse(s.replace(/\\(?!["\\/bfnrtu])/g, "\\\\")) as string;
  }
  return s;
}

function parseInlineList(raw: string, line: number): string[] {
  const inner = raw.trim().slice(1, -1).trim();
  if (inner === "") return [];
  return inner.split(",").map((p) => parseScalar(p, line));
}

export function parseYamlite(text: string): YamliteMap {
  const out: YamliteMap = {};
  const lines = text.split("\n");
  let i = 0;
  while (i < lines.length) {
    const ln = lines[i];
    const lineNo = i + 1;
    if (ln.trim() === "" || ln.trim().startsWith("#")) { i++; continue; }
    if (ln.startsWith(" ")) throw new YamliteError(`unexpected indentation`, lineNo);
    const m = ln.match(/^([A-Za-z0-9_-]+):(.*)$/);
    if (!m) throw new YamliteError(`expected "key: value", got ${JSON.stringify(ln)}`, lineNo);
    const key = m[1];
    const rest = m[2].trim();
    if (key in out) throw new YamliteError(`duplicate key ${key}`, lineNo);
    if (rest !== "") {
      out[key] = rest.startsWith("[") && rest.endsWith("]") ? parseInlineList(rest, lineNo) : parseScalar(rest, lineNo);
      i++;
      continue;
    }
    // Block form: list, nested map, or empty.
    const items: string[] = [];
    const map: Record<string, string | string[]> = {};
    let sawList = false;
    let sawMap = false;
    i++;
    while (i < lines.length) {
      const sub = lines[i];
      const subNo = i + 1;
      if (sub.trim() === "") { i++; continue; }
      if (!sub.startsWith("  ") || sub.startsWith("    ")) break;
      const body = sub.slice(2);
      if (body.startsWith("- ")) {
        if (sawMap) throw new YamliteError(`mixed list and map under ${key}`, subNo);
        sawList = true;
        items.push(parseScalar(body.slice(2), subNo));
        i++;
      } else {
        const sm = body.match(/^([A-Za-z0-9_-]+):(.*)$/);
        if (!sm) throw new YamliteError(`expected "- item" or "sub: value" under ${key}`, subNo);
        if (sawList) throw new YamliteError(`mixed list and map under ${key}`, subNo);
        sawMap = true;
        const rest2 = sm[2].trim();
        if (sm[1] in map) throw new YamliteError(`duplicate key ${key}.${sm[1]}`, subNo);
        map[sm[1]] =
          rest2.startsWith("[") && rest2.endsWith("]") ? parseInlineList(rest2, subNo) : parseScalar(rest2, subNo);
        i++;
      }
    }
    out[key] = sawMap ? map : items;
  }
  return out;
}

const NEEDS_QUOTE = /^$|^[\s>|&*!%@`"'{[\]#-]|[:#]\s|:$|^\s|\s$|^(true|false|null|~|yes|no)$|[\n\t]/i;

function emitScalar(s: string): string {
  return NEEDS_QUOTE.test(s) ? JSON.stringify(s) : s;
}

/** Canonical serializer — key order is the caller's insertion order. */
export function serializeYamlite(map: YamliteMap): string {
  const lines: string[] = [];
  for (const [key, value] of Object.entries(map)) {
    if (typeof value === "string") {
      lines.push(`${key}: ${emitScalar(value)}`);
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${key}: []`);
      } else {
        lines.push(`${key}:`);
        for (const item of value) lines.push(`  - ${emitScalar(item)}`);
      }
    } else {
      lines.push(`${key}:`);
      for (const [sub, sv] of Object.entries(value)) {
        if (Array.isArray(sv)) {
          lines.push(`  ${sub}: [${sv.map(emitScalar).join(", ")}]`);
        } else {
          lines.push(`  ${sub}: ${emitScalar(sv)}`);
        }
      }
    }
  }
  return lines.join("\n") + "\n";
}
