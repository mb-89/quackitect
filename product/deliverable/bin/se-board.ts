#!/usr/bin/env node
// se-board — the live state board (owner sketch: status-dashboard).
// Layout is the owner's ruling, redline round 1: left = iterations only;
// middle = agent tabs over train-of-thought / call table / details, fixed
// thirds; right = bless / decisions / notes, fixed thirds. No footer.
// Every pane maximizes into a modal; clicks land in the details pane.
// The bless button is an owner act on the owner's own channel: channel=board.
// Zero deps. Port in use = another board is up: exit silently.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { Gate } from "../engine/gate.ts";
import { systematic } from "../engine/machines/systematic.ts";
import { BOARD_PORT } from "../engine/board.ts";
import { projectState, renderHandover, BOARD_VERSION } from "../engine/project.ts";
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
  :root { --line:#d0d0d0; --dim:#777; --ok:#2e7d32; --bad:#c62828; --warn:#f9a825; --mark:#1565c0; }
  * { box-sizing: border-box; margin: 0; }
  body { font: 14px/1.45 system-ui, sans-serif; color: #1e1e1e; background: #fafafa; height: 100vh; display: flex; flex-direction: column; }
  header { display: flex; gap: 1.5em; align-items: center; padding: .5em 1em; border-bottom: 1px solid var(--line); background: #fff; }
  header b { font-size: 16px; }
  #wd { margin-left: auto; display: flex; gap: .3em; }
  .wdot { width: .55em; height: .55em; border-radius: 50%; background: #e4e4e4; }
  .wdot.green { background: var(--ok); }
  .wdot.yellow { background: var(--warn); }
  .wdot.red { background: var(--bad); }
  main { flex: 1; display: grid; grid-template-columns: 1fr 1.7fr 1fr; min-height: 0; }
  .col { display: flex; flex-direction: column; min-height: 0; border-right: 1px solid var(--line); }
  .col:last-child { border-right: none; }
  .pane { flex: 1 1 0; min-height: 0; display: flex; flex-direction: column; border-bottom: 1px solid var(--line); padding: .5em .7em; background: #fafafa; }
  .pane:last-child { border-bottom: none; }
  .pane > h2 { display: flex; align-items: center; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--dim); margin: 0 0 .4em; }
  .max { margin-left: auto; border: none; background: none; color: var(--dim); cursor: pointer; font-size: 13px; padding: 0 .2em; }
  .max:hover { color: #1e1e1e; }
  .body { flex: 1; min-height: 0; overflow-y: auto; }
  #tabs { display: flex; gap: .3em; padding: .4em .7em 0; border-bottom: 1px solid var(--line); background: #fff; }
  .tab { padding: .25em .9em; border: 1px solid var(--line); border-bottom: none; border-radius: 6px 6px 0 0; background: #fff; font-size: 12px; }
  .tab.active { border-color: var(--mark); color: var(--mark); }
  .iterrow { display: flex; align-items: center; gap: .5em; padding: .18em .3em; cursor: pointer; border-radius: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .iterrow:hover { background: #eef; }
  .led { width: .6em; height: .6em; border-radius: 50%; background: #e4e4e4; flex: 0 0 auto; }
  .led.done { background: var(--ok); }
  .led.open { background: var(--warn); animation: pulse 1.2s ease-in-out infinite; }
  @keyframes pulse { 50% { opacity: .25; } }
  .hb { background: #fff; border: 1px solid var(--line); border-radius: 6px; padding: .4em .6em; margin-bottom: .5em; }
  .hb .age { color: var(--dim); font-size: 12px; }
  ul.todo { list-style: none; padding-left: .2em; font-size: 13px; }
  .tick { color: var(--ok); }
  .cross { color: var(--bad); }
  #filter { width: 100%; padding: .3em; margin-bottom: .4em; border: 1px solid var(--line); border-radius: 4px; }
  .lrow { display: grid; grid-template-columns: 4.6em 4.6em 4.6em minmax(6em, 9em) 1fr; gap: .5em; font: 11px ui-monospace, monospace; cursor: pointer; white-space: nowrap; padding: .08em .2em; }
  .lrow:hover { background: #eef; }
  .lrow span { overflow: hidden; text-overflow: ellipsis; }
  .lhead { font-weight: 600; color: var(--dim); cursor: default; }
  .lhead:hover { background: none; }
  #details pre, #modalbody pre { white-space: pre-wrap; word-break: break-word; font-size: 12px; background: #fff; border: 1px solid var(--line); border-radius: 6px; padding: .5em; }
  .card { background: #fff; border: 1px solid var(--line); border-radius: 6px; padding: .5em .6em; margin-bottom: .5em; }
  .call { padding: .1em .2em; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 13px; }
  .call:hover { background: #eef; }
  button { padding: .4em 1em; border: 1px solid var(--line); border-radius: 6px; cursor: pointer; background: #fff; }
  #blessBtn { background: var(--ok); color: #fff; border-color: var(--ok); }
  .dim { color: var(--dim); font-size: 12px; }
  #modal { position: fixed; inset: 0; display: none; background: rgba(30,30,30,.45); z-index: 10; padding: 4vh 4vw; }
  #modal.open { display: block; }
  #modalbox { background: #fafafa; border-radius: 8px; height: 100%; display: flex; flex-direction: column; padding: .8em 1em; }
  #modalbox > h2 { display: flex; align-items: center; font-size: 13px; text-transform: uppercase; letter-spacing: .06em; color: var(--dim); margin-bottom: .5em; }
  #modalbody { flex: 1; min-height: 0; overflow: auto; }
</style>
</head>
<body>
<header>
  <b id="product">…</b>
  <div id="wd" title="watchdog"><span class="wdot"></span><span class="wdot"></span><span class="wdot"></span></div>
</header>
<main>
  <div class="col">
    <div class="pane" id="p-iters"><h2>Iterations<button class="max" onclick="maximize('p-iters')">⛶</button></h2>
      <div class="body" id="iterlist"></div></div>
  </div>
  <div class="col">
    <div id="tabs"></div>
    <div class="pane" id="p-tot"><h2>Train of thought<button class="max" onclick="maximize('p-tot')">⛶</button></h2>
      <div class="body" id="tot"></div></div>
    <div class="pane" id="p-log"><h2>Log<button class="max" onclick="maximize('p-log')">⛶</button></h2>
      <input id="filter" placeholder="filter — click for help">
      <div class="body" id="feed"></div></div>
    <div class="pane" id="p-details"><h2>Details<button class="max" onclick="maximize('p-details')">⛶</button></h2>
      <div class="body" id="details"><pre>click anything</pre></div></div>
  </div>
  <div class="col">
    <div class="pane" id="p-bless"><h2>Bless<button class="max" onclick="maximize('p-bless')">⛶</button></h2>
      <div class="body" id="offer">no pending offer</div></div>
    <div class="pane" id="p-decisions"><h2>Decisions<button class="max" onclick="maximize('p-decisions')">⛶</button></h2>
      <div class="body" id="decisions"></div></div>
    <div class="pane" id="p-notes"><h2>Notes (private inbox)<button class="max" onclick="maximize('p-notes')">⛶</button></h2>
      <div class="body" id="notes"></div></div>
  </div>
</main>
<div id="modal" onclick="if(event.target===this)closeModal()">
  <div id="modalbox"><h2><span id="modaltitle"></span><button class="max" onclick="closeModal()">✕</button></h2>
    <div id="modalbody"></div></div>
</div>
<script>
let S = null;
let ITERS = [];
let maximized = null;
let wdTick = 0, wdFail = 0;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const el = (id) => document.getElementById(id);
function detail(obj) { el("details").innerHTML = "<pre>" + esc(typeof obj === "string" ? obj : JSON.stringify(obj, null, 2)) + "</pre>"; }
const FILTER_HELP = "The filter hides log rows.\\n\\nType any text. A row stays visible when its time, source, destination, tool, or info column contains that text. Case does not matter.\\n\\nExamples:\\n  file      only the file-lane calls\\n  se_git    only git calls\\n  09:4      calls from that minute\\n\\nClear the field to see every row again.";
function maximize(paneId) { maximized = paneId; syncModal(); el("modal").className = "open"; }
function closeModal() { maximized = null; el("modal").className = ""; }
function syncModal() {
  if (!maximized) return;
  const pane = el(maximized);
  el("modaltitle").textContent = pane.querySelector("h2").firstChild.textContent;
  el("modalbody").innerHTML = pane.querySelector(".body").innerHTML;
}
function watchdog() {
  const cls = wdFail === 0 ? "green" : wdFail < 3 ? "yellow" : "red";
  const dots = el("wd").children;
  for (let i = 0; i < 3; i++) dots[i].className = "wdot" + (i === wdTick % 3 ? " " + cls : "");
}
const iterNum = (id) => { const m = id.match(/^i(\\d+)/); return m ? Number(m[1]) : 999; };
function render() {
  if (!S) return;
  el("product").textContent = S.product;
  document.title = "se-board · " + S.product;
  el("tabs").innerHTML = S.agents.map((a, i) =>
    '<span class="tab' + (i === 0 ? " active" : "") + '">' + esc(a.name) + " · " + esc(a.role) + "</span>").join("");
  ITERS = S.iterations.filter(it => it.status !== "abandoned")
    .slice().sort((a, b) => iterNum(a.id) - iterNum(b.id) || a.id.localeCompare(b.id));
  el("iterlist").innerHTML = ITERS.map((it, i) =>
    '<div class="iterrow" onclick="detail(ITERS[' + i + '])">' +
    '<span class="led ' + (it.status === "closed" ? "done" : it.status === "open" ? "open" : "") + '"></span>' +
    esc(it.id) + "</div>").join("");
  const hb = S.heartbeat;
  el("tot").innerHTML =
    (hb ? '<div class="hb"><b>' + esc(hb.current_step) + "</b><br>next: " + esc(hb.next_milestone) +
      " · eta " + esc(hb.eta) + ' <span class="age">(' + Math.round(hb.age_s / 60) + "m ago)</span></div>" : "") +
    (hb && hb.todo ? '<ul class="todo">' + hb.todo.map(t => {
      if (t.startsWith("[x] ")) return '<li><span class="tick">✓</span> ' + esc(t.slice(4)) + "</li>";
      if (t.startsWith("[ ] ")) return "<li>○ " + esc(t.slice(4)) + "</li>";
      return "<li>" + esc(t) + "</li>";
    }).join("") + "</ul>" : "");
  const me = S.agents[0].name;
  const q = el("filter").value.toLowerCase();
  const rows = [];
  S.calls.forEach((c, i) => {
    const t = c.ts.slice(11, 19);
    const resp = c.ok ? '<span class="tick">✓ ok</span>'
      : '<span class="cross">✗ ' + esc(c.response && c.response.clause ? c.response.clause : "failed") + "</span>";
    rows.push(
      '<div class="lrow" onclick="detail(reqOf(' + i + '))"><span>' + t + "</span><span>" + esc(me) +
        "</span><span>se</span><span>" + esc(c.tool) + "</span><span>" + esc(c.intent ?? "") + "</span></div>",
      '<div class="lrow" onclick="detail(respOf(' + i + '))"><span>' + t + "</span><span>se</span><span>" + esc(me) +
        "</span><span>" + esc(c.tool) + "</span><span>" + resp + "</span></div>",
    );
  });
  el("feed").innerHTML =
    '<div class="lrow lhead"><span>time</span><span>source</span><span>dest</span><span>tool</span><span>info</span></div>' +
    rows.filter(r => !q || r.toLowerCase().includes(q)).join("");
  el("offer").innerHTML = S.offer
    ? "<pre>" + esc(S.offer.brief) + "</pre><button id=\\"blessBtn\\" onclick=\\"bless()\\">bless as offered</button> " +
      "<button onclick=\\"dismiss()\\">dismiss</button>"
    : '<span class="dim">no pending offer</span>';
  const seen = localStorage.getItem("handover-seen");
  el("decisions").innerHTML = (S.handover && seen !== S.session_started)
    ? '<div class="card"><b>Boot handover</b><div class="dim">the session state at admission</div>' +
      '<button onclick="showHandover()">read</button> <button onclick="handoverDone()">done</button></div>'
    : '<span class="dim">nothing to decide</span>';
  el("notes").innerHTML = (S.notes ?? []).map((n, i) =>
    '<div class="call" onclick="detail(S.notes[' + i + '])">' + esc(n.at.slice(5, 16)) + " " + esc(n.text.slice(0, 60)) + "</div>"
  ).join("") || '<span class="dim">empty</span>';
  syncModal();
}
function reqOf(i) { const c = S.calls[i]; return { direction: S.agents[0].name + " → se", ts: c.ts, tool: c.tool, args: c.detail }; }
function respOf(i) {
  const c = S.calls[i];
  return { direction: "se → " + S.agents[0].name, ts: c.ts, tool: c.tool, ok: c.ok,
    duration_ms: c.duration_ms, response: c.response ?? "ok" };
}
function showHandover() { el("modaltitle").textContent = "Boot handover"; el("modalbody").innerHTML = "<pre>" + esc(S.handover) + "</pre>"; maximized = null; el("modal").className = "open"; }
function handoverDone() { localStorage.setItem("handover-seen", S.session_started); render(); }
async function tick() {
  wdTick++;
  try {
    S = await (await fetch("/state.json")).json();
    wdFail = 0;
    render();
  } catch { wdFail++; }
  watchdog();
}
async function bless() {
  const r = await fetch("/bless", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ hash: S.offer.base_hash }) });
  detail(await r.json());
  tick();
}
async function dismiss() { await fetch("/dismiss", { method: "POST" }); tick(); }
el("filter").addEventListener("input", render);
el("filter").addEventListener("focus", () => detail(FILTER_HELP));
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
      const s = projectState(root);
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ...s, handover: renderHandover(s) }));
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
