// THE PANES AND THE CARDS — opening a document, routing the details pane,
// the SVG viewbox, the draggable dividers, and the card grid.
//
// see dsp-mirror-render.md#the-client-script-is-served-in-parts

export const PANEL = `
async function openDoc(path, returnKey) {
  const r = await fetch("/doc?path=" + encodeURIComponent(path));
  const d = await r.json();
  // The subject is recorded, so a detached details window shows THIS
  // document rather than whatever was clicked before it.
  CURRENT_DETAIL = "doc:" + path;
  showDetails(path, '<div style="padding:2px 0 10px"><button class="ghost back" data-return="' + (returnKey || "comment") + '">‹ back</button></div><div class="docview">' + d.html + "</div>");
}
// The trace graph's nodes and its filters answer a click the same way every
// other element does: through detailFor and showDetails. The card carries its
// own subjects as JSON because it is rendered lazily, so they are not in D.
function traceDetail(id) {
  const tag = document.getElementById("se-trace");
  let map = {};
  try { map = JSON.parse(tag.textContent); } catch (e) { /* an unrendered card has no subjects */ }
  const d = map[id];
  if (!d) return [id, '<div class="meta">nothing recorded for this node</div>'];
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;");
  // THE PATH IS AN ADDRESS, so it opens — through .doclink, the same path
  // every other document link in the panel already takes. Printed as text it
  // told the reader where the node lives and made them go and find it.
  const where = d.path ? '<a class="doclink" data-path="' + esc(d.path) + '">' + esc(d.path) + "</a>" : "";
  return [id, '<div class="docview"><div class="meta">' + esc(d.type) + '</div><p style="white-space:pre-wrap">' + esc(d.statement) + '</p><div class="meta">' + where + "</div></div>"];
}
function detailFor(key) {
  if (key === "relay" && LAST_RELAY) return [LAST_RELAY.title, LAST_RELAY.html];
  if (key.startsWith("log:")) { void openLogDetail(key.slice(4)); return ["log entry", '<div class="meta">loading…</div>']; }
  if (key.startsWith("doc:")) { void openDoc(key.slice(4), "comment"); return [key.slice(4), '<div class="meta">loading…</div>']; }
  if (key.startsWith("form:")) { const fm = key.slice(5).split("@"); void showForm(fm[0], "details", fm[1]); return ["", '<div class="meta">loading…</div>']; }
  if (key.startsWith("cond:")) return condDetail(key.slice(5));
  if (key.startsWith("trace:")) return traceDetail(key.slice(6));
  if (key === "comment") {
    const txt = (D.comment || "").replace(/&/g,"&amp;").replace(/</g,"&lt;");
    return ["machine: " + D.viewed.id, '<div class="comment-detail">' + txt + "</div>" + jsonTable(D.viewed)];
  }
  if (key.startsWith("state:")) {
    // see dsp-mirror-render.md#the-machine-rides-inside-the-key
    const at = key.slice(6).split("@");
    const id = at[0];
    const mac = at[1] || "";
    const known = D.states[id];
    // ONE TRUTH, TWO RENDERS: a state with an
    // evidence form shows THE FORM as its details — the old detail view
    // stays only for form-less states. A state this page's view does not
    // know still resolves through its carried machine.
    if (known ? known.has_form : mac !== "") { void showForm(id, "details", mac || undefined); return ["", '<div class="meta">loading…</div>']; }
    return ["state: " + id, stateDetail(id)];
  }
  return [key, jsonTable({})];
}
document.addEventListener("click", async (ev) => {
  const cs = ev.target.closest ? ev.target.closest(".cur-state") : null;
  if (cs) {
    // The quick way home: jump the view to the walk's machine, whole
    // drawing visible (the saved pan is dropped so the state shows).
    sessionStorage.removeItem("se-vb-" + cs.dataset.machine);
    // The clicked button names WHICH state, so the details open on that one
    // rather than on whichever leg the default would have picked.
    navigateTo(
      "/?view=" + encodeURIComponent(cs.dataset.machine) + "&detail=" + encodeURIComponent("state:" + cs.dataset.state),
      "loading " + cs.dataset.machine,
    );
    return;
  }
});
let CURRENT_DETAIL = null;
// The last RELAYED card (help from another surface) — kept so a refresh
// re-shows it instead of clobbering the reader's place.
let LAST_RELAY = null;
document.addEventListener("click", (ev) => {
  const arrow = ev.target.closest ? ev.target.closest(".crumb-arrow") : null;
  document.querySelectorAll(".crumb-arrow.open").forEach((a) => { if (a !== arrow) a.classList.remove("open"); });
  if (arrow) { arrow.classList.toggle("open"); return; }
  const g = ev.target.closest ? ev.target.closest(".clickable") : null;
  if (g && g.dataset.detail) {
    CURRENT_DETAIL = g.dataset.detail;
    // The engine mirrors the selection, so a control in ANOTHER surface
    // (the sidebar's SET TARGET) can act on the state whose details show.
    // A state key stores its machine too, so a pop-out re-resolves the
    // SAME state instead of whatever its own view would answer.
    if (g.dataset.detail.startsWith("state:")) {
      CURRENT_DETAIL = g.dataset.detail + "@" + viewedMachine();
      void fetch("/selected", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ state: g.dataset.detail.slice(6), machine: viewedMachine() }) });
    }
    const [t, h] = detailFor(CURRENT_DETAIL); showDetails(t, h);
  }
});
// A GRID CELL OPENS ITS DETAIL (owner): the score grid shows
// the value; the anchor and the prior-art name sit behind the click, in
// the details pane like every other detail.
document.addEventListener("click", (ev) => {
  const c = ev.target.closest ? ev.target.closest(".sfgridcell") : null;
  if (!c) return;
  let row = []; let heads = [];
  try { row = JSON.parse(c.dataset.cell || "[]"); } catch (e) { /* an unfilled cell stays quiet */ }
  try { heads = JSON.parse((c.closest("table") || {}).dataset ? c.closest("table").dataset.cols || "[]" : "[]"); } catch (e) { /* no heads, no card */ }
  if (row.length === 0 || heads.length === 0) return;
  const kv = heads.map((h, i) => "<tr><td>" + escText(h) + "</td><td>" + escText(row[i] || "") + "</td></tr>").join("");
  showDetails(escText(row[0] || "") + " · " + escText(row[1] || ""), '<table class="kv">' + kv + "</table>");
});
// Double-click a sub-machine state: enter it as a VIEWER (walk unmoved).
document.addEventListener("dblclick", (ev) => {
  const g = ev.target.closest ? ev.target.closest(".clickable") : null;
  hostTrace("dblclick hit=" + (g === null ? "none" : "clickable") + " sub=" + (g === null ? "-" : String(g.dataset.sub)));
  if (g && g.dataset.sub) navigateTo("/?view=" + encodeURIComponent(g.dataset.sub), "loading " + g.dataset.sub);
});

// Only real widget expanders — the modal's ✕ shares the style, not the job.
// Delegated, so a morph may replace a widget head without losing the button.
document.addEventListener("click", (ev) => {
  const btn = ev.target.closest ? ev.target.closest(".expand[data-widget]") : null;
  if (!btn) return;
  ev.stopPropagation();
  const url = btn.dataset.url;
  // A NEW window every time, never a named one. The whole point is several
  // standing side by side, and a shared name reuses the first one forever.
  //
  // NOT INSIDE THE EDITOR. VS Code sandboxes its webview without allow-popups,
  // and a nested frame can only NARROW a sandbox, never widen one — so
  // window.open there does nothing at all. Branching on the modifier anyway
  // made ctrl-click and shift-click dead keys on this button. Falling through
  // to fullscreen is the in-place equivalent, and it already works.
  if (!EMBED && (ev.ctrlKey || ev.metaKey)) { window.open(frozenUrl(url), "_blank"); return; }
  if (!EMBED && ev.shiftKey) { window.open(frozenUrl(url), "_blank", "popup,width=1100,height=800"); return; }
  const w = document.getElementById(btn.dataset.widget);
  if (w) { if (document.fullscreenElement === w) document.exitFullscreen(); else w.requestFullscreen(); }
});

// Pan/zoom survives every refresh, per machine — a walk-driven update must
// not snap the reader's viewport back to the whole drawing. A morph rewrites
// the viewBox attribute, so the saved view is re-applied after every one.
function restoreViewBox() {
  const s = document.getElementById("machine-svg");
  if (!s) return;
  try {
    const saved = JSON.parse(sessionStorage.getItem("se-vb-" + D.viewed.id) || "null");
    if (saved && saved.w > 0) { const v = s.viewBox.baseVal; v.x = saved.x; v.y = saved.y; v.width = saved.w; v.height = saved.h; }
  } catch (e) { /* a broken save never blocks the drawing */ }
}
const svg = document.getElementById("machine-svg");
if (svg) {
  let vb = svg.viewBox.baseVal;
  const VB_KEY = "se-vb-" + D.viewed.id;
  restoreViewBox();
  const saveVb = () => { try { sessionStorage.setItem(VB_KEY, JSON.stringify({ x: vb.x, y: vb.y, w: vb.width, h: vb.height })); } catch (e) { /* storage full — the view just re-fits */ } };
  svg.addEventListener("wheel", (ev) => {
    ev.preventDefault();
    const scale = ev.deltaY > 0 ? 1.12 : 1 / 1.12;
    const pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    vb.x = p.x - (p.x - vb.x) * scale;
    vb.y = p.y - (p.y - vb.y) * scale;
    vb.width *= scale; vb.height *= scale;
    saveVb();
  }, { passive: false });
  let panning = null;
  svg.addEventListener("mousedown", (ev) => { panning = { x: ev.clientX, y: ev.clientY, vx: vb.x, vy: vb.y }; svg.classList.add("panning"); });
  window.addEventListener("mousemove", (ev) => {
    if (!panning) return;
    const r = svg.getBoundingClientRect();
    vb.x = panning.vx - (ev.clientX - panning.x) * (vb.width / r.width);
    vb.y = panning.vy - (ev.clientY - panning.y) * (vb.height / r.height);
  });
  window.addEventListener("mouseup", () => { if (panning) saveVb(); panning = null; svg.classList.remove("panning"); });
}

// see dsp-mirror-render.md#the-reader-keeps-their-pane
const PANE_KEY = "se-pane-";
function savePaneSize(pane, axis, px) {
  try { localStorage.setItem(PANE_KEY + pane.id + "-" + axis, String(Math.round(px))); } catch (e) { /* storage full — the pane just re-defaults */ }
}
function restorePaneSizes() {
  document.querySelectorAll(".divider").forEach((dv) => {
    const pane = document.getElementById(dv.dataset.pane);
    if (pane === null) return;
    const axis = dv.dataset.axis === "y" ? "height" : "width";
    let px = 0;
    try { px = Number(localStorage.getItem(PANE_KEY + pane.id + "-" + axis) || "0"); } catch (e) { /* no storage — the defaults stand */ }
    if (!(px > 0)) return;
    // A size saved on a wider screen must not push the rest of the layout
    // off a narrower one, so the stored value is a wish, not a command.
    const room = axis === "width" ? window.innerWidth : (pane.parentElement === null ? px : pane.parentElement.clientHeight);
    pane.style[axis] = Math.max(140, Math.min(px, room - 120)) + "px";
  });
}
restorePaneSizes();

// Each divider names the pane it moves and which side that pane sits on:
// a divider on the pane's far side grows it as you drag TOWARDS the pane.
// data-axis y makes it a horizontal splitter moving height instead of width.
document.querySelectorAll(".divider").forEach((dv) => {
  const pane = document.getElementById(dv.dataset.pane);
  if (pane === null) return;
  const vert = dv.dataset.axis === "y";
  const away = dv.dataset.grow === "right" || dv.dataset.grow === "bottom";
  let drag = null;
  dv.addEventListener("mousedown", (ev) => {
    drag = { at: vert ? ev.clientY : ev.clientX, size: vert ? pane.offsetHeight : pane.offsetWidth };
    ev.preventDefault();
  });
  window.addEventListener("mousemove", (ev) => {
    if (drag === null) return;
    const moved = (vert ? ev.clientY : ev.clientX) - drag.at;
    const want = drag.size + (away ? -moved : moved);
    if (!vert) { pane.style.width = Math.max(160, want) + "px"; return; }
    // The pane above must survive. Nothing caps this at half — dragging past
    // half is exactly what the owner asked for.
    const room = pane.parentElement === null ? want : pane.parentElement.clientHeight - 120;
    pane.style.height = Math.max(140, Math.min(want, room)) + "px";
  });
  window.addEventListener("mouseup", () => {
    if (drag === null) return;
    drag = null;
    savePaneSize(pane, vert ? "height" : "width", vert ? pane.offsetHeight : pane.offsetWidth);
  });
});

// THE CARDS. Promotion swaps a class and two CSS variables. Nothing moves, so
// every widget stays live — which is the whole reason the layout is one grid.
const CARDBLOB = document.getElementById("se-cards");
const CARDS = CARDBLOB === null ? { list: [], now: "" } : JSON.parse(CARDBLOB.textContent);
let CARD_NOW = new URLSearchParams(location.search).get("card") || CARDS.now;
let CARD_PREV = null;
// Chat is promoted once, the first time a host answers. Not on every poll.
let CHAT_LED = false;
function cardCell(id) {
  const i = CARDS.list.findIndex((c) => c.id === id);
  const at = i < 0 ? 0 : i;
  return { col: 3 + (at % 2), row: 1 + Math.floor(at / 2) };
}
function applyCards() {
  for (const c of CARDS.list) {
    const el = document.getElementById("card-" + c.id);
    if (el === null) continue;
    const cell = cardCell(c.id);
    el.style.setProperty("--col", String(cell.col));
    el.style.setProperty("--row", String(cell.row));
    el.classList.toggle("main", c.id === CARD_NOW);
  }
  // The legend takes the vacated slot, so where it sits IS the answer to
  // "which card is up front". The jump is the indicator, not a cost.
  const leg = document.getElementById("card-legend");
  if (leg !== null) {
    const cell = cardCell(CARD_NOW);
    leg.style.setProperty("--col", String(cell.col));
    leg.style.setProperty("--row", String(cell.row));
  }
}
function promoteCard(id) {
  if (!CARDS.list.some((c) => c.id === id)) return;
  // The same key again is the way back — the loop is chat, look, chat.
  if (id === CARD_NOW) { if (CARD_PREV !== null) promoteCard(CARD_PREV); return; }
  CARD_PREV = CARD_NOW;
  CARD_NOW = id;
  applyCards();
  // Pinned in the URL like view and detail, so the next morph agrees with
  // what the reader just did, and an F5 lands on the same card.
  const q = new URLSearchParams(location.search);
  q.set("card", id);
  history.replaceState(null, "", location.pathname + "?" + q.toString());
}
// NUMBER KEYS, NOT FUNCTION KEYS (owner ). F1, F5, F6, F11 and F12
// belong to the browser, and a laptop needs an Fn chord for them. A key never
// fires while the reader is typing — chat is a card you type in.
addEventListener("keydown", (ev) => {
  if (ev.ctrlKey || ev.metaKey || ev.altKey) return;
  const t = ev.target;
  if (t !== null && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
  // T AIMS THE BLUE LINE at whatever state the reader has open. It only sets
  // the destination; the walk still waits to be told to go, which is the
  // whole point of a target being separate from a tick.
  if (ev.key === "t" || ev.key === "T") {
    if (typeof CURRENT_DETAIL !== "string" || !CURRENT_DETAIL.startsWith("state:")) return;
    // The key may carry its machine after @ — the target wants the bare id.
    const to = CURRENT_DETAIL.slice(6).split("@")[0];
    ev.preventDefault();
    void fetch("/target", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ to }) }).then(async (r) => {
      try {
        const d = await r.json();
        if (d && (d.kind === "rejected" || d.error)) toast(d.expected || d.error || "refused");
      } catch (e) { /* not JSON */ }
    });
    return;
  }
  if (!/^[0-9]$/.test(ev.key)) return;
  const card = CARDS.list[Number(ev.key) - 1];
  if (card === undefined) return;
  ev.preventDefault();
  promoteCard(card.id);
});
// THE NUMBER IS A CONTROL, NOT A LABEL (owner ). Whatever the key
// does, clicking the badge does — including the press-again toggle back.
addEventListener("click", (ev) => {
  const badge = ev.target !== null && ev.target.closest !== undefined ? ev.target.closest(".cardnum") : null;
  if (badge === null) return;
  const card = badge.closest(".card");
  if (card === null) return;
  ev.preventDefault();
  ev.stopPropagation();
  promoteCard(card.id.replace(/^card-/, ""));
});
// 58/42 to start (owner ), then wherever the reader drags it,
// remembered exactly the way every other pane already is.
const CARDS_KEY = PANE_KEY + "cards-main";
const cardsEl = document.querySelector(".cards");
if (cardsEl !== null) {
  let saved = 0;
  try { saved = Number(localStorage.getItem(CARDS_KEY) || "0"); } catch (e) { /* no storage — the default stands */ }
  if (saved > 0) cardsEl.style.setProperty("--main-w", Math.max(240, Math.min(saved, window.innerWidth - 260)) + "px");
  const cdv = document.getElementById("div-cards");
  let cdrag = false;
  if (cdv !== null) {
    cdv.addEventListener("mousedown", (ev) => { cdrag = true; ev.preventDefault(); });
    window.addEventListener("mousemove", (ev) => {
      if (!cdrag) return;
      cardsEl.style.setProperty("--main-w", Math.max(240, Math.min(ev.clientX, window.innerWidth - 260)) + "px");
    });
    window.addEventListener("mouseup", () => {
      if (!cdrag) return;
      cdrag = false;
      const px = parseInt(cardsEl.style.getPropertyValue("--main-w"), 10);
      if (px > 0) { try { localStorage.setItem(CARDS_KEY, String(px)); } catch (e) { /* storage full */ } }
    });
  }
}
`;
