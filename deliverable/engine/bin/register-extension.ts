// Register a linked extension folder with VS Code. The installer calls this;
// nothing else should, because VS Code owns this file the rest of the time.
//
//   node engine/bin/register-extension.ts --extension <folder> [--registry <file>]
//
// It imports node builtins only, so it runs before any npm install has.
import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, join, resolve } from "node:path";
import { entryFor, writeRegistry } from "../vscoderegistry.ts";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

if (process.argv.some((a) => a === "--help" || a === "-h" || a === "-?")) {
  process.stdout.write(`register-extension — list a linked extension folder in VS Code's own registry

  node engine/bin/register-extension.ts --extension <folder> [--registry <file>]

  --extension  the folder inside the VS Code extensions directory. Required.
  --registry   the registry file. Default: <home>/.vscode/extensions/extensions.json
  --help       this text (-h, -?)

  VS Code does not discover a linked folder on its own, so the link needs an
  entry beside it. The registry holds every extension the person has, and a
  write that would lose one is rolled back instead of applied.
`);
  process.exit(0);
}

const dir = argValue("--extension");
if (!dir) {
  process.stderr.write("register-extension: --extension <folder> is required\n");
  process.exit(2);
}
const extension = resolve(dir);
const registry = resolve(argValue("--registry") ?? join(homedir(), ".vscode", "extensions", "extensions.json"));

let pkg: { name: string; publisher: string; version: string };
try {
  pkg = JSON.parse(readFileSync(join(extension, "package.json"), "utf8"));
} catch (e) {
  process.stderr.write(`register-extension: cannot read ${join(extension, "package.json")} — ${(e as Error).message}\n`);
  process.exit(1);
}
if (!pkg.publisher || !pkg.name || !pkg.version) {
  process.stderr.write("register-extension: the extension's package.json needs publisher, name and version\n");
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
try {
  const report = writeRegistry(registry, entryFor(extension, pkg, Date.now()), stamp);
  const id = `${pkg.publisher}.${pkg.name}`;
  process.stdout.write(`  ${report.replaced ? "re-registered" : "registered"} ${id} with VS Code\n`);
  process.stdout.write(
    `  ${report.carried.length} other extension${report.carried.length === 1 ? "" : "s"} kept: ${report.carried.join(", ") || "none"}\n`,
  );
  if (report.unreadable) {
    process.stdout.write("  the registry was not readable JSON and has been rebuilt\n");
  }
  if (report.unwrapped > 0 || report.dropped > 0) {
    process.stdout.write(
      `  repaired a damaged registry: ${report.unwrapped} wrapper(s) opened, ${report.dropped} unidentifiable element(s) dropped\n`,
    );
  }
  if (report.rescued) process.stdout.write(`  the damaged file is kept at ${basename(report.rescued)}\n`);
  process.exit(0);
} catch (e) {
  process.stderr.write(`${(e as Error).message}\n`);
  process.exit(1);
}
