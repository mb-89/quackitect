// The prose file shape, and the readers of the JSON the rules-over verb writes:
// each path names its rows, and each row names its check, line, span and match.
// [[spec/design_output/level0#where-a-rule-lives]]

export const PROSE = /\.(md|markdown|txt)$/i;

// [[spec/design_output/projection#the-second-target]]
const PROSE_STYLE = /^Voice(Vale|Paragraph)\./;

// Why the rules-over verb's answer reads as no rows, or nothing where it reads as JSON. [[spec/design_output/level0#a-broken-rule-says-so]]
export function faultIn(stdout) {
  try {
    JSON.parse(stdout || "{}");
    return "";
  } catch {
    return String(stdout ?? "").trim()
      ? "the rules-over verb answered something other than JSON"
      : "";
  }
}

export function fromJson(stdout) {
  let read;
  try {
    read = JSON.parse(stdout || "{}");
  } catch {
    return [];
  }

  const out = [];
  for (const [file, rows] of Object.entries(read)) {
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      out.push({
        file,
        rule: String(row.Check ?? "").replace(PROSE_STYLE, ""),
        line: row.Line ?? 1,
        column: row.Span?.[0] ?? 1,
        said: row.Match ?? "",
        message: row.Message ?? "",
        severity: row.Severity ?? "error",
        fixable: Boolean(row.Action?.Name),
      });
    }
  }
  return out.sort((a, b) => a.line - b.line || a.column - b.column);
}
