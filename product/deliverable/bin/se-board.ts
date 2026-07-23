#!/usr/bin/env node
// se-board — the live state board (owner sketch: status-dashboard).
// Serves the projection; renders header, iterations, train-of-thought
// (todo + wireshark feed), context details, bless panel. The bless button
// is an owner act on the owner's own channel: channel=board.
// Zero deps. Port in use = another board is up: exit silently.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { Gate } from "../engine/gate.ts";
import { systematic } from "../engine/machines/systematic.ts";
import { BOARD_PORT } from "../engine/board.ts";
import { projectState, BOARD_VERSION } from "../engine/project.ts";
import { Rejection } from "../engine/errors.ts";

const args = process.argv.slice(2);
const rootIdx = args.indexOf("--root");
const root = resolve(rootIdx === -1 ? "." : args[rootIdx + 1]);
const portIdx = args.indexOf("--port");
const port = portIdx === -1 ? BOARD_PORT : Number(args[portIdx + 1]);
const noOpen = args.includes("--no-open") || process.env.SE_STATE_DIR !== undefined;

// The page polls /state.json every 2s — a recent poll IS a live tab.
const VIEWER_FRESH_MS = 6000;
let lastSeen = 0;
let liveUrl = `http://localhost:${port}/`;

function openBrowser(): void {
  if (noOpen) return;
  const cmd =
    process.platform === "win32"
      ? spawn("cmd", ["/c", "start", "", liveUrl], { detached: true, stdio: "ignore" })
      : spawn(process.platform === "darwin" ? "open" : "xdg-open", [liveUrl], { detached: true, stdio: "ignore" });
  cmd.on("error", () => {});
  cmd.unref();
}

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>se-board</title>
<style>
  :root { --line:#d0d0d0; --dim:#777; --ok:#2e7d32; --bad:#c62828; --mark:#1565c0; }
  * { box-sizing: border-box; margin: 0; }
  body { font: 14px/1.45 system-ui, sans-serif; color: #1e1e1e; background: #fafafa; height: 100vh; display: flex; flex-direction: column; }
  header, footer { display: flex; gap: 1.5em; align-items: baseline; padding: .5em 1em; border-bottom: 1px solid var(--line); background: #fff; }
  footer { border-top: 1px solid var(--line); border-bottom: none; color: var(--dim); font-size: 12px; }
  header b { font-size: 16px; }
  #dot { width:.7em; height:.7em; border-radius:50%; background:var(--bad); display:inline-block; margin-left:auto; }
  #dot.ok { background: var(--ok); }
  main { flex: 1; display: grid; grid-template-columns: 1fr 1.4fr 1fr; gap: 0; min-height: 0; }
  section { border-right: 1px solid var(--line); overflow-y: auto; padding: .7em; min-height: 0; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--dim); margin: .3em 0 .5em; }
  .iter { padding: .4em .5em; border: 1px solid var(--line); border-radius: 6px; margin-bottom: .5em; cursor: pointer; background: #fff; }
  .iter.open { border-color: var(--mark); }
  .iter .flag { color: var(--mark); font-size: 12px; }
  .steps { color: var(--dim); font-size: 12px; }
  #tot { display: flex; flex-direction: column; min-height: 0; }
  #todo { flex: 0 0 auto; max-height: 45%; overflow-y: auto; border-bottom: 1px solid var(--line); padding-bottom: .5em; margin-bottom: .5em; }
  #feedwrap { flex: 1; min-height: 0; display: flex; flex-direction: column; }
  #filter { width: 100%; padding: .3em; margin-bottom: .4em; border: 1px solid var(--line); border-radius: 4px; }
  #feed { flex: 1; overflow-y: auto; font-family: ui-monospace, monospace; font-size: 12px; }
  .call { padding: .1em .2em; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .call.err { color: var(--bad); }
  .call:hover { background: #eef; }
  #details pre { white-space: pre-wrap; word-break: break-word; font-size: 12px; background: #fff; border: 1px solid var(--line); border-radius: 6px; padding: .5em; }
  #bless { border-top: 1px solid var(--line); margin-top: .7em; padding-top: .5em; }
  #bless pre { max-height: 14em; overflow-y: auto; }
  button { padding: .45em 1.1em; border: 1px solid var(--line); border-radius: 6px; cursor: pointer; background: #fff; }
  #blessBtn { background: var(--ok); color: #fff; border-color: var(--ok); }
  .hb { background: #fff; border: 1px solid var(--line); border-radius: 6px; padding: .4em .6em; margin-bottom: .5em; }
  .hb .age { color: var(--dim); font-size: 12px; }
  ul.todo { list-style: none; padding-left: .2em; }
</style>
</head>
<body>
<header>
  <b id="product">…</b>
  <span id="iterline" class="steps">–</span>
  <span id="dot" title="connection"></span>
</header>
<main>
  <section id="iters"><h2>Iterations</h2><div id="iterlist"></div>
    <h2 style="margin-top:1em">Notes (private inbox)</h2><div id="notes"></div></section>
  <section id="tot"><h2>Train of thought</h2>
    <div id="todo"></div>
    <div id="feedwrap">
      <input id="filter" placeholder="filter messages (wireshark-style substring)">
      <div id="feed"></div>
    </div>
  </section>
  <section>
    <h2>Details</h2><div id="details"><pre>click anything</pre></div>
    <div id="bless"><h2>Bless / decision</h2><div id="offer">no pending offer</div></div>
  </section>
</main>
<footer>
  <span id="modules"></span><span id="verify"></span><span id="grants"></span>
  <span style="margin-left:auto">se-board ${BOARD_VERSION}</span>
</footer>
<script>
let S = null;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const el = (id) => document.getElementById(id);
function detail(obj) { el("details").innerHTML = "<pre>" + esc(typeof obj === "string" ? obj : JSON.stringify(obj, null, 2)) + "</pre>"; }
function render() {
  if (!S) return;
  el("product").textContent = S.product;
  el("iterline").textContent = S.open_iteration ? S.open_iteration + " · " + (S.iterations.find(i => i.id === S.open_iteration)?.current ?? "") : "no open iteration";
  el("iterlist").innerHTML = S.iterations.map((it, i) =>
    '<div class="iter ' + (it.status === "open" ? "open" : "") + '" onclick="detail(S.iterations[' + i + '])">' +
    "<b>" + esc(it.id) + "</b> · " + esc(it.status) + (it.worked_on ? ' <span class="flag">● worked on</span>' : "") +
    '<div class="steps">' + (it.status === "planned"
      ? it.steps.length + " steps · " + it.steps.filter(s => s.owner).length + " need you"
      : it.steps.map(s => (s.done ? "✓" : "○") + " " + esc(s.state)).join(" → ")) + "</div></div>"
  ).join("");
  el("notes").innerHTML = (S.notes ?? []).map((n, i) =>
    '<div class="call" onclick="detail(S.notes[' + i + '])">' + esc(n.at.slice(5, 16)) + " " + esc(n.text.slice(0, 60)) + "</div>"
  ).join("") || '<span class="steps">empty</span>';
  const hb = S.heartbeat;
  el("todo").innerHTML =
    (hb ? '<div class="hb"><b>' + esc(hb.current_step) + "</b><br>next: " + esc(hb.next_milestone) +
      ' · eta ' + esc(hb.eta) + ' <span class="age">(' + Math.round(hb.age_s / 60) + "m ago)</span></div>" : "") +
    (hb && hb.todo ? '<ul class="todo">' + hb.todo.map(t => "<li>" + esc(t) + "</li>").join("") + "</ul>" : "");
  const q = el("filter").value.toLowerCase();
  el("feed").innerHTML = S.calls
    .map((c, i) => ({ c, i }))
    .filter(x => !q || (x.c.tool + x.c.detail + x.c.ts).toLowerCase().includes(q))
    .map(x => '<div class="call ' + (x.c.ok ? "" : "err") + '" onclick="detail(S.calls[' + x.i + '])">' +
      esc(x.c.ts.slice(11, 19)) + " " + (x.c.ok ? "·" : "✗") + " " + esc(x.c.tool) + " " + esc(x.c.detail) + "</div>").join("");
  el("offer").innerHTML = S.offer
    ? "<pre>" + esc(S.offer.brief) + "</pre><button id=\\"blessBtn\\" onclick=\\"bless()\\">bless as offered</button> " +
      "<button onclick=\\"dismiss()\\">dismiss</button>"
    : "no pending offer";
  el("modules").textContent = S.modules.map(m => m.id + (m.status === "active" ? " ✓" : " ✗")).join("  ");
  el("verify").textContent = S.last_verify ? ("verify " + (S.last_verify.ok ? "✓" : "✗ exit " + S.last_verify.exit)) : "";
  el("grants").textContent = S.grants.length + " grants";
}
async function tick() {
  try {
    S = await (await fetch("/state.json")).json();
    el("dot").className = "ok";
    document.title = "se-board · " + (S.open_iteration ?? S.product);
    render();
  } catch { el("dot").className = ""; }
}
async function bless() {
  const r = await fetch("/bless", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ hash: S.offer.base_hash }) });
  detail(await r.json());
  tick();
}
async function dismiss() { await fetch("/dismiss", { method: "POST" }); tick(); }
el("filter").addEventListener("input", render);
tick();
setInterval(tick, 2000);
</script>
</body>
</html>
`;

function readBody(req: import("node:http").IncomingMessage): Promise<string> {
  return new Promise((res) => {
    let body = "";
    req.on("data", (c: Buffer) => (body += c.toString()));
    req.on("end", () => res(body));
  });
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(PAGE);
    } else if (req.method === "GET" && req.url === "/state.json") {
      lastSeen = Date.now();
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify(projectState(root)));
    } else if (req.method === "POST" && req.url === "/open") {
      const viewerRecent = Date.now() - lastSeen < VIEWER_FRESH_MS;
      if (!viewerRecent) openBrowser();
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ viewer_recent: viewerRecent, opened: !viewerRecent && !noOpen }));
    } else if (req.method === "POST" && req.url === "/bless") {
      const { hash } = JSON.parse(await readBody(req)) as { hash: string };
      const grant = new Gate(root).bless(systematic, hash, { channel: "board", adjudicated_by: "owner" });
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ blessed: true, grant }));
    } else if (req.method === "POST" && req.url === "/dismiss") {
      new Gate(root).dismiss();
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ dismissed: true }));
    } else {
      res.writeHead(404);
      res.end();
    }
  } catch (e) {
    const payload = e instanceof Rejection ? { error: e.clause, expected: e.expected, got: e.got } : { error: String(e) };
    res.writeHead(e instanceof Rejection ? 409 : 500, { "content-type": "application/json" });
    res.end(JSON.stringify(payload));
  }
});

server.on("error", (e: NodeJS.ErrnoException) => {
  // Port in use = a board is already serving this machine; nothing to do.
  process.exit(e.code === "EADDRINUSE" ? 0 : 1);
});

server.listen(port, "127.0.0.1", () => {
  const bound = (server.address() as { port: number }).port;
  liveUrl = `http://localhost:${bound}/`;
  console.log(`se-board ${BOARD_VERSION} — ${liveUrl} (root: ${root})`);
  openBrowser();
});
