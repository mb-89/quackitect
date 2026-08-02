// se-manual — MANUAL MODE: walk the machines yourself, NO agent attached.
// The shared mirror server (engine/mirror.ts) standing alone.
//
// This is what runs when there is no LLM. Either you asked for it (RUNME
// --manual), or no claude CLI was found. With an agent running you do not
// need this — se-mcp embeds the same mirror on the same walk.
//
//   node engine/bin/se-manual.ts --root <project root> [--port 7333]
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { CallLog } from "../calllog.ts";
import { startMirror } from "../mirror.ts";
import { openPanel } from "../panel.ts";
import { seDir } from "../paths.ts";
import { Session } from "../session.ts";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

if (process.argv.some((a) => a === "--help" || a === "-h" || a === "-?")) {
  process.stdout.write(`se-manual — walk the machines yourself (the Mirror, no agent)

  node engine/bin/se-manual.ts --root <project root> [--port 7333]

  --root            the project root (holds product/ and workspace/)
  --port            the mirror's HTTP port. Default 7333.
  --mirror-port     the same port under se-mcp's spelling, so one RUNME
                    command line works in both modes. Env: SE_MIRROR_PORT.
  --help            this text (-h, -?)

  GET  /            the panel (looking never moves the walk)
  POST /autonomy    move the session autonomy (the slider posts here)
  GET  /api/packet  where the walk stands, as JSON
  GET  /api/alive   position + autonomy — the mirror polls this
  GET  /widget/machine | /widget/details    single widgets (tab/window)

  Reaching end shuts the server down — the mirror turns red: session over.
`);
  process.exit(0);
}

const root = resolve(argValue("--root") ?? process.cwd());
if (!existsSync(root)) {
  process.stderr.write(`se-manual: root does not exist: ${root}\n`);
  process.exit(1);
}
const port = Number(argValue("--port") ?? argValue("--mirror-port") ?? process.env.SE_MIRROR_PORT ?? 7333);

const session = new Session(root);
session.onClosed = () => {
  process.stderr.write("se-manual: the machine reached end — session over, shutting down\n");
  setTimeout(() => process.exit(0), 1500);
};
startMirror({ session, root, port, log: new CallLog(seDir(root)), mode: "manual" });
process.stderr.write(`se-manual: walking ${root}\nse-manual: open http://localhost:${port}\n`);
// Manual mode has no other surface — the mirror IS the session, so it opens.
if (process.env.SE_PANEL_SUPPRESS !== "1") openPanel(`http://localhost:${port}/`);
