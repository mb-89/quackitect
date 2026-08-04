// Place the prompt layer. The start-the-agent step calls this; nothing else
// should, because a placement that drifts from its source is worse than none.
//
//   node engine/bin/place-prompt-layer.ts --root <project root> [--opened <folder>]
import { join, resolve } from "node:path";
import { placeProtocol } from "../promptlayer.ts";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}
if (process.argv.some((a) => a === "--help" || a === "-h" || a === "-?")) {
  process.stdout.write(`place-prompt-layer — assemble project/guidance/ into the prompt layer

  node engine/bin/place-prompt-layer.ts --root <project root> [--opened <folder>]

  --root    the project root. Default: the current directory.
  --opened  the folder the person opens. Default: <root>/product.
  --help    this text (-h, -?)
`);
  process.exit(0);
}

const root = resolve(argValue("--root") ?? process.cwd());
const opened = resolve(argValue("--opened") ?? join(root, "project"));
for (const p of placeProtocol(root, opened)) process.stdout.write(`placed ${p}\n`);
