// Vale, and the one place this tree calls it. A caller hands in
// run(argv, { stdin, cwd }); the rules live in spec/config/styles.
// [[spec/design_output/level0#where-a-rule-lives]]

export const CONFIG = ".vale.ini";

export const PROSE = /\.(md|markdown|txt)$/i;

const MARKER = /<!--\s*vale\s+([A-Za-z0-9_.-]+)\s*=\s*(NO|off)\s*-->/i;
const REASON = /<!--\s*because:\s*(.+?)\s*-->/i;

export async function lintText(text, where, options = {}) {
  const { run, bin, cwd, config } = options;
  if (!bin) return { ran: false, why: "no vale stands here", found: [] };
  const argv = [
    bin,
    `--config=${config || CONFIG}`,
    `--path=${where || "stdin.md"}`,
    "--output=JSON",
    "--no-exit",
  ];

  let said;
  try {
    said = await run(argv, { stdin: text, cwd });
  } catch (err) {
    return { ran: false, why: String(err?.message ?? err), found: [] };
  }
  if (said?.exitCode !== 0 && !said?.stdout) {
    return {
      ran: false,
      why: (said?.stderr || "vale answered nothing").trim(),
      found: [],
    };
  }

  const fault = faultIn(said.stdout);
  if (fault) return { ran: false, why: fault, found: [] };

  return { ran: true, found: [...fromJson(said.stdout), ...unreasoned(text)] };
}

// [[spec/design_output/level0#a-broken-rule-says-so]]
export function faultIn(stdout) {
  let read;
  try {
    read = JSON.parse(stdout || "{}");
  } catch {
    return String(stdout ?? "").trim() ? "vale answered something other than JSON" : "";
  }
  const code = read?.Code;
  if (typeof code !== "string" || !/^E\d+$/.test(code)) return "";
  return `${code} ${String(read.Text ?? "").split(/\r?\n/)[0]}`.trim();
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
        rule: String(row.Check ?? "").replace(/^VoiceVale\./, ""),
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

export function unreasoned(text) {
  const lines = String(text ?? "").split(/\r?\n/);
  const out = [];
  let fenced = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;

    const bare = lines[i].replace(/`[^`]*`/g, "");
    const found = MARKER.exec(bare);
    if (!found) continue;
    const above = i > 0 ? lines[i - 1] : "";
    if (REASON.test(lines[i]) || REASON.test(above)) continue;
    out.push({
      rule: "ExemptionCarriesAReason",
      line: i + 1,
      column: 1,
      said: found[0],
      message: `An exemption names why the rule is off. Write <!-- because: why --> above it.`,
      severity: "error",
      fixable: false,
    });
  }
  return out;
}
