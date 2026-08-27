// THE LIVE SIGNALS — the progress bar, the autonomy and narration controls,
// the ping, the alive poll, and the terminal.
//
// see dsp-mirror-render.md#the-client-script-is-served-in-parts

export const LIVE = `
// THE ENGINE'S OWN WORK drives the same bar: a running script reports
// "##progress done total label" and the fill follows it. Boot's checks are
// the first customer — nobody should watch a still page and guess.
function showProgress(label, done, total) {
  if (window.parent !== window) { hostBusy(true, label + " — " + done + "/" + total); return; }
  let el = document.getElementById("loadbar");
  if (el === null) { showLoading(label); el = document.getElementById("loadbar"); }
  if (el === null) return;
  // Progress ARRIVING cancels the stall timer: something is plainly alive.
  if (loadTimer !== null) { clearTimeout(loadTimer); loadTimer = null; }
  el.classList.remove("stalled");
  const fill = el.querySelector(".fill");
  fill.classList.add("determinate");
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  fill.style.width = pct + "%";
  el.querySelector(".lmsg").textContent = label + " — " + done + "/" + total + " (" + pct + "%)";
}
// A page that was restored, or navigated back to, has no load in flight —
// whatever it was showing when the reader left it.
addEventListener("pageshow", hideLoading);
addEventListener("popstate", hideLoading);
document.addEventListener("click", (ev) => {
  const stalled = ev.target.closest ? ev.target.closest("#loadbar.stalled") : null;
  if (stalled !== null) { hideLoading(); location.reload(); return; }
  const a = ev.target.closest ? ev.target.closest('a[href*="?view="]') : null;
  if (a === null) return;
  // SERVER-RENDERED LINKS NEVER PASS THROUGH navigateTo. The crumb chain and
  // its menu are plain anchors, and the server cannot know which card the
  // reader promoted or what they have open. So the place is stitched on here,
  // at the click, before the browser follows the href. A new tab gets it too,
  // which is why this runs BEFORE the modifier-key returns below.
  a.setAttribute("href", withPlace(a.getAttribute("href")));
  // A click that opens SOMEWHERE ELSE leaves this page untouched, so it
  // starts no load here. Showing a bar for it is exactly the strand the
  // owner hit: the expand controls advertise ctrl-click and shift-click.
  if (ev.defaultPrevented || ev.button !== 0) return;
  if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
  if (a.target !== "" && a.target !== "_self") return;
  showLoading("loading " + (a.textContent || "view"));
}, true);
document.addEventListener("click", (ev) => {
  const lr = ev.target.closest ? ev.target.closest(".logrow") : null;
  if (lr) { void openLogDetail(lr.dataset.ref); return; }
  const rn = ev.target.closest ? ev.target.closest(".recnode") : null;
  if (rn) {
    const v = (REC_DECS[rn.dataset.exp] || []).find((x) => x.visit === rn.dataset.visit);
    const n = v && v.nodes.find((x) => x.id === rn.dataset.node);
    const sec = rn.closest("details");
    const box = sec && sec.querySelector(".recinfo");
    if (n && box) {
      sec.querySelectorAll(".recnode.dsel").forEach((x) => x.classList.remove("dsel"));
      rn.classList.add("dsel");
      box.innerHTML = '<div class="dinfo">' + jsonTable(Object.assign({ id: n.id, brief: n.brief, status: n.status }, n.resolution ? { resolution: n.resolution } : {}, n.at ? { opened: n.at } : {}, n.closed_at ? { closed: n.closed_at } : {})) + "</div>";
    }
    return;
  }
  const dn = ev.target.closest ? ev.target.closest(".dnode") : null;
  if (dn) { renderDecisions(dn.dataset.node); return; }
});

// THE AUTONOMY SLIDER — the human's live grip on how much of the walk is
// the agent's. Takes effect on the agent's NEXT tick; logged server-side.
const thr = document.getElementById("thr");
if (thr) {
  const lbl = document.getElementById("thr-val");
  thr.addEventListener("input", () => { if (lbl) lbl.textContent = Number(thr.value).toFixed(2); });
  thr.addEventListener("change", async () => {
    await fetch("/autonomy", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: Number(thr.value) }) });
  });
}

// THE NOTCHES — the authored involvement levels as shortcuts on the
// slider: a click jumps the threshold there and surfaces the level's help
// in the details pane (help is a detail, never a button).
const THR_LEVELS = D.levels;
function levelHelp(sel) {
  const rows = THR_LEVELS.map((l) =>
    '<tr' + (sel === l.value ? ' style="background:var(--se-raised)"' : "") + '><td class="k">' + l.abbr + " · " + l.value + '</td><td class="v">' + l.name + "</td></tr>").join("");
  showDetails("the autonomy scale", '<table class="kv">' + rows + '</table><div style="padding:8px 0 0"><a class="doclink" data-path="guidance/authoring/machines.md">the full scale — machines.md · Priority</a></div>');
}
// THE UPDATE CADENCE — two numbers the reader types. Both clocks run;
// whichever falls due first is owed. Zero stops that clock.
const nrMinEl = document.getElementById("narration-minutes");
const nrCallsEl = document.getElementById("narration-calls");
function nrHelp() {
  showDetails("how often updates are owed", '<div class="meta">An update every n MINUTES at least, or every n CALLS at least — whichever falls due first since the last one.<br><br>Zero stops that clock. Both zero owes nothing.<br><br>A volunteered update always pays, and always resets both.<br><br>NOW makes an update due immediately, so the next call has to carry one.</div>');
}
function sendCadence() {
  if (!nrMinEl || !nrCallsEl) return;
  void fetch("/narration", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ minutes: Number(nrMinEl.value), calls: Number(nrCallsEl.value) }) });
}
if (nrMinEl) nrMinEl.addEventListener("change", sendCadence);
if (nrCallsEl) nrCallsEl.addEventListener("change", sendCadence);
// THE POWER TOGGLES — independent buttons, either or both. A toggle carries
// its own key, so this handler never learns which toggles exist.
document.addEventListener("click", async (ev) => {
  const t = ev.target && ev.target.closest ? ev.target.closest(".param-toggle") : null;
  if (!t) return;
  const on = t.getAttribute("aria-pressed") !== "true";
  t.classList.toggle("on", on);
  t.setAttribute("aria-pressed", on ? "true" : "false");
  await fetch("/power", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ key: t.getAttribute("data-toggle"), on: on }) });
});
document.addEventListener("click", (ev) => {
  // An action parameter carries its endpoint, so the panel decides what the
  // button does and this handler never learns a second one.
  const act = ev.target.closest ? ev.target.closest(".param-action") : null;
  if (act) {
    // THE NOTE'S BUTTON CARRIES THE LINE BESIDE IT. Every other action posts
    // an empty body; this one would drop a blank note without the field.
    //
    // A REFUSED LINE STAYS IN THE FIELD, exactly as the work line does. The
    // wall guard refuses a breakless note, and clearing the box would throw
    // away what the reader typed and say nothing.
    if (act.dataset.post === "/note") {
      const f = document.getElementById("note-body");
      if (f && f.value.trim() !== "") {
        const pr = document.querySelector('.param-choice[data-key="note_priority"]');
        void fetch("/note", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: f.value, priority: pr === null ? "could" : pr.value }) }).then(async (r) => {
          let d = null;
          try { d = await r.json(); } catch (e) { d = null; }
          if (d && d.ok === true) { f.value = ""; refreshLog(); return; }
          toast(d && (d.expected || d.error) ? (d.expected || d.error) : "the note was refused");
        });
      }
      return;
    }
    // THE WORK BUTTON CARRIES ITS LINE THE SAME WAY, separator and all: four
    // words name the work, then a slash, then the detail. The server splits it,
    // so the line travels whole. The backlog is where work with no place yet
    // belongs.
    //
    // A REFUSED LINE STAYS IN THE FIELD. The four-word rule refuses here, and
    // clearing the box would throw away what the reader typed and say nothing.
    if (act.dataset.post === "/work/mint") {
      const w = document.getElementById("work-statement");
      if (w && w.value.trim() !== "") {
        void fetch("/work/mint", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ place: "backlog", slot: "pending", statement: w.value.trim() }) }).then(async (r) => {
          let d = null;
          try { d = await r.json(); } catch (e) { d = null; }
          if (d && d.ok === true) { w.value = ""; refreshLog(); return; }
          toast(d && (d.expected || d.error) ? (d.expected || d.error) : "the work was refused");
        });
      }
      return;
    }
    // A JSON-answering control reports its refusal IN PLACE — the target
    // button used to swallow it. A redirecting
    // control answers HTML, and reading it as JSON just stays quiet.
    void fetch(act.dataset.post, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }).then(async (r) => {
      try {
        const d = await r.json();
        if (d && (d.kind === "rejected" || d.error)) toast(d.expected || d.error || "refused");
      } catch (e) { /* not JSON — a redirecting control */ }
    });
    return;
  }

  const nh = ev.target.closest ? ev.target.closest(".nr-help") : null;
  if (nh) { nrHelp(); return; }
  const th = ev.target.closest ? ev.target.closest(".thr-help") : null;
  if (th) { levelHelp(Number((document.getElementById("thr") || {}).value)); return; }
  // The drumroll's memory lives on window, because the bar it is counting
  // clicks on is replaced by every poll.
  const n = ev.target.closest ? ev.target.closest(".rung[data-level]") : null;
  if (n) {
    // THE STOP-AT BANK IS THE SAME CONTROL ASKING A DIFFERENT QUESTION, so it
    // shares this handler and differs only in where the press lands. None of
    // the autonomy machinery below applies to it: no emergency drumroll, no
    // hidden slider, and its lowest notch is a floor rather than an off.
    if (n.dataset.bank === "stopat") {
      if (n.classList.contains("locked")) return;
      const to = Number(n.dataset.level);
      for (const b of document.querySelectorAll('button.rung[data-bank="stopat"]')) {
        b.classList.toggle("on", Number(b.dataset.rung) <= to);
      }
      void fetch("/stop-at", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: to }) });
      return;
    }
    // THE HELP FOLLOWS THE RUNG PRESSED. data-level is only where the click
    // LANDS, and on a release the two differ — explaining "blocked" to
    // someone who clicked the mechanical rung is the wrong mapping.
    const rung = Number(n.dataset.rung);
    // THE HIDDEN RUNG, COUNTED BEFORE EVERYTHING ELSE. The contract, in the
    // owner's words: five clicks on the top rung in a row go to emergency,
    // and it does not matter which rung the autonomy sits at, nor whether the
    // button is lit, dark or locked.
    //
    // Two earlier versions failed it by placing the counter behind a guard.
    // Behind the LIT check, press one released the rung and every later press
    // landed on a dark button, because data-level is baked into the markup and
    // stays stale until a poll redraws it. Behind the LOCKED check, no click
    // from a low rung ever reached the counter at all, since the top rung is
    // locked from down there. Both read as a dead button, and both were
    // reported as one. Nothing may stand in front of this.
    if (rung >= 1) {
      const now = Date.now();
      if (now - (window.__seTopPressAt || 0) > 5000) window.__seTopPresses = 0;
      window.__seTopPressAt = now;
      window.__seTopPresses = (window.__seTopPresses || 0) + 1;
      if (window.__seTopPresses >= 5) {
        window.__seTopPresses = 0;
        // The autonomy may be anywhere — the owner may have started at
        // mechanical. Emergency is refused below the top rung, so CLIMB first
        // and arm second. A refused arm looks exactly like a dead button.
        n.classList.remove("locked");
        n.classList.add("on");
        n.classList.add("emergency");
        n.textContent = "E";
        for (const b of document.querySelectorAll('button.rung[data-bank="autonomy"]')) b.classList.add("on");
        const bar = document.getElementById("thr");
        if (bar) bar.value = 1;
        void fetch("/autonomy", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: 1 }) })
          .then(function () { return fetch("/emergency", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ on: true }) }); });
        return;
      }
    }
    // A locked rung still ANSWERS — it explains itself in details rather
    // than doing nothing, because a dead click reads as a broken button.
    if (n.classList.contains("locked")) { levelHelp(rung); return; }
    const v = Number(n.dataset.level);
    // PAINT FIRST, THEN TELL THE ENGINE. The bar redraws on the next poll,
    // and waiting for that is seconds of a button that looks dead.
    for (const b of document.querySelectorAll('button.rung[data-bank="autonomy"]')) {
      b.classList.toggle("on", Number(b.dataset.rung) <= v);
    }
    const live = document.getElementById("thr");
    if (live) live.value = v;
    void fetch("/autonomy", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ value: v }) });
    levelHelp(rung);
    return;
  }
  const h = ev.target.closest ? ev.target.closest(".thr-help") : null;
  if (h) levelHelp(null);
});

// see dsp-mirror-render.md#what-stands-open

// see dsp-mirror-render.md#reaching-end-stops-the-session-and-the-window-says-so
function linkLost(on) {
  const had = document.getElementById("link-lost");
  if (!on) { if (had) had.remove(); return; }
  if (had || document.getElementById("over")) return;
  const d = document.createElement("div");
  d.id = "link-lost";
  d.textContent = "the link to the server is down — reconnecting";
  document.body.appendChild(d);
}
function sessionOver(why) {
  linkLost(false);
  const had = document.getElementById("over");
  if (had) return;
  const d = document.createElement("div");
  d.id = "over";
  d.innerHTML = '<div class="over-box">SESSION OVER</div><div class="over-sub"></div>';
  d.querySelector(".over-sub").textContent = why;
  document.body.appendChild(d);
}
if (D.describe.status === "closed") sessionOver("the machine reached end — the walk is complete");

// see dsp-mirror-render.md#pushed-never-polled
let lastPingSeq = 0;
let litTarget = null;
function findPingEl(target) {
  const escaped = window.CSS && CSS.escape ? CSS.escape(target) : target;
  return document.getElementById("card-" + target)
    || document.querySelector('[data-widget="' + escaped + '"]')
    || document.getElementById(target)
    || document.querySelector('[data-detail="state:' + escaped + '"]');
}
function applyPing() {
  for (const n of document.querySelectorAll(".se-ping, .se-ping-svg")) n.classList.remove("se-ping", "se-ping-svg");
  if (litTarget === null) return;
  const el = findPingEl(litTarget);
  if (!el) return; // pointing is advisory — an unknown target fails nothing
  el.classList.add(el.ownerSVGElement ? "se-ping-svg" : "se-ping");
  return el;
}
function pingSurface(target) {
  litTarget = target;
  const el = applyPing();
  if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
}
let pollBusy = null;
let ACTIVE_AT_RENDER = JSON.stringify(D.describe.active || []);
let TARGET_AT_RENDER = D.target || "";
let sawError = false;
let deathTimer = null;
// The newest person-pull already landed; null until the first alive adopts
// the standing value, so a page load never replays an old pull.
let lastPullSeq = null;
// The work store's signal at the last render. Null until the first alive
// adopts it, so a page load never redraws itself for work that was already
// on the page when it was served.
let lastWork = null;
// ONE alive-driven pass, shared by the event stream and the host's wake —
// an embedded page has no stream, and this is everything it would miss.
function applyAlive(a) {
  // A stale shell heals itself: new engine life, new page — now.
  if (a.build && D.build && a.build !== D.build) { location.reload(); return; }
  if (a.status === "closed") { sessionOver("the machine reached end — the walk is complete"); return; }
  if (a.gone) { sessionOver("the console quit — the server has stopped, the walk was left standing"); return; }
  // Emergency is drawn from the engine, so a second surface cannot disagree
  // with it about whether the gate is lifted.
  for (const b of document.querySelectorAll("button.rung[data-rung]")) {
    if (Number(b.dataset.rung) < 1) continue;
    const armed = a.emergency === true;
    b.classList.toggle("emergency", armed);
    if (armed) b.textContent = "E";
    else if (b.textContent === "E") b.textContent = "I";
  }
  if (thr && !sePlaceIsEdited(thr) && Number(thr.value) !== a.autonomy) {
    thr.value = a.autonomy;
    const lbl = document.getElementById("thr-val");
    if (lbl) lbl.textContent = Number(a.autonomy).toFixed(2);
  }
  if (a.power) {
    for (const b of document.querySelectorAll(".param-toggle")) {
      const on = a.power[b.getAttribute("data-toggle").replace(/-/g, "_")] === true;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }
  if (a.ping && a.ping.seq !== lastPingSeq) {
    lastPingSeq = a.ping.seq;
    pingSurface(a.ping.target);
    if (window.seTracePing) window.seTracePing(a.ping.target);
  }  // A re-render drops the class. Put the light back rather than losing it
  // mid-sentence — the ping outlives the DOM that carried it.
  else if (litTarget !== null && !document.querySelector(".se-ping, .se-ping-svg")) applyPing();
  if (a.trace_trail && window.seTraceTrail) window.seTraceTrail(a.trace_trail);
  if (logPanel && a.acts !== lastActs) { lastActs = a.acts; refreshLog(); }
  // THE PERSON PULLED: the answer lands in the
  // details, and a form the walk owes gets a panel of its own — the inline
  // details pane is ephemeral on purpose.
  if (lastPullSeq === null) lastPullSeq = a.last_pull ? a.last_pull.seq : 0;
  else if (a.last_pull && a.last_pull.seq !== lastPullSeq) {
    lastPullSeq = a.last_pull.seq;
    CURRENT_DETAIL = "log:" + a.last_pull.ref;
    void openLogDetail(a.last_pull.ref);
    void fetch("/api/log?ref=" + encodeURIComponent(a.last_pull.ref)).then((r) => r.json()).then((rec) => {
      const resp = rec && rec.response;
      const first = resp && resp.pull === "fill" && resp.forms && resp.forms[0];
      if (!first || !first.form) return;
      if (window.parent !== window) window.parent.postMessage({ se: "open-form", name: first.form }, "*");
      else if (!EMBED) window.open("/widget/details?detail=" + encodeURIComponent("form:" + first.form), "_blank", "popup,width=760,height=900");
    }).catch(() => {});
  }
  // THE WORK MOVED. A token minted, taken, settled or placed changes the
  // signal, and the drawing redraws under the reader — no navigation, no
  // leaving the machine and coming back.
  //
  // TWO SURFACES, ONE SIGNAL, AND EACH REPAINTS ITSELF. The drawing morphs; the
  // work editor is morph-ignored and redraws through its own client. A single
  // repaint could not serve both, because the morph carries the editor's
  // server-side defaults and would shut it under the reader.
  if (lastWork === null) lastWork = a.work;
  else if (a.work !== lastWork) {
    lastWork = a.work;
    if (typeof window.seRedrawWork === "function") window.seRedrawWork();
    refresh();
    return;
  }
  if (JSON.stringify(a.active || []) !== ACTIVE_AT_RENDER) { refresh(); return; }
  // A re-aimed walk redraws the route under the reader.
  if ((a.target || "") !== TARGET_AT_RENDER) { refresh(); return; }
  // A script run finishing elsewhere (agent tick, other window) lands its
  // result — refresh, keeping the open pane.
  // THE BAR FOLLOWS THE ENGINE, not just this page's clicks. A script the
  // AGENT started (boot's checks, most of all) shows here too, with real
  // progress when it reports any and a moving bar when it does not.
  if (a.progress) showProgress(a.progress.label || "working", a.progress.done, a.progress.total);
  else if (a.busy === true && pollBusy !== true) showLoading("running checks");
  else if (a.busy === false && pollBusy === true) hideLoading();
  if (pollBusy === true && a.busy === false) { refresh(); return; }
  pollBusy = a.busy;
}
// A frozen window never opens the stream — that is the whole of freezing.
//
// AND NEITHER DOES AN EMBEDDED CARD. A browser allows only a handful of
// connections to one host, and a permanent event stream per card ate one
// each. Past that limit EVERY other request to the engine queues instead of
// going out — so a click did nothing at all, and then four minutes later the
// whole backlog arrived at once. The host polls the engine over its own
// runtime, where no such limit applies, and wakes the cards through the
// channel they already have.
if (!FROZEN && window.parent === window) {
const es = new EventSource("/events");
es.addEventListener("open", () => {
  if (deathTimer !== null) { clearTimeout(deathTimer); deathTimer = null; }
  linkLost(false);
  if (sawError) { sawError = false; refresh(); }
});
es.addEventListener("error", () => {
  sawError = true;
  linkLost(true);
  // Long enough that an ordered reload reconnects inside it, short enough
  // that a reader who quit is not left guessing.
  if (deathTimer === null) deathTimer = setTimeout(() => sessionOver("the server stopped answering — the session it served is gone"), 10000);
});
es.addEventListener("message", (ev) => {
  let a;
  try { a = JSON.parse(ev.data); } catch (e) { return; }
  applyAlive(a);
});
}

// THE AGENT'S TERMINAL. The pty host is a SIBLING process on its own port,
// because this page's process is the agent's grandchild and a grandchild
// cannot own its grandparent's terminal. The host holds the pseudo-terminal
// and the scrollback, so attaching after a refresh replays what was already
// there instead of losing the session. No host running: the placeholder
// stands and nothing else happens.
const TERM_PORT = 7334;
function loadAsset(href, kind) {
  return new Promise((resolve) => {
    const el = kind === "css" ? document.createElement("link") : document.createElement("script");
    if (kind === "css") { el.rel = "stylesheet"; el.href = href; } else { el.src = href; }
    el.onload = resolve;
    el.onerror = resolve;
    document.head.appendChild(el);
  });
}
async function bootTerminal() {
  const pane = document.getElementById("term-body");
  if (!pane || pane.dataset.booted) return;
  const base = "http://" + (location.hostname || "localhost") + ":" + TERM_PORT;
  try {
    const ping = await fetch(base + "/pty/alive");
    if (!ping.ok) return;
  } catch (e) { return; }
  // A HOST ANSWERED, so the pane earns its place. Until then it is not
  // there at all: manual mode and --own-terminal both leave it hidden.
  document.querySelectorAll(".no-host").forEach((el) => el.classList.remove("no-host"));
  // AN AGENT ANSWERED, so chat becomes the main card — but only if the reader
  // has not already chosen one. Their choice outranks ours, always.
  if (!new URLSearchParams(location.search).has("card") && !CHAT_LED) {
    CHAT_LED = true;
    const chat = CARDS.list.find((c) => c.id === "chat");
    if (chat !== undefined) promoteCard(chat.id);
  }
  pane.dataset.booted = "1";
  await loadAsset(base + "/xterm.css", "css");
  await loadAsset(base + "/xterm.js", "js");
  if (!window.Terminal) { pane.dataset.booted = ""; return; }
  pane.innerHTML = "";
  const term = new window.Terminal({
    fontFamily: "ui-monospace, Consolas, monospace",
    fontSize: 13,
    scrollback: 5000,
    theme: { background: cssPalette("--se-bg"), foreground: cssPalette("--se-fg") },
  });
  term.open(pane);
  term.onData((d) => { void fetch(base + "/pty/input", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ d }) }); });
  const stream = new EventSource(base + "/pty/stream");
  stream.addEventListener("message", (ev) => {
    const bin = atob(ev.data);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    term.write(arr);
  });
  // The host must be told the real size, or the agent wraps at the wrong
  // column. Measured from a real glyph rather than xterm's internals.
  const cell = () => {
    const m = document.createElement("span");
    m.style.cssText = "position:absolute;visibility:hidden;white-space:pre;font-family:ui-monospace,Consolas,monospace;font-size:13px";
    m.textContent = "0".repeat(100);
    document.body.appendChild(m);
    const r = m.getBoundingClientRect();
    m.remove();
    return { w: r.width / 100, h: r.height };
  };
  // see dsp-mirror-render.md#the-terminal-flicker-was-a-2-cycle
  const inner = () => {
    const s = getComputedStyle(pane);
    return {
      w: pane.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight),
      h: pane.clientHeight - parseFloat(s.paddingTop) - parseFloat(s.paddingBottom),
    };
  };
  let lastCols = 0;
  let lastRows = 0;
  let queued = false;
  let settleUntil = 0;
  let trailing = 0;
  const apply = () => {
    const c = cell();
    const box = inner();
    if (!(c.w > 0) || !(c.h > 0) || !(box.w > 0) || !(box.h > 0)) return;
    const cols = Math.max(20, Math.floor(box.w / c.w));
    const rows = Math.max(6, Math.floor(box.h / c.h));
    if (cols === lastCols && rows === lastRows) return;
    lastCols = cols;
    lastRows = rows;
    settleUntil = Date.now() + 250;
    term.resize(cols, rows);
    void fetch(base + "/pty/resize", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ cols, rows }) });
  };
  const sync = () => {
    const now = Date.now();
    if (now < settleUntil) {
      clearTimeout(trailing);
      trailing = setTimeout(sync, settleUntil - now + 20);
      return;
    }
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; apply(); });
  };
  new ResizeObserver(sync).observe(pane);
  sync();
}
// The host may come up after the page — RUNME detaches it, and it can be
// restarted under a standing mirror. So the ping keeps asking until one
// answers; bootTerminal returns at once once a terminal is attached.
void bootTerminal();
setInterval(() => { void bootTerminal(); }, 2000);
`;
