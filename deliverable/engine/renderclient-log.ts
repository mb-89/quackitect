// THE LOG AND THE DECISIONS — the call feed, the decision tree, and the
// loading and busy signals over them.
//
// see dsp-mirror-render.md#the-client-script-is-served-in-parts

export const LOG = `
// A deep link names the subject — a popped-out or bookmarked pane must
// show what it was opened on, so the walk's default never runs over it.
const DETAIL_PARAM = new URLSearchParams(location.search).get("detail");
if (DETAIL_PARAM) { CURRENT_DETAIL = DETAIL_PARAM; const dp = detailFor(DETAIL_PARAM); showDetails(dp[0], dp[1]); }
else if (CURRENT && D.states[CURRENT] && WALK_HERE) { CURRENT_DETAIL = "state:" + CURRENT; const wdp = detailFor("state:" + CURRENT); showDetails(wdp[0], wdp[1]); }
// A frozen window says so. Not a warning — a quiet line, so a reader with
// one live pane and four snapshots can tell which is which at a glance.
if (FROZEN) {
  const fbar = document.createElement("div");
  fbar.id = "frozen-bar";
  fbar.textContent = "frozen — this window keeps what it was opened on and does not follow the walk";
  fbar.style.cssText = "padding:6px 10px;font-size:12px;opacity:0.7;border-bottom:1px solid rgba(128,128,128,0.3)";
  document.body.insertBefore(fbar, document.body.firstChild);
}
// Open folds need no carrying now: the morph never replaces them.

// see dsp-mirror-render.md#the-unified-feed
function escText(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); }
const logPanel = document.getElementById("log-rows");
let LOG_ROWS = [];
let lastActs = null;
let DECISION_GRAPH = null;
let LOG_HTML = null;
function renderLog() {
  if (!logPanel) return;
  const fEl = document.getElementById("log-filter");
  const f = fEl ? fEl.value.toLowerCase() : "";
  const rows = LOG_ROWS.filter((r) => !f || (r.ts + " " + r.src + " " + r.type + " " + r.brief + " " + (r.clause || "")).toLowerCase().includes(f));
  // NEWEST ON TOP: the feed reads downward into the past;
  // the scroll pins to the top while the reader is there.
  const html = rows.slice().reverse().map((r) =>
    '<div class="logrow ' + r.type + (r.ok ? "" : " failed") + '" data-ref="' + r.ref + '">' +
      '<span class="lt">' + (r.pending ? r.ts.slice(5, 10) : r.ts.slice(11, 19)) + "</span>" +
      '<span class="lsrc ' + r.src + '">' + r.src + "</span>" +
      '<span class="lkind k-' + r.type + '">' + r.type + "</span>" +
      '<span class="lbrief">' + escText(r.brief) + "</span>" +
      '<span class="lok">' + (r.ok ? "✓" : "✗ " + (r.clause || "")) + "</span>" +
    "</div>").join("") || '<div class="meta">no acts' + (f ? " match the filter" : " this session yet") + "</div>";
  // NOTHING CHANGED, NOTHING MOVES. The feed polls constantly, and it used to
  // rewrite itself whole every time. A reader scrolled down into the past was
  // snapped back to the top by a poll that found nothing new — the same defect
  // as the details pane, on a surface that repaints far more often.
  if (html === LOG_HTML) return;
  LOG_HTML = html;
  // Sticking to the top is the reader's place TOO, when that is where they are,
  // and sePlaceKeepScroll is the one decider for both cases.
  sePlaceKeepScroll(logPanel, () => { logPanel.innerHTML = html; }, { stickWithin: 40 });
}
async function refreshLog() {
  if (!logPanel) return;
  try {
    const r = await fetch("/api/log");
    const d = await r.json();
    LOG_ROWS = d.rows || [];
    renderLog();
  } catch (e) { /* the alive poll owns liveness verdicts */ }
}
if (logPanel) {
  refreshLog();
  const fEl = document.getElementById("log-filter");
  if (fEl) fEl.addEventListener("input", renderLog);
  // Help is a detail: touching a control explains it in the details pane.
  if (fEl) fEl.addEventListener("focus", () => showDetails("the feed filter", '<div class="comment-detail">Substring match over time, source, type, brief and clause. One example per filter kind:</div>' +
    '<div style="padding:2px 0 2px 14px"><code>note</code> — pending notes only</div>' +
    '<div style="padding:2px 0 2px 14px"><code>call</code> — tool calls</div>' +
    '<div style="padding:2px 0 2px 14px"><code>update</code> — decision-graph updates</div>' +
    '<div style="padding:2px 0 2px 14px"><code>human</code> — the human hand</div>' +
    '<div style="padding:2px 0 2px 14px"><code>agent</code> — the agent hand</div>' +
    '<div style="padding:2px 0 2px 14px"><code>SE-C-113</code> — refusals by clause</div>' +
    '<div style="padding:2px 0 2px 14px"><code>15:2</code> — a time window (hh:mm prefix)</div>' +
    '<div style="padding:2px 0 2px 14px"><code>tick</code> — any word in the brief</div>'));
  // THE TWO LINE EDITS ARE PANEL PARAMETERS NOW, so they arrive with the bar
  // and the log widget no longer writes a second pair of its own.
  const nEl = document.getElementById("note-body");
  if (nEl) {
    nEl.addEventListener("focus", () => showDetails("drop a note", '<div class="comment-detail">A stray — an idea, a bug, a better way. Enter captures it to the inbox with your hand stamped; a retro drains it later.</div>'));
    nEl.addEventListener("keydown", async (ev2) => {
      if (ev2.key !== "Enter" || nEl.value.trim() === "") return;
      const pri = document.querySelector('.param-choice[data-key="note_priority"]');
      await fetch("/note", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: nEl.value, priority: pri === null ? "could" : pri.value }) });
      nEl.value = "";
      refreshLog();
    });
  }
}
async function openLogDetail(ref) {
  // A solo card does not render log details — it relays the ref, and the
  // details surface owns the render and keeps its place through refreshes.
  if (!document.getElementById("details") && window.parent !== window) { window.parent.postMessage({ se: "logref", ref: ref }, "*"); return; }
  CURRENT_DETAIL = "log:" + ref;
  hostTrace("openLogDetail asking for " + ref);
  const r = await fetch("/api/log?ref=" + encodeURIComponent(ref));
  hostTrace("openLogDetail status " + r.status + " for " + ref);
  const rec = await r.json();
  hostTrace("openLogDetail parsed " + ref + " tool=" + String(rec.tool) + " err=" + String(rec.error));
  if (rec.tool === "se_update" && rec.args) { await showUpdateDetail(rec); return; }
  if ((rec.tool === "se_note" || rec.tool === "mirror_note") && rec.args) { showDetails("note · " + ((rec.response && rec.response.captured) || rec.ref), jsonTable({ at: rec.ts, text: rec.args.text, pending: "until a retro drains it" })); return; }
  if (rec.text !== undefined && rec.tool === undefined) { showDetails("note · " + rec.ref, jsonTable({ at: rec.at, text: rec.text, pending: "until a retro drains it" })); return; }
  if (rec.tool === "se_answer" && rec.args) {
    // The aq click shows BOTH, as prose — never the raw call record.
    showDetails("aq · answered question",
      '<div class="aq-q">' + escText(String(rec.args.question || "")) + "</div>" +
      '<div class="aq-a prewrap">' + escText(String(rec.args.answer || "")) + "</div>");
    return;
  }
  showDetails("log · " + (rec.tool || ref), jsonTable({ at: rec.ts, request: { tool: rec.tool, args: rec.args }, response: rec.response === undefined ? null : rec.response, duration_ms: rec.duration_ms }));
}
async function showDecisions(visit, sel) {
  const r = await fetch("/api/decisions?visit=" + encodeURIComponent(visit));
  DECISION_GRAPH = await r.json();
  renderDecisions(sel);
}
function decisionsHtml(sel) {
  const g = DECISION_GRAPH;
  if (!g) return "";
  const kids = {};
  g.nodes.forEach((n) => { (kids[n.parent || ""] = kids[n.parent || ""] || []).push(n); });
  const badge = { open: "●", done: "✓", obsolete: "⊘", reverted: "↩", deferred: "→" };
  function tree(pid, depth) {
    return (kids[pid] || []).map((n) =>
      '<div class="dnode s-' + n.status + (n.id === g.active ? " dactive" : "") + (n.id === sel ? " dsel" : "") + '" data-node="' + n.id + '" style="margin-left:' + depth * 14 + 'px" title="' + n.id + " · " + n.status + '">' + badge[n.status] + " " + escText(n.brief) + "</div>" + tree(n.id, depth + 1)
    ).join("");
  }
  let html = tree("", 0) || '<div class="meta">no checklist stands at ' + escText(g.visit) + "</div>";
  if (sel) {
    const n = g.nodes.find((x) => x.id === sel);
    if (n) html += '<div class="dinfo">' + jsonTable(Object.assign({ id: n.id, brief: n.brief, status: n.status }, n.resolution ? { resolution: n.resolution } : {}, { opened: n.at }, n.closed_at ? { closed: n.closed_at } : {})) + "</div>";
  }
  return html;
}
function renderDecisions(sel) {
  if (!DECISION_GRAPH) return;
  showDetails("decisions · " + DECISION_GRAPH.visit, decisionsHtml(sel));
}
// A CLICKED UPDATE SHOWS WHAT IT CHANGED, always.
//
// It used to jump straight to the visit's tree and show nothing else. So an
// update recorded where no checklist stands — a bare update, a refused one,
// a plan on a state nobody had planned — opened on "no decisions recorded"
// and read as broken. Which kind of update you clicked decided whether the
// pane said anything, which is exactly backwards.
//
// The op itself comes first now, from the log record, so a line always
// explains itself. The tree follows underneath when there is one, with the
// point this update touched selected.
async function showUpdateDetail(rec) {
  const a = rec.args || {};
  const res = rec.response || {};
  const refused = a.refused === true || rec.ok === false;
  const rows = {};
  rows.op = refused ? "refused" : (a.op || "update");
  rows.rode_on = a.via;
  if (a.visit) rows.at = a.visit;
  if (a.node) rows.node = a.node;
  if (a.brief) rows.brief = a.brief;
  if (a.to) rows.deferred_to = a.to;
  if (Array.isArray(a.items)) rows.items = a.items;
  if (res.active) rows.now_active = res.active;
  if (res.open !== undefined) rows.still_open = res.open;
  if (res.nudge) rows.nudge = res.nudge;
  if (refused) rows.why = (res.expected ? String(res.expected) : "") + (res.got ? " — got " + String(res.got) : "") || "the narration was refused; the call it rode on still landed";
  rows.at_time = rec.ts;
  let html = '<div class="dinfo">' + jsonTable(rows) + "</div>";
  if (a.visit) {
    try {
      const r = await fetch("/api/decisions?visit=" + encodeURIComponent(a.visit));
      DECISION_GRAPH = await r.json();
      html += decisionsHtml(a.node || res.active || null);
    } catch (e) { html += '<div class="meta">the checklist could not be read: ' + escText(String((e && e.message) || e)) + "</div>"; }
  }
  showDetails("update · " + rows.op + (a.node ? " " + a.node : ""), html);
}
// see dsp-mirror-render.md#the-loading-bar-owns-its-lifetime
let loadToken = 0;
let loadTimer = null;
// A HOST DRAWS ITS OWN PROGRESS. Framed inside an editor, the host already
// has a progress affordance of its own, and two bars for one wait is one too
// many. The page REPORTS that it is busy; the host decides how to show it.
// The page's half of the trace. Nobody can watch a webview run, so it says
// what it just did and the host writes it down.
function hostTrace(what) {
  if (window.parent !== window) window.parent.postMessage({ se: "trace", text: what }, "*");
}
// A THROW IN HERE IS INVISIBLE otherwise. There is no console anybody can
// read from outside, so a failure would look exactly like a control that
// simply does nothing — which is the hardest fault to chase.
window.addEventListener("error", (e) => hostTrace("ERROR " + (e.message || "?") + " @" + (e.lineno || 0)));
window.addEventListener("unhandledrejection", (e) => hostTrace("REJECTED " + String((e.reason && e.reason.message) || e.reason || "?")));
// WHICH PAGE THIS ACTUALLY IS. A navigation that fires and then lands on the
// wrong thing looks identical, from outside, to one that never fired.
hostTrace("loaded " + location.pathname + location.search);
function hostBusy(on, label) {
  if (window.parent !== window) window.parent.postMessage({ se: "busy", on: on, label: label || "" }, "*");
}
function hideLoading() {
  loadToken++; // any timer still holding the old token is now a no-op
  if (loadTimer !== null) { clearTimeout(loadTimer); loadTimer = null; }
  const el = document.getElementById("loadbar");
  if (el !== null) el.remove();
  hostBusy(false);
}
function showLoading(label) {
  hideLoading(); // one load at a time; a second start supersedes the first
  hostBusy(true, label);
  if (window.parent !== window) return;
  const mine = loadToken;
  const el = document.createElement("div");
  el.id = "loadbar";
  el.innerHTML = '<div class="fill"></div><div class="lmsg"></div>';
  el.querySelector(".lmsg").textContent = label || "loading";
  document.body.appendChild(el);
  // NOTHING SPINS FOREVER. If nobody settles this load, say so — an honest
  // failure beats a confident bar in front of a page that finished long ago.
  loadTimer = setTimeout(() => {
    if (loadToken !== mine) return;
    const cur = document.getElementById("loadbar");
    if (cur === null) return;
    cur.classList.add("stalled");
    cur.querySelector(".lmsg").textContent = (label || "loading") + " — no answer; click to retry";
  }, 8000);
}
`;
