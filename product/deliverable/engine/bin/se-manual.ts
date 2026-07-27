// se-manual — walk the machines yourself, NO agent attached: the shared
// mirror server (engine/mirror.ts) standing alone. With an agent running,
// you do not need this — se-mcp embeds the same mirror on the same walk;
// manual mode there is just the threshold at 0.
//
//   node engine/bin/se-manual.ts --root <project root> [--port 7333]
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { CallLog } from "../calllog.ts";
import { startMirror } from "../mirror.ts";
import { seDir } from "../paths.ts";
import { Session } from "../session.ts";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

if (process.argv.some((a) => a === "--help" || a === "-h" || a === "-?")) {
  process.stdout.write(`se-manual — walk the machines yourself (the Mirror, no agent)

  node engine/bin/se-manual.ts --root <project root> [--port 7333]

  GET  /            the mirror (tick · info implied: looking never moves)
  POST /tick        tick with arguments: complete the current state, move on
  POST /autonomy    move the session autonomy (the slider posts here)
  GET  /api/tick    the tick info packet as JSON
  GET  /api/alive   position + autonomy — the mirror polls this
  GET  /widget/machine | /widget/details    single widgets (tab/window)
  --help            this text (-h, -?)

  Reaching end shuts the server down — the mirror turns red: session over.
`);
  process.exit(0);
}

const root = resolve(argValue("--root") ?? process.cwd());
if (!existsSync(root)) {
  process.stderr.write(`se-manual: root does not exist: ${root}\n`);
  process.exit(1);
}
const port = Number(argValue("--port") ?? 7333);

const session = new Session(root);
session.onClosed = () => {
  process.stderr.write("se-manual: the machine reached end — session over, shutting down\n");
  setTimeout(() => process.exit(0), 1500);
};
startMirror({ session, root, port, log: new CallLog(seDir(root)), mode: "manual" });
process.stderr.write(`se-manual: walking ${root}\nse-manual: open http://localhost:${port}\n`);
