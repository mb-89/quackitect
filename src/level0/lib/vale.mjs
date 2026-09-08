// Vale, and the one place this tree calls it. Pure JavaScript with no `node:`
// import, so the hooks module and the command line both load it and only the
// way they run a program differs.
//
// The rules are in spec/config/styles. Nothing about a rule is written here.
//
// A caller hands in `run(argv, { stdin, cwd })`, which resolves
// `{ exitCode, stdout, stderr }`. Level zero passes `$.process.run` and the
// command line passes a wrapper over spawnSync.

export const VALE = ".se/bin/vale";
export const CONFIG = ".vale.ini";

// Vale reads its own marker and refuses a reason inside it, so the reason is a
// comment of this tree's own, standing above the marker or beside it.
const MARKER = /<!--\s*vale\s+([A-Za-z0-9_.-]+)\s*=\s*(NO|off)\s*-->/i;
const REASON = /<!--\s*because:\s*(.+?)\s*-->/i;

export function valeBin(platform) {
  return platform === "win32" ? VALE + ".exe" : VALE;
}

export async function lintText(text, where, options = {}) {
  const { run, bin, cwd } = options;
  const argv = [
    bin ?? VALE,
    "--config=" + CONFIG,
    "--path=" + (where || "stdin.md"),
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
    return { ran: false, why: (said?.stderr || "vale answered nothing").trim(), found: [] };
  }

  return { ran: true, found: [...fromJson(said.stdout), ...unreasoned(text)] };
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

// A rule that cannot be switched off is switched off everywhere, so a line may
// carry Vale's marker. This tree asks that the marker name its reason, because
// an exemption nobody explained is a rule nobody trusts.
export function unreasoned(text) {
  const lines = String(text ?? "").split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const found = MARKER.exec(lines[i]);
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
