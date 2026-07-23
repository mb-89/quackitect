#!/usr/bin/env node
// se-board — the live state board (owner sketch: status-dashboard).
// Layout is the owner's ruling, redline round 4: narrow resizable sidebars.
// Middle splits at 500px: state-machine column (browsable stack, current
// state lit) beside the train-of-thought column (current state / log / log
// details in thirds); below 500px the two collapse into sub-tabs per agent.
// Log: one line per command — a command and its response are one thing.
// Right sidebar, fixed thirds: decisions (a bless is one card, one shown
// at a time) / notes / details (the generic click fallback). No footer.
// The bless button is an owner act on the owner's own channel: channel=board.
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
  main { flex: 1; display: grid; grid-template-columns: var(--wl, 230px) 4px minmax(0, 1fr) 4px var(--wr, 320px); min-height: 0; }
  .col { display: flex; flex-direction: column; min-height: 0; }
  .gutter { cursor: col-resize; border-left: 1px solid var(--line); }
  .gutter:hover { background: #dde4f2; }
  .pane { flex: 1 1 0; min-height: 0; display: flex; flex-direction: column; border-bottom: 1px solid var(--line); padding: .5em .7em; background: #fafafa; }
  .pane:last-child { border-bottom: none; }
  .pane > h2 { display: flex; align-items: center; font-size: 12px; text-transform: uppercase; letter-spacing: .06em; color: var(--dim); margin: 0 0 .4em; }
  .max { margin-left: auto; border: none; background: none; color: var(--dim); cursor: pointer; font-size: 13px; padding: 0 .2em; }
  .max:hover { color: #1e1e1e; }
  .body { flex: 1; min-height: 0; overflow-y: auto; }
  #midsplit { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  body.mid-narrow #midsplit { grid-template-columns: minmax(0, 1fr); }
  #sm-col { display: flex; flex-direction: column; min-height: 0; border-right: 1px solid var(--line); }
  body.mid-narrow #sm-col { border-right: none; }
  #tot-col { display: flex; flex-direction: column; min-height: 0; }
  #tabs { display: flex; gap: .3em; border-bottom: 1px solid var(--line); }
  #tabslot-wide { padding: .4em .7em 0; }
  #tabslot-narrow { padding: .4em .7em 0; border-bottom: 1px solid var(--line); background: #fff; }
  .tab { padding: .25em .9em; border: 1px solid var(--line); border-bottom: none; border-radius: 6px 6px 0 0; background: #fff; font-size: 12px; cursor: pointer; }
  .tab.active { border-color: var(--mark); color: var(--mark); }
  #subtabs { display: flex; gap: .3em; margin-top: .3em; }
  #smcrumb { margin-bottom: .4em; font-size: 12px; }
  .crumb { cursor: pointer; color: var(--dim); }
  .crumb.active { color: var(--mark); font-weight: 600; }
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
  .lrow { display: grid; grid-template-columns: 4.8em 4.5em 3em minmax(7em, 10em) 1fr 6em; gap: .5em; font: 12px ui-monospace, monospace; cursor: pointer; white-space: nowrap; padding: .08em .2em; }
  .lrow:hover { background: #eef; }
  .lrow span { overflow: hidden; text-overflow: ellipsis; }
  .lhead { font-weight: 600; color: var(--dim); cursor: default; }
  .lhead:hover { background: none; }
  #details pre, #logdetail pre, #modalbody pre { white-space: pre-wrap; word-break: break-word; font-size: 12px; background: #fff; border: 1px solid var(--line); border-radius: 6px; padding: .5em; }
  .card { background: #fff; border: 1px solid var(--line); border-radius: 6px; padding: .5em .6em; margin-bottom: .5em; }
  .card pre { max-height: 9em; overflow-y: auto; white-space: pre-wrap; word-break: break-word; font-size: 11px; margin: .4em 0; }
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
  <div class="gutter" id="gl"></div>
  <div class="col">
    <div id="tabslot-narrow" style="display:none">
      <div id="subtabs"><span class="tab" id="st-sm" onclick="setSub('sm')">state machine</span><span class="tab" id="st-tot" onclick="setSub('tot')">train of thought</span></div>
    </div>
    <div id="midsplit">
      <div id="sm-col">
        <div id="tabslot-wide"><div id="tabs"></div></div>
        <div class="pane" id="p-sm"><h2>State machine<button class="max" onclick="maximize('p-sm')">⛶</button></h2>
          <div id="smcrumb"></div>
          <div class="body" id="smlist"></div></div>
      </div>
      <div id="tot-col">
        <div class="pane" id="p-tot"><h2>Current state<button class="max" onclick="maximize('p-tot')">⛶</button></h2>
          <div class="body" id="tot"></div></div>
        <div class="pane" id="p-log"><h2>Log<button class="max" onclick="maximize('p-log')">⛶</button></h2>
          <input id="filter" placeholder="filter — click for help">
          <div class="body" id="feed"></div></div>
        <div class="pane" id="p-logdetail"><h2>Log details<button class="max" onclick="maximize('p-logdetail')">⛶</button></h2>
          <div class="body" id="logdetail"><pre>click a log row</pre></div></div>
      </div>
    </div>
  </div>
  <div class="gutter" id="gr"></div>
  <div class="col">
    <div class="pane" id="p-decisions"><h2>Decisions<span id="decnav" style="margin-left:.6em; display:none"><button class="max" onclick="decStep(-1)">◀</button><span id="deccount" class="dim"></span><button class="max" onclick="decStep(1)">▶</button></span><button class="max" onclick="maximize('p-decisions')">⛶</button></h2>
      <div class="body" id="decisions"></div></div>
    <div class="pane" id="p-notes"><h2>Notes (private inbox)<button class="max" onclick="maximize('p-notes')">⛶</button></h2>
      <div class="body" id="notes"></div></div>
    <div class="pane" id="p-details"><h2>Details<button class="max" onclick="maximize('p-details')">⛶</button></h2>
      <div class="body" id="details"><pre>click anything</pre></div></div>
  </div>
</main>
<div id="modal" onclick="if(event.target===this)closeModal()">
  <div id="modalbox"><h2><span id="modaltitle"></span><button class="max" onclick="closeModal()">✕</button></h2>
    <div id="modalbody"></div></div>
</div>
<script>
let S = null;
let ITERS = [];
let DECS = [], decIdx = 0;
let maximized = null;
let wdTick = 0, wdFail = 0;
let SMVIEW = -1;
let subTab = "tot";
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const el = (id) => document.getElementById(id);
function detail(obj) { el("details").innerHTML = "<pre>" + esc(typeof obj === "string" ? obj : JSON.stringify(obj, null, 2)) + "</pre>"; }
function detailLog(obj) { el("logdetail").innerHTML = "<pre>" + esc(typeof obj === "string" ? obj : JSON.stringify(obj, null, 2)) + "</pre>"; }
const FILTER_HELP = "The filter hides log rows.\\n\\nType any text. A row stays visible when its time, source, destination, tool, info, or result column contains that text. Case does not matter.\\n\\nExamples:\\n  file      only the file-lane calls\\n  se_git    only git calls\\n  09:4      calls from that minute\\n\\nClear the field to see every row again.";
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
function setSub(t) { subTab = t; layoutMiddle(); }
function layoutMiddle() {
  const wide = el("midsplit").offsetWidth > 500;
  document.body.classList.toggle("mid-narrow", !wide);
  el("tabslot-narrow").style.display = wide ? "none" : "";
  const slot = wide ? el("tabslot-wide") : el("tabslot-narrow");
  if (el("tabs").parentElement !== slot) slot.prepend(el("tabs"));
  el("sm-col").style.display = wide || subTab === "sm" ? "" : "none";
  el("tot-col").style.display = wide || subTab === "tot" ? "" : "none";
  el("st-sm").className = "tab" + (subTab === "sm" ? " active" : "");
  el("st-tot").className = "tab" + (subTab === "tot" ? " active" : "");
}
function smView(i) { SMVIEW = i; render(); }
function renderSM() {
  const stack = S.machine_stack ?? [];
  const idx = SMVIEW < 0 || SMVIEW >= stack.length ? stack.length - 1 : SMVIEW;
  el("smcrumb").innerHTML = stack.map((m, i) =>
    '<span class="crumb' + (i === idx ? " active" : "") + '" onclick="smView(' + i + ')">' + esc(m.id) + "</span>"
  ).join(" ▸ ");
  const f = stack[idx];
  el("smlist").innerHTML = f ? f.states.map((st, i) =>
    '<div class="iterrow" onclick="detail(S.machine_stack[' + idx + '].states[' + i + '])">' +
    '<span class="led ' + (st.status === "done" ? "done" : st.status === "current" ? "open" : "") + '"></span>' +
    esc(st.id) + "</div>").join("") : "";
}
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
  renderSM();
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
  const rows = S.calls.map((c, i) => {
    const res = c.ok ? '<span class="tick">✓</span>'
      : '<span class="cross">✗ ' + esc(c.response && c.response.clause ? c.response.clause : "failed") + "</span>";
    return '<div class="lrow" onclick="detailLog(S.calls[' + i + '])"><span>' + c.ts.slice(11, 19) + "</span><span>" +
      esc(me) + "</span><span>se</span><span>" + esc(c.tool) + "</span><span>" + esc(c.intent ?? "") + "</span><span>" + res + "</span></div>";
  });
  el("feed").innerHTML =
    '<div class="lrow lhead"><span>time</span><span>source</span><span>dest</span><span>tool</span><span>info</span><span>result</span></div>' +
    rows.filter(r => !q || r.toLowerCase().includes(q)).join("");
  DECS = [];
  if (S.offer) {
    DECS.push('<div class="card"><b>Gate: ' + esc(S.offer.iteration) + "</b><pre>" + esc(S.offer.brief) + "</pre>" +
      "<button id=\\"blessBtn\\" onclick=\\"bless()\\">bless as offered</button> " +
      "<button onclick=\\"dismiss()\\">dismiss</button></div>");
  }
  if (decIdx >= DECS.length) decIdx = Math.max(0, DECS.length - 1);
  el("decisions").innerHTML = DECS[decIdx] ?? '<span class="dim">nothing to decide</span>';
  el("decnav").style.display = DECS.length > 1 ? "" : "none";
  el("deccount").textContent = (decIdx + 1) + "/" + DECS.length;
  el("notes").innerHTML = (S.notes ?? []).map((n, i) =>
    '<div class="call" onclick="detail(S.notes[' + i + '])">' + esc(n.at.slice(5, 16)) + " " + esc(n.text.slice(0, 60)) + "</div>"
  ).join("") || '<span class="dim">empty</span>';
  syncModal();
}
function decStep(d) { if (DECS.length > 1) { decIdx = (decIdx + d + DECS.length) % DECS.length; render(); } }
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
function initResize() {
  const rootEl = document.documentElement;
  for (const [k, v] of [["--wl", "sb-l"], ["--wr", "sb-r"]]) {
    const saved = localStorage.getItem(v);
    if (saved) rootEl.style.setProperty(k, saved);
  }
  const drag = (id, calc, varName, key) => {
    el(id).addEventListener("mousedown", (e) => {
      e.preventDefault();
      const move = (ev) => {
        const w = Math.max(140, Math.min(window.innerWidth / 2, calc(ev)));
        rootEl.style.setProperty(varName, w + "px");
        localStorage.setItem(key, w + "px");
        layoutMiddle();
      };
      const up = () => { removeEventListener("mousemove", move); removeEventListener("mouseup", up); };
      addEventListener("mousemove", move);
      addEventListener("mouseup", up);
    });
  };
  drag("gl", (ev) => ev.clientX, "--wl", "sb-l");
  drag("gr", (ev) => window.innerWidth - ev.clientX, "--wr", "sb-r");
}
initResize();
addEventListener("resize", layoutMiddle);
el("filter").addEventListener("input", render);
el("filter").addEventListener("focus", () => detailLog(FILTER_HELP));
layoutMiddle();
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
