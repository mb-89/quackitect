// se-mcp — the v3 server entry. Node ≥22 runs this directly (native type
// stripping); no build step. The workspace's .mcp.json points here.
//
//   node bin/se-mcp.ts --root <project root>
//
// --root is the QUACKITECT PROJECT root (the folder holding product/ and
// workspace/) — the file lane serves that whole tree, the call log lives in
// <root>/.se/calls.jsonl.
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { runStdio } from "../engine/mcp.ts";
import { buildServer } from "../engine/tools.ts";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const root = resolve(argValue("--root") ?? process.cwd());
if (!existsSync(root)) {
  process.stderr.write(`se-mcp: root does not exist: ${root}\n`);
  process.exit(1);
}

process.stderr.write(`se-mcp 3.0.0-bootstrap root=${root}\n`);
runStdio(buildServer(root));
