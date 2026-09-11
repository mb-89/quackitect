// The index, asked the way the search tools ask. This turns one tool call into
// a question the door answers, and the answer back into what the tool prints.
// [[spec/design_output/index#the-door-answers-the-tools]]

export const BIN = ".se/bin/se-index";

const CONTENT = "content";
const COUNT = "count";

// [[spec/design_output/index#where-the-disk-still-answers]]
export function asked(e) {
  if (e?.tool === "Grep") return grepAsked(e);
  if (e?.tool === "Glob") return globAsked(e);
  return null;
}

function grepAsked(e) {
  const pattern = String(e.pattern ?? "");
  if (!pattern) return null;
  if (e.multiline || e.type || e["-o"] || e.offset) return null;

  const around = Number(e["-C"] ?? e.context ?? 0) || 0;
  return {
    method: "grep",
    params: {
      pattern,
      path: String(e.path ?? ""),
      glob: String(e.glob ?? ""),
      insensitive: Boolean(e["-i"]),
      before: Number(e["-B"] ?? around) || 0,
      after: Number(e["-A"] ?? around) || 0,
      limit: Number(e.head_limit ?? 0) || 0,
    },
  };
}

function globAsked(e) {
  const pattern = String(e.pattern ?? "");
  if (!pattern) return null;
  return { method: "glob", params: { pattern, path: String(e.path ?? "") } };
}

// [[spec/design_output/index#the-door-answers-the-tools]]
export function said(e, answer) {
  if (e?.tool === "Glob") return globSaid(answer);
  return grepSaid(e, answer);
}

function globSaid(answer) {
  const paths = answer?.paths ?? [];
  if (!paths.length) return "No files found";
  return [...paths, cut(answer)].filter(Boolean).join("\n");
}

function grepSaid(e, answer) {
  const files = answer?.files ?? [];
  if (!files.length) return "No matches found";

  const mode = String(e?.output_mode ?? "files_with_matches");
  if (mode === COUNT) {
    const rows = files.map((one) => `${one.path}:${one.count}`);
    return [...rows, cut(answer)].filter(Boolean).join("\n");
  }
  if (mode !== CONTENT) {
    const rows = files.map((one) => one.path);
    return [...rows, `Found ${files.length} file(s)`, cut(answer)]
      .filter(Boolean)
      .join("\n");
  }

  const numbered = e?.["-n"] !== false;
  const rows = [];
  for (const one of files) {
    for (const line of one.lines ?? []) {
      rows.push(row(one.path, line, numbered));
    }
  }
  return [...rows, cut(answer)].filter(Boolean).join("\n");
}

function row(path, line, numbered) {
  const mark = line.match ? ":" : "-";
  if (!numbered) return `${path}${mark}${line.text}`;
  return `${path}${mark}${line.line}${mark}${line.text}`;
}

function cut(answer) {
  return answer?.cut ? "(the answer stops at the limit)" : "";
}

// [[spec/design_output/index#the-door-answers-the-tools]]
export function readsAnswer(stdout) {
  try {
    const read = JSON.parse(String(stdout ?? ""));
    if (read && typeof read === "object") return read;
  } catch {}
  return null;
}
