// Biome, and the one place this tree calls it. Pure JavaScript with no `node:`
// import, so the write door and the command line share one caller.
// [[spec/design_output/level0#the-formatter-applies-itself]]

export const BIOME = ".se/bin/biome";
export const CONFIG_DIR = "spec/config";

export const CODE = /\.(js|jsx|ts|tsx|json|jsonc)$/i;

export function biomeBin(platform) {
  return platform === "win32" ? `${BIOME}.exe` : BIOME;
}

export async function formatText(text, where, options = {}) {
  const { run, bin, cwd } = options;
  const argv = [
    bin ?? BIOME,
    "format",
    `--config-path=${CONFIG_DIR}`,
    `--stdin-file-path=${where}`,
  ];

  let said;
  try {
    said = await run(argv, { stdin: text, cwd });
  } catch (err) {
    return { ran: false, why: String(err?.message ?? err), text };
  }
  if (said?.exitCode !== 0 || !said?.stdout) {
    return { ran: false, why: (said?.stderr || "biome answered nothing").trim(), text };
  }
  return { ran: true, text: said.stdout };
}

export async function lintText(text, where, options = {}) {
  const { run, bin, cwd } = options;
  const argv = [
    bin ?? BIOME,
    "lint",
    `--config-path=${CONFIG_DIR}`,
    `--stdin-file-path=${where}`,
    "--reporter=json",
  ];

  let said;
  try {
    said = await run(argv, { stdin: text, cwd });
  } catch (err) {
    return { ran: false, why: String(err?.message ?? err), found: [] };
  }
  return { ran: true, found: fromJson(said?.stdout ?? "", where) };
}

export function fromJson(stdout, where) {
  let read;
  try {
    read = JSON.parse(stdout || "{}");
  } catch {
    return [];
  }

  const out = [];
  for (const row of read.diagnostics ?? []) {
    if (row.severity === "information") continue;
    out.push({
      file: row.location?.path?.file ?? where,
      rule: String(row.category ?? "biome").replace(/^lint\//, ""),
      line: lineOf(row),
      column: 1,
      said: "",
      message: textOf(row.description) || textOf(row.message),
      severity: row.severity === "warning" ? "warning" : "error",
      fixable: Boolean(row.advices?.advices?.length),
    });
  }
  return out;
}

function lineOf(row) {
  const span = row.location?.span;
  const source = row.location?.sourceCode;
  if (!Array.isArray(span) || typeof source !== "string") return 1;
  return source.slice(0, span[0]).split("\n").length;
}

function textOf(said) {
  if (typeof said === "string") return said;
  if (Array.isArray(said)) return said.map(textOf).join("");
  if (said && typeof said === "object") return textOf(said.content ?? said.text ?? "");
  return "";
}
