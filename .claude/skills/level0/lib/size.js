// A function holds one thing and a file one topic, and the config names the
// ceiling of each in lines. This counts both over a brace language and
// answers what stands past its ceiling. The caller hands the ceilings in.
// [[spec/design_output/level0#the-size-ceiling]]

export const SIZED = /\.(js|jsx|ts|tsx|go)$/i;
export const FILE_RULE = "FileCeiling";
export const FUNCTION_RULE = "FunctionCeiling";

const OPENS = [
  /^\s*(?:export\s+)?(?:default\s+)?(?:async\s+)?function\b\s*\*?\s*([A-Za-z_$][\w$]*)?/,
  /^\s*(?:export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{\s*$/,
  /^\s*(?:static\s+)?(?:async\s+)?(?!(?:if|for|while|switch|catch|return|do|else|with)\b)([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{\s*$/,
  /^\s*func\s+(?:\([^)]*\)\s*)?([A-Za-z_][\w]*)/,
];

// [[spec/design_output/level0#the-size-ceiling]]
export function sizeFaults(text, where, ceilings = {}) {
  const out = [];
  if (!SIZED.test(String(where ?? ""))) return out;
  const lines = String(text ?? "").split(/\r?\n/);
  const most = Number(ceilings.file);
  if (Number.isFinite(most) && most > 0 && lines.length > most) {
    out.push(
      fault(where, FILE_RULE, 1, "the file", lines.length, most, "Split it by topic."),
    );
  }
  const cap = Number(ceilings.function);
  if (!Number.isFinite(cap) || cap <= 0) return out;
  for (const one of functionsIn(lines)) {
    if (one.lines <= cap) continue;
    out.push(
      fault(
        where,
        FUNCTION_RULE,
        one.line,
        one.name,
        one.lines,
        cap,
        "Split it into what it does.",
      ),
    );
  }
  return out;
}

// A file already past its ceiling takes a cut and refuses a growth, so the door reads both texts. [[spec/design_output/level0#the-size-ceiling]]
export function grows(before, after, where, ceilings = {}) {
  const now = sizeFaults(after, where, ceilings);
  if (!now.length) return [];
  const was = new Map(
    sizeFaults(before, where, ceilings).map((one) => [`${one.rule} ${one.said}`, one]),
  );
  return now.filter((one) => {
    const held = was.get(`${one.rule} ${one.said}`);
    return !held || one.count > held.count;
  });
}

export function functionsIn(lines) {
  const out = [];
  const open = [];
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const bare = plain(lines[i]);
    const name = nameOf(lines[i]);
    if (name && bare.includes("{")) open.push({ name, line: i + 1, depth });
    for (const ch of bare) {
      if (ch === "{") depth += 1;
      if (ch !== "}") continue;
      depth -= 1;
      while (open.length && open[open.length - 1].depth === depth) {
        const one = open.pop();
        out.push({ name: one.name, line: one.line, lines: i + 2 - one.line });
      }
    }
  }
  return out;
}

function nameOf(line) {
  for (const opens of OPENS) {
    const found = opens.exec(line);
    if (found) return found[1] ?? "a function";
  }
  return "";
}

function fault(where, rule, line, said, count, most, road) {
  const what = rule === FILE_RULE ? "A file" : "A function";
  return {
    file: where,
    rule,
    line,
    column: 1,
    said,
    count,
    message: `${what} holds ${most} lines, and ${said} holds ${count}. ${road}`,
    severity: "error",
  };
}

function plain(line) {
  return String(line)
    .replace(/\/\/.*$/, "")
    .replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g, '""');
}
