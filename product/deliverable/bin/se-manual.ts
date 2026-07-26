// se-manual — walk the machines yourself. A tiny local server: the Mirror
// as the view, the tick as the only control. The same Session the agent
// would drive; manual ticks land in the call log like any other call.
//
//   node bin/se-manual.ts --root <project root> [--port 7333]
//
// tick · info     GET /        (tick without arguments: look, don't move)
// tick · advance  POST /tick   (tick with arguments: complete and move on)
// JSON            GET /api/tick
import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { CallLog } from "../engine/calllog.ts";
import { Rejection } from "../engine/errors.ts";
import { renderMirror, type MirrorState } from "../engine/render.ts";
import { seDir } from "../engine/paths.ts";
import { Session } from "../engine/session.ts";

function argValue(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

if (process.argv.some((a) => a === "--help" || a === "-h" || a === "-?")) {
  process.stdout.write(`se-manual — walk the machines yourself (the Mirror, manual mode)

  node bin/se-manual.ts --root <project root> [--port 7333]

  GET  /            the mirror (tick · info implied: looking never moves)
  POST /tick        tick with arguments: complete the current state, move on
  GET  /api/tick    the tick info packet as JSON
  GET  /widget/machine | /widget/details    single widgets (tab/window)
  --help            this text (-h, -?)
`);
  process.exit(0);
}

const root = resolve(argValue("--root") ?? process.cwd());
if (!existsSync(root)) {
  process.stderr.write(`se-manual: root does not exist: ${root}\n`);
  process.exit(1);
}
const port = Number(argValue("--port") ?? 7333);

const log = new CallLog(seDir(root));
const state: MirrorState = { session: new Session(root), root, lastPacket: undefined, mode: "manual" };

const server = createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${port}`);
  try {
    if (req.method === "POST" && url.pathname === "/tick") {
      const started = Date.now();
      try {
        state.lastPacket = state.session.tickAdvance();
        log.append({ tool: "manual_tick", args: { advance: true }, ok: true, outcome: "result", duration_ms: Date.now() - started, response: state.lastPacket });
      } catch (e) {
        if (!(e instanceof Rejection)) throw e;
        state.lastPacket = e.toJSON();
        log.append({ tool: "manual_tick", args: { advance: true }, ok: false, outcome: "rejected", duration_ms: Date.now() - started, response: state.lastPacket });
      }
      res.writeHead(303, { location: "/" });
      res.end();
      return;
    }
    if (url.pathname === "/api/tick") {
      res.writeHead(200, { "content-type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(state.session.tickInfo(), null, 2));
      return;
    }
    if (url.pathname === "/widget/machine" || url.pathname === "/widget/details") {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(renderMirror(state, url.pathname === "/widget/machine" ? "machine" : "details", url.searchParams.get("view") ?? undefined));
      return;
    }
    // GET / — tick without arguments: information about where we are.
    // ?view=<machine> browses a machine without moving the walk.
    state.lastPacket = state.session.tickInfo();
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(renderMirror(state, undefined, url.searchParams.get("view") ?? undefined));
  } catch (e) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end(String((e as Error).stack ?? e));
  }
});

server.listen(port, () => {
  process.stderr.write(`se-manual: walking ${root}\nse-manual: open http://localhost:${port}\n`);
});
