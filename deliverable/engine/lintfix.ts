// THE LANE FIXES WHAT IS MECHANICAL. A write to a file the project's linter
// covers comes back formatted and safe-fixed, and the result SAYS SO — the
// agent never spends a round on what a machine repairs. A finding the fix
// cannot reach rides the result too, so it is seen here rather than as a
// refusal at the commit hook.
//
// Coverage is read LIVE from deliverable/biome.json, never mirrored
// here. Its includes use two glob shapes ("dir/**" and "*.ext"); the matcher
// handles exactly those. A root without the config or the binary — every
// test fixture, any foreign project — skips silently and the write stands
// as written.
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";

const DELIVERABLE = join("deliverable");

/** What the linter can parse; anything else would refuse as an unknown file. */
const FIXABLE = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".jsonc", ".css"]);

const FINDINGS_CAP = 1600;

export interface LintFixResult {
  /** Root-relative paths whose content the fixer changed. */
  fixed: string[];
  /** What the safe fixes could not reach — the commit hook will refuse these. */
  findings?: string;
}

function biomeEntry(root: string): string | undefined {
  const override = process.env.SE_BIOME_JS;
  if (override !== undefined && override !== "") return override;
  const entry = join(root, DELIVERABLE, "node_modules", "@biomejs", "biome", "bin", "biome");
  return existsSync(entry) ? entry : undefined;
}

function covered(root: string, rels: string[]): string[] {
  const cfg = join(root, DELIVERABLE, "biome.json");
  if (!existsSync(cfg)) return [];
  let includes: string[];
  try {
    const parsed = JSON.parse(readFileSync(cfg, "utf8")) as { files?: { includes?: unknown } };
    includes = Array.isArray(parsed.files?.includes) ? parsed.files.includes.map(String) : [];
  } catch {
    return [];
  }
  const prefix = "deliverable/";
  return rels.filter((rel) => {
    const norm = rel.replace(/\\/g, "/");
    if (!norm.startsWith(prefix) || !FIXABLE.has(extname(norm).toLowerCase())) return false;
    const inside = norm.slice(prefix.length);
    return includes.some((g) => {
      if (g.endsWith("/**")) return inside.startsWith(g.slice(0, -2));
      if (g.startsWith("*.")) return !inside.includes("/") && inside.endsWith(g.slice(1));
      return inside === g;
    });
  });
}

function cap(s: string): string {
  return s.length <= FINDINGS_CAP
    ? s
    : `${s.slice(0, FINDINGS_CAP)}\n… (${s.length - FINDINGS_CAP} more chars — the commit hook prints the full list)`;
}

/** see dsp-quality-toolchain.md#run-the-linters-safe-fixes-over-freshly-written-files-in */
export function lintFix(root: string, rels: string[]): LintFixResult | undefined {
  const targets = covered(root, rels);
  if (targets.length === 0) return undefined;
  const entry = biomeEntry(root);
  if (entry === undefined) return undefined;
  const abs = targets.map((r) => join(root, r));
  const before = abs.map((p) => (existsSync(p) ? readFileSync(p, "utf8") : ""));
  // --error-on-warnings: the same bar the commit hook holds, so what rides
  // back here is exactly what the hook would refuse later.
  const r = spawnSync(process.execPath, [entry, "check", "--write", "--error-on-warnings", ...abs], {
    cwd: join(root, DELIVERABLE),
    encoding: "utf8",
    windowsHide: true,
    timeout: 30_000,
  });
  const fixed = targets.filter((_, i) => existsSync(abs[i]) && readFileSync(abs[i], "utf8") !== before[i]);
  if (r.status === 0) return { fixed };
  if (r.status === 1) {
    const findings = `${r.stdout ?? ""}\n${r.stderr ?? ""}`.trim();
    return { fixed, ...(findings === "" ? {} : { findings: cap(findings) }) };
  }
  // The fixer failing is never the write failing — say so and stand aside.
  const why = `${r.stderr ?? ""}${r.stdout ?? ""}`.trim() || String(r.error ?? "unknown");
  return { fixed, findings: cap(`the fixer did not run: ${why}`) };
}
