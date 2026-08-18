// Assemble the shippable package: the working tree, minus what stays home,
// zipped under dist/ as <id>-<version>.zip.
//
// The exclusions mirror the producing act's: history, session state, records
// and installed dependencies stay home. The README inside is rendered from
// brand/README.entry.md, the same template the act renders, so the two
// front doors cannot drift apart.
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { loadBrand } from "../brand.ts";
import { travels } from "../produce.ts";

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

// THE LIST LIVES IN ONE PLACE NOW, engine/produce.ts, and both the packaging
// script and the producing act call it.
//
// THE COMMENT HERE USED TO SAY "the same list the export excludes" while they
// were in fact two lists, and the difference was 20.8 MB of release archives
// travelling into every produced vehicle plus the one file that must not be
// dropped. A comment cannot make two lists agree; only calling one function
// can.

const stage = mkdtempSync(join(tmpdir(), "se-package-"));
cpSync(root, stage, {
  recursive: true,
  filter: (src) => travels(root, src),
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
