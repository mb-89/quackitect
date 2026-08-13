// Assemble the shippable package: the working tree, minus what stays home,
// zipped under dist/ as <id>-<version>.zip.
//
// The exclusions mirror RUNME's --export: history, session state, records
// and installed dependencies stay home. The README inside is rendered from
// brand/README.entry.md, the same template the export renders, so the two
// front doors cannot drift apart.
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve, sep } from "node:path";
import { loadBrand } from "../brand.ts";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 && i + 1 < process.argv.length ? process.argv[i + 1] : undefined;
}

if (process.argv.includes("--help")) {
  process.stdout.write(`package — assemble the shippable archive.

  --root  the project root (the folder holding RUNME.ps1). Default: the current directory.
  --out   where the archive lands. Default: <root>/dist.

Prints the archive path it produced.
`);
  process.exit(0);
}

const root = arg("--root") ?? process.cwd();
const brand = loadBrand(root);
const version = String(JSON.parse(readFileSync(join(root, "project", "deliverable", "package.json"), "utf8")).version);
const outDir = arg("--out") ?? join(root, "dist");

// By NAME wherever it appears, the same list the export excludes.
const EXCLUDE_DIRS = new Set([
  ".git",
  ".worktrees",
  ".se",
  "node_modules",
  ".claude",
  ".copilot",
  "dist",
  ".obsidian",
  ".vscode",
  ".github",
  "scratchpad",
]);
const EXCLUDE_FILES = new Set([".git", ".mcp.json", "Thumbs.db", ".DS_Store"]);

const stage = mkdtempSync(join(tmpdir(), "se-package-"));
cpSync(root, stage, {
  recursive: true,
  filter: (src) => {
    const rel = relative(root, src);
    if (rel === "" || rel.startsWith("..")) return rel === "";
    const parts = rel.split(sep);
    if (parts.some((p) => EXCLUDE_DIRS.has(p))) return false;
    if (EXCLUDE_FILES.has(parts[parts.length - 1])) return false;
    // The records stay home: they describe work the receiver never did.
    if (parts[0] === "project" && parts[1] === "spec") return false;
    return true;
  },
});
// The machine writes its records here, so the home exists from the start.
mkdirSync(join(stage, "project", "spec"), { recursive: true });

// The README inside is the ENTRY document, not this repo's own.
const abbr = brand.abbr ?? brand.name.slice(0, 2).toUpperCase();
const readme = readFileSync(join(root, "project", "deliverable", "brand", "README.entry.md"), "utf8")
  .replaceAll("$PRODUCT$", brand.name)
  .replaceAll("$PRODUCT_ABBR$", abbr);
writeFileSync(join(stage, "README.md"), readme, "utf8");

mkdirSync(outDir, { recursive: true });
const zipPath = resolve(join(outDir, `${brand.id}-${version}.zip`));
rmSync(zipPath, { force: true });
const r =
  process.platform === "win32"
    ? spawnSync(
        "powershell",
        ["-NoProfile", "-Command", `Compress-Archive -Path '${stage}\\*' -DestinationPath '${zipPath}' -CompressionLevel Optimal`],
        { stdio: ["ignore", "inherit", "inherit"] },
      )
    : spawnSync("zip", ["-r", "-X", zipPath, "."], { cwd: stage, stdio: ["ignore", "inherit", "inherit"] });
rmSync(stage, { recursive: true, force: true });
if (r.status !== 0) {
  process.stderr.write("packaging FAILED — the archive tool did not produce the archive\n");
  process.exit(1);
}
process.stdout.write(`${zipPath}\n`);
