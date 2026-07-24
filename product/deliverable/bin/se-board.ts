#!/usr/bin/env node
// se-board — the live state board (owner sketch: status-dashboard).
// Layout is the owner's ruling, redline round 6: narrow resizable sidebars.
// The agent tab (mallard) tops the middle; under it, state machine and
// train of thought — side by side when both columns get 500px, sub-tabs
// otherwise. The state machine renders as a diagram: start dot, boxed
// states, dashed groups, terminal end node; double-click dives into a
// nested machine. Log and notes are uniform tables: headers, per-table
// filters with per-table help, drag-resizable columns; timestamps render
// in the machine's local timezone. Filter help lands in the generic
// details, log rows in the dedicated log details, notes rows generic.
// Right sidebar, thirds aligned to the middle's: decisions / notes /
// details. No footer.
// The bless button is an owner act on the owner's own channel: channel=board.
// Zero deps. Port in use = another board is up: exit silently.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { Gate } from "../engine/gate.ts";
import { requireSystematic } from "../engine/machines/load.ts";
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
  #agentbar { padding: .4em .7em 0; background: #fff; }
  #tabs { display: flex; gap: .3em; border-bottom: 1px solid var(--line); }
  #subtabbar { display: none; padding: .3em .7em 0; background: #fff; border-bottom: 1px solid var(--line); }
  body.mid-narrow #subtabbar { display: flex; gap: .3em; }
  .tab { padding: .25em .9em; border: 1px solid var(--line); border-bottom: none; border-radius: 6px 6px 0 0; background: #fff; font-size: 12px; cursor: pointer; }
  .tab.active { border-color: var(--mark); color: var(--mark); }
  #midsplit { flex: 1; min-height: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  body.mid-narrow #midsplit { grid-template-columns: minmax(0, 1fr); }
  #sm-col { display: flex; flex-direction: column; min-height: 0; border-right: 1px solid var(--line); }
  body.mid-narrow #sm-col { border-right: none; }
  #tot-col { display: flex; flex-direction: column; min-height: 0; }
  #smcrumb { margin-bottom: .4em; font-size: 12px; }
  .crumb { cursor: pointer; color: var(--dim); }
  .crumb.active { color: var(--mark); font-weight: 600; }
  .smwrap { display: flex; flex-direction: column; align-items: center; padding: .3em 0; }
  .smstart { width: .8em; height: .8em; border-radius: 50%; background: #1e1e1e; }
  .smend { width: 1.1em; height: 1.1em; border-radius: 50%; border: 2px solid #1e1e1e; display: flex; align-items: center; justify-content: center; cursor: pointer; }
  .smend::after { content: ""; width: .5em; height: .5em; border-radius: 50%; background: #1e1e1e; }
  .smend.current { border-color: var(--warn); animation: pulse 2.4s ease-in-out infinite; }
  .smend.done { border-color: var(--ok); }
  .smconn { color: var(--dim); font-size: 10px; line-height: 1.2; }
  .smnode { border: 1.5px solid #9a9a9a; border-radius: 10px; padding: .2em 1.1em; margin: .05em 0; cursor: pointer; background: #fff; min-width: 9em; text-align: center; }
  .smnode.done { border-color: var(--ok); background: #eaf4ea; }
  .smnode.current { border-color: var(--warn); background: #fdf6e0; animation: pulse 2.4s ease-in-out infinite; }
  .smgroup { border: 1px dashed #9a9a9a; border-radius: 10px; padding: .3em .8em .45em; margin: .05em 0; display: flex; flex-direction: column; align-items: center; }
  .smglabel { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: var(--dim); align-self: flex-start; margin-bottom: .15em; }
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
  .tfilter { width: 100%; padding: .3em; margin-bottom: .4em; border: 1px solid var(--line); border-radius: 4px; }
  .trow { display: grid; gap: .5em; font: 12px ui-monospace, monospace; cursor: pointer; white-space: nowrap; padding: .08em .2em; }
  .trow:hover { background: #eef; }
  .trow span { overflow: hidden; text-overflow: ellipsis; }
  .trow.log { grid-template-columns: var(--cols-log, 5em 4.5em 3em 12em 1fr); }
  .trow.note { grid-template-columns: var(--cols-note, 7em 1fr); }
  .thead { font-weight: 600; color: var(--dim); cursor: default; }
  .thead:hover { background: none; }
  .thead span { position: relative; overflow: visible; }
  .colgrip { position: absolute; right: -4px; top: -2px; bottom: -2px; width: 7px; cursor: col-resize; }
  .colgrip:hover { background: #dde4f2; }
  #details pre, #logdetail pre, #modalbody pre { white-space: pre-wrap; word-break: break-word; font-size: 12px; background: #fff; border: 1px solid var(--line); border-radius: 6px; padding: .5em; }
  .card { background: #fff; border: 1px solid var(--line); border-radius: 6px; padding: .5em .6em; margin-bottom: .5em; }
  .card pre { max-height: 9em; overflow-y: auto; white-space: pre-wrap; word-break: break-word; font-size: 11px; margin: .4em 0; }
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
    <div id="agentbar"><div id="tabs"></div></div>
    <div id="subtabbar"><span class="tab" id="st-sm" onclick="setSub('sm')">state machine</span><span class="tab" id="st-tot" onclick="setSub('tot')">train of thought</span></div>
    <div id="midsplit">
      <div id="sm-col">
        <div class="pane" id="p-sm"><h2>State machine<button class="max" onclick="maximize('p-sm')">⛶</button></h2>
          <div id="smcrumb"></div>
          <div class="body" id="smlist"></div></div>
      </div>
      <div id="tot-col">
        <div class="pane" id="p-tot"><h2>Last update<button class="max" onclick="maximize('p-tot')">⛶</button></h2>
          <div class="body" id="tot"></div></div>
        <div class="pane" id="p-log"><h2>Log<button class="max" onclick="maximize('p-log')">⛶</button></h2>
          <input id="lfilter" class="tfilter" placeholder="filter — click for help">
          <div class="body" id="feed"></div></div>
        <div class="pane" id="p-logdetail"><h2>Log details<button class="max" onclick="maximize('p-logdetail')">⛶</button></h2>
          <div class="body" id="logdetail"><pre>click a log row</pre></div></div>
      </div>
    </div>
  </div>
  <div class="gutter" id="gr"></div>
  <div class="col">
    <div id="rspacer"></div>
    <div class="pane" id="p-decisions"><h2>Decisions<span id="decnav" style="margin-left:.6em; display:none"><button class="max" onclick="decStep(-1)">◀</button><span id="deccount" class="dim"></span><button class="max" onclick="decStep(1)">▶</button></span><button class="max" onclick="maximize('p-decisions')">⛶</button></h2>
      <div class="body" id="decisions"></div></div>
    <div class="pane" id="p-notes"><h2>Notes (private inbox)<button class="max" onclick="maximize('p-notes')">⛶</button></h2>
      <input id="nfilter" class="tfilter" placeholder="filter — click for help">
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
const p2 = (n) => String(n).padStart(2, "0");
function fmtT(iso) { const d = new Date(iso); return p2(d.getHours()) + ":" + p2(d.getMinutes()) + ":" + p2(d.getSeconds()); }
function fmtD(iso) { const d = new Date(iso); return p2(d.getMonth() + 1) + "-" + p2(d.getDate()) + " " + p2(d.getHours()) + ":" + p2(d.getMinutes()); }
function detail(obj) { el("details").innerHTML = "<pre>" + esc(typeof obj === "string" ? obj : JSON.stringify(obj, null, 2)) + "</pre>"; }
function detailLog(obj) { el("logdetail").innerHTML = "<pre>" + esc(typeof obj === "string" ? obj : JSON.stringify(obj, null, 2)) + "</pre>"; }
const HELP = {
  log: "The log filter hides rows.\\n\\nType any text. A row stays visible when its time, source, dest, tool, or result contains it. Case does not matter.\\n\\nExamples:\\n  se_git    only git calls\\n  16:4      calls from that minute\\n  SE-C      only rejections (their clause)\\n\\nClear the field to see every row.",
  note: "The notes filter hides rows.\\n\\nType any text. A row stays visible when its time or note text contains it. Case does not matter.\\n\\nExamples:\\n  gap       notes mentioning a gap\\n  07-23     notes from that day\\n\\nClear the field to see every row.",
};
const DEFCOLS = { log: "5em 4.5em 3em 12em 1fr", note: "7em 1fr" };
function colInit() {
  for (const t of ["log", "note"]) {
    document.documentElement.style.setProperty("--cols-" + t, localStorage.getItem("cols-" + t) || DEFCOLS[t]);
  }
}
function grip(t, ci) { return '<span class="colgrip" onmousedown="colDrag(event,&quot;' + t + '&quot;,' + ci + ')"></span>'; }
function colDrag(e, t, ci) {
  e.preventDefault();
  e.stopPropagation();
  const cell = e.target.parentElement;
  const startX = e.clientX, startW = cell.offsetWidth;
  const cur = getComputedStyle(document.documentElement).getPropertyValue("--cols-" + t).trim().split(/\\s+/);
  const move = (ev) => {
    cur[ci] = Math.max(30, startW + ev.clientX - startX) + "px";
    const v = cur.join(" ");
    document.documentElement.style.setProperty("--cols-" + t, v);
    localStorage.setItem("cols-" + t, v);
  };
  const up = () => { removeEventListener("mousemove", move); removeEventListener("mouseup", up); };
  addEventListener("mousemove", move);
  addEventListener("mouseup", up);
}
function thead(t, names) {
  return '<div class="trow ' + t + ' thead">' +
    names.map((n, i) => "<span>" + n + (i < names.length - 1 ? grip(t, i) : "") + "</span>").join("") + "</div>";
}
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
  const wide = el("midsplit").parentElement.offsetWidth >= 1000;
  document.body.classList.toggle("mid-narrow", !wide);
  el("sm-col").style.display = wide || subTab === "sm" ? "" : "none";
  el("tot-col").style.display = wide || subTab === "tot" ? "" : "none";
  el("st-sm").className = "tab" + (subTab === "sm" ? " active" : "");
  el("st-tot").className = "tab" + (subTab === "tot" ? " active" : "");
  el("rspacer").style.height = (el("agentbar").offsetHeight + el("subtabbar").offsetHeight) + "px";
}
function smView(i) { SMVIEW = i; render(); }
function smDive(idx, i) {
  const stack = S.machine_stack ?? [];
  if (stack[idx] && stack[idx + 1] && stack[idx].states[i].id === stack[idx + 1].id) { SMVIEW = idx + 1; render(); }
}
function smNode(idx, i, st) {
  const click = ' onclick="detail(S.machine_stack[' + idx + '].states[' + i + '])" ondblclick="smDive(' + idx + "," + i + ')"';
  if (st.kind === "terminal") return '<div class="smend ' + st.status + '" title="' + esc(st.id) + '"' + click + "></div>";
  return '<div class="smnode ' + st.status + '"' + click + ">" + esc(st.id) + "</div>";
}
function renderSM() {
  const stack = S.machine_stack ?? [];
  const idx = SMVIEW < 0 || SMVIEW >= stack.length ? stack.length - 1 : SMVIEW;
  el("smcrumb").innerHTML = stack.map((m, i) =>
    '<span class="crumb' + (i === idx ? " active" : "") + '" onclick="smView(' + i + ')">' + esc(m.id) + "</span>"
  ).join(" ▸ ");
  const f = stack[idx];
  if (!f) { el("smlist").innerHTML = ""; return; }
  const parts = ['<div class="smwrap">', '<div class="smstart" title="start"></div>'];
  let i = 0;
  while (i < f.states.length) {
    parts.push('<div class="smconn">▼</div>');
    const g = f.states[i].group;
    if (g) {
      parts.push('<div class="smgroup"><div class="smglabel">' + esc(g) + "</div>");
      let first = true;
      while (i < f.states.length && f.states[i].group === g) {
        if (!first) parts.push('<div class="smconn">▼</div>');
        parts.push(smNode(idx, i, f.states[i]));
        first = false;
        i++;
      }
      parts.push("</div>");
    } else {
      parts.push(smNode(idx, i, f.states[i]));
      i++;
    }
  }
  parts.push("</div>");
  el("smlist").innerHTML = parts.join("");
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
  const lq = el("lfilter").value.toLowerCase();
  const lrows = S.calls.map((c, i) => {
    const clause = c.response && c.response.clause ? c.response.clause : "failed";
    const t = fmtT(c.ts);
    const res = c.ok ? '<span class="tick">✓</span>' : '<span class="cross">✗ ' + esc(clause) + "</span>";
    return {
      key: (t + " " + me + " se " + c.tool + " " + (c.ok ? "ok" : clause)).toLowerCase(),
      html: '<div class="trow log" onclick="detailLog(S.calls[' + i + '])"><span>' + t + "</span><span>" +
        esc(me) + "</span><span>se</span><span>" + esc(c.tool) + "</span><span>" + res + "</span></div>",
    };
  });
  el("feed").innerHTML = thead("log", ["time", "source", "dest", "tool", "result"]) +
    lrows.filter(r => !lq || r.key.includes(lq)).map(r => r.html).join("");
  const nq = el("nfilter").value.toLowerCase();
  const nrows = (S.notes ?? []).map((n, i) => ({
    key: (fmtD(n.at) + " " + n.text).toLowerCase(),
    html: '<div class="trow note" onclick="detail(S.notes[' + i + '])"><span>' + fmtD(n.at) + "</span><span>" +
      esc(n.text) + "</span></div>",
  }));
  el("notes").innerHTML = thead("note", ["time", "note"]) +
    (nrows.filter(r => !nq || r.key.includes(nq)).map(r => r.html).join("") || '<span class="dim">empty</span>');
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
colInit();
initResize();
addEventListener("resize", layoutMiddle);
el("lfilter").addEventListener("input", render);
el("lfilter").addEventListener("focus", () => detail(HELP.log));
el("nfilter").addEventListener("input", render);
el("nfilter").addEventListener("focus", () => detail(HELP.note));
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
      const grant = new Gate(root).bless(requireSystematic(root), hash, { channel: "board", adjudicated_by: "owner" });
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
