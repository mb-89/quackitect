// THE DETAILS PANE AND THE DSM EDITOR — the browser-side half.
//
// One part of the mirror's client script. The parts are joined in order and
// served as one script, so this is a slice of a single program rather than a
// module: what it declares, later parts use.
//
// see dsp-mirror-render.md#the-client-script-is-served-in-parts

export const DETAIL = `
// Re-read after every morph — a morph never re-runs a script tag.
let D = JSON.parse(document.getElementById("se-data").textContent);

function jsonTable(v) {
  if (v === null || v === undefined) return '<span class="vnull">null</span>';
  if (typeof v === "number") return '<span class="vnum">' + v + "</span>";
  if (typeof v === "boolean") return '<span class="vbool">' + v + "</span>";
  if (typeof v === "string") {
    // A PATH USED TO BE RECOGNISED BY ITS project/ PREFIX. The folder levels
    // collapsed and no path carries one, so the shape is the whole test now:
    // no spaces, a folder separator, a suffix after the last one, and not a URL.
    const looksLikePath = !v.includes(" ") && !v.includes("://") && v.includes("/") && v.lastIndexOf(".") > v.lastIndexOf("/");
    if (looksLikePath) {
      return '<a class="doclink" data-path="' + v + '">' + v + "</a>";
    }
    const escaped = v.replace(/&/g,"&amp;").replace(/</g,"&lt;");
    // Paragraphs survive the pane: a multi-line string keeps its breaks
    // (HTML collapses raw newlines - the wall-of-text bug, owner ).
    if (v.includes("\\n")) return '<div class="vstr prewrap">' + escaped + "</div>";
    return '<span class="vstr">' + escaped + "</span>";
  }
  if (Array.isArray(v)) {
    if (v.length === 0) return '<span class="vnull">[]</span>';
    const table = '<table class="kv">' + v.map((x, i) => '<tr><td class="k">' + i + '</td><td class="v">' + jsonTable(x) + "</td></tr>").join("") + "</table>";
    if (v.length > 3) return '<details><summary style="cursor:pointer;color:var(--se-muted)">' + v.length + " items</summary>" + table + "</details>";
    return table;
  }
  const keys = Object.keys(v);
  if (keys.length === 0) return '<span class="vnull">{}</span>';
  return '<table class="kv">' + keys.map((k) => '<tr><td class="k">' + k + '</td><td class="v">' + jsonTable(v[k]) + "</td></tr>").join("") + "</table>";
}

const REC_DECS = {};
async function loadRecDecisions() {
  for (const el of document.querySelectorAll(".recdecisions[data-exp]:not([data-loaded])")) {
    el.dataset.loaded = "1";
    try {
      const r = await fetch("/api/recdecisions?exp=" + encodeURIComponent(el.dataset.exp));
      const d = await r.json();
      REC_DECS[el.dataset.exp] = d.visits || [];
      const badge = { open: "●", done: "✓", obsolete: "⊘", reverted: "↩", deferred: "→" };
      el.innerHTML = (d.visits || []).map((v) => {
        const kids = {};
        v.nodes.forEach((n) => { (kids[n.parent || ""] = kids[n.parent || ""] || []).push(n); });
        const tree = (pid, depth) => (kids[pid] || []).map((n) =>
          '<div class="dnode recnode s-' + n.status + '" data-exp="' + escText(el.dataset.exp) + '" data-visit="' + escText(v.visit) + '" data-node="' + n.id + '" style="margin-left:' + depth * 14 + 'px" title="' + n.id + " · " + n.status + '">' + (badge[n.status] || "·") + " " + escText(n.brief) + "</div>" + tree(n.id, depth + 1)
        ).join("");
        return '<details class="visitdec"><summary class="meta" style="cursor:pointer;padding:8px 0 4px">' + escText(v.visit) + "</summary>" + (tree("", 0) || '<div class="meta">no decisions</div>') + '<div class="recinfo"></div></details>';
      }).join("") || '<div class="meta">no decisions recorded</div>';
    } catch (e) {
      el.innerHTML = '<div class="meta">decisions unavailable</div>';
    }
  }
}
// see dsp-mirror-render.md#the-visit-to-dos
async function loadStateTodos() {
  for (const el of document.querySelectorAll(".statetodos[data-state]:not([data-loaded])")) {
    el.dataset.loaded = "1";
    try {
      const r = await fetch("/api/statetodos?state=" + encodeURIComponent(el.dataset.state));
      const d = await r.json();
      const badge = { open: "●", done: "✓", obsolete: "⊘", reverted: "↩", deferred: "→" };
      const origin = (n) => n.origin === "deferred" && n.trail && n.trail.length > 1 ? "deferred from " + n.trail[n.trail.length - 2] : n.origin === "fork" ? "fork" : "planned here";
      let html = (d.visits || []).map((v) => {
        const items = v.nodes.map((n) =>
          '<div class="dnode s-' + n.status + '" title="' + n.id + " · " + n.status + '">' + (badge[n.status] || "·") + " " + escText(n.brief) + ' <span class="todo-origin">' + escText(origin(n)) + "</span></div>"
        ).join("");
        return '<details class="visitdec"><summary class="meta" style="cursor:pointer;padding:8px 0 4px">to-dos · entry ' + (v.visit.split("@")[1] || "0") + "</summary>" + items + "</details>";
      }).join("");
      if ((d.parked || []).length) {
        html += '<details class="visitdec"><summary class="meta" style="cursor:pointer;padding:8px 0 4px">parked — arrives on entry</summary>' +
          d.parked.map((p) => '<div class="dnode s-deferred">→ ' + escText(p.brief) + ' <span class="todo-origin">' + escText(p.trail && p.trail.length > 1 ? "deferred from " + p.trail[p.trail.length - 2] : "deferred here") + "</span></div>").join("") + "</details>";
      }
      el.innerHTML = html;
    } catch (e) {
      el.innerHTML = "";
    }
  }
}
let DETAIL_TITLE = null;
let DETAIL_HTML = null;
function showDetails(title, html) {
  const el = document.getElementById("details");
  if (!el) {
    // A SOLO CARD HAS NO DETAILS PANE OF ITS OWN. Embedded, details are a
    // surface the HOST owns, so the subject travels out to it. Dropping it
    // here is what made clicking a state do nothing at all.
    // Being IN A FRAME is the test, not the embed flag: this runs before the
    // flag is initialised, and a frame is exactly when a host is listening.
    if (window.parent !== window) window.parent.postMessage({ se: "details", title: title, html: html }, "*");
    return;
  }
  // NOTHING CHANGED, NOTHING MOVES. rebind() re-derives this pane after every
  // morph. Rewriting identical markup flickered it and threw the reader's
  // scroll position away while they were reading. The pane carries
  // data-morph-ignore for exactly this reason; this is the same guard on the
  // path the morph does not own.
  if (DETAIL_TITLE === title && DETAIL_HTML === html) return;
  const sameSubject = DETAIL_TITLE === title;
  DETAIL_TITLE = title;
  DETAIL_HTML = html;
  // Same subject with new content keeps the reader's place. A DIFFERENT
  // subject starts at the top, because a position in the old one means
  // nothing here. sePlaceKeepScrollForSubject is the one decider.
  sePlaceKeepScrollForSubject(el, sameSubject, () => {
    document.getElementById("details-title").textContent = title;
    el.innerHTML = html;
  });
  queueMicrotask(() => { void loadRecDecisions(); void loadStateTodos(); });
}
// THE MODAL — one surface over the grayed page (forms, tool calls,
// escape). Click outside or ✕ returns to the layout untouched.
function openModal(title, html) {
  const m = document.getElementById("modal");
  if (!m) return;
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = html;
  m.style.display = "flex";
}
function closeModal() { const m = document.getElementById("modal"); if (m) m.style.display = "none"; }
let TOAST_TIMER = null;
function toast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.style.display = "block";
  clearTimeout(TOAST_TIMER);
  TOAST_TIMER = setTimeout(() => { t.style.display = "none"; }, 1800);
}
document.addEventListener("click", (ev) => {
  if (ev.target && ev.target.id === "modal") { closeModal(); return; }
  const mc = ev.target.closest ? ev.target.closest("#modal-close") : null;
  if (mc) closeModal();
});
// THE MATRIX PAGES ITSELF, with no round trip. Every cell is already in the
// DOM, so a page turn is a display toggle and nothing typed can be lost by it.
function dsmApply(w) {
  const size = Number(w.getAttribute("data-size")) || 10;
  const n = Number(w.getAttribute("data-n")) || 0;
  const last = Math.max(0, Math.ceil(n / size) - 1);
  const g = Number(w.getAttribute("data-g")) || 0;
  const glast = Math.max(0, Math.ceil(g / size) - 1);
  const rp = Math.min(last, Math.max(0, Number(w.getAttribute("data-rp")) || 0));
  const cp = Math.min(last, Math.max(0, Number(w.getAttribute("data-cp")) || 0));
  const gp = Math.min(glast, Math.max(0, Number(w.getAttribute("data-gp")) || 0));
  w.setAttribute("data-rp", String(rp));
  w.setAttribute("data-cp", String(cp));
  w.setAttribute("data-gp", String(gp));
  // THE CLUSTER LIST PAGES TOO, at the same size, so the panel beside the
  // matrix never runs taller than the matrix itself.
  w.querySelectorAll(".dsmg").forEach((tr) => {
    const k = Number(tr.getAttribute("data-g"));
    tr.style.display = k >= gp * size && k < (gp + 1) * size ? "" : "none";
  });
  w.querySelectorAll(".dsmr").forEach((tr) => {
    const r = Number(tr.getAttribute("data-r"));
    tr.style.display = r >= rp * size && r < (rp + 1) * size ? "" : "none";
  });
  w.querySelectorAll(".dsmc").forEach((td) => {
    const c = Number(td.getAttribute("data-c"));
    td.style.display = c >= cp * size && c < (cp + 1) * size ? "" : "none";
  });
  w.querySelectorAll(".dsmat").forEach((s) => {
    const kind = s.getAttribute("data-kind");
    const p = kind === "r" ? rp : kind === "g" ? gp : cp;
    const total = kind === "g" ? g : n;
    s.textContent = String(total === 0 ? 0 : p * size + 1) + "-" + String(Math.min(total, (p + 1) * size)) + " of " + total;
  });
}
// ROWS AND COLUMNS PAGE INDEPENDENTLY, because a square window hides exactly
// the off-diagonal marks that say two distant elements are coupled.
document.addEventListener("click", (ev) => {
  const t = ev.target;
  if (!t || !t.closest) return;
  const pg = t.closest(".dsmpg");
  if (pg) {
    const w = pg.closest(".dsmwrap");
    const kind = pg.getAttribute("data-kind");
    const key = kind === "r" ? "data-rp" : kind === "g" ? "data-gp" : "data-cp";
    w.setAttribute(key, String((Number(w.getAttribute(key)) || 0) + Number(pg.getAttribute("data-step"))));
    dsmApply(w);
    return;
  }
  // CLICKING A CLUSTER CENTRES IT ON BOTH AXES. On a register-sized matrix,
  // finding a group by paging is the slow way to look at it.
  const go = t.closest(".dsmgo");
  if (go) {
    const w = go.closest(".dsmwrap");
    const size = Number(w.getAttribute("data-size")) || 10;
    const page = String(Math.max(0, Math.floor(Number(go.getAttribute("data-at")) / size)));
    w.setAttribute("data-rp", page);
    w.setAttribute("data-cp", page);
    dsmApply(w);
  }
});
document.addEventListener("change", (ev) => {
  const t = ev.target;
  if (!t || !t.closest) return;
  const s = t.closest(".dsmsize");
  if (s) {
    const w = s.closest(".dsmwrap");
    w.setAttribute("data-size", s.value);
    dsmApply(w);
    return;
  }
  // MOVING A FUNCTION REPAINTS ITS CLUSTER COLUMN AT ONCE. Waiting for a
  // save to see where a row went makes the matrix unusable for the one thing
  // it is for, which is trying groupings out.
  const p = t.closest(".dsmdsel");
  if (p) {
    const row = p.closest(".dsmr");
    const cell = row ? row.querySelector(".dsmcl") : null;
    if (cell) cell.textContent = p.value === "" ? "-" : p.value;
    dsmBoxes(p.closest(".dsmwrap"));
  }
});
/** THE BOXES ARE REDRAWN FROM THE LIVE PICKERS, never left as the server drew
 *  them. Server-drawn borders are a picture of the assignment as it WAS, so
 *  moving two functions into one cluster left the boxes where they were. */
function dsmBoxes(w) {
  const cls = [];
  w.querySelectorAll(".dsmr").forEach((tr) => {
    const sel = tr.querySelector(".dsmdsel");
    cls[Number(tr.getAttribute("data-r"))] = sel ? sel.value : "";
  });
  const n = cls.length;
  const grid = "1px solid var(--se-border)";
  const edge = "2px solid var(--se-accent)";
  w.querySelectorAll(".dsmr").forEach((tr) => {
    const i = Number(tr.getAttribute("data-r"));
    tr.querySelectorAll(".dsmc").forEach((td) => {
      const j = Number(td.getAttribute("data-c"));
      // BACK TO THE GRID FIRST. Clearing to empty would drop the cell's own
      // ruling too, and the matrix would lose its lines wherever a box moved.
      td.style.borderTop = grid;
      td.style.borderBottom = grid;
      td.style.borderLeft = grid;
      td.style.borderRight = grid;
      const c = cls[i] || "";
      if (c === "" || c !== (cls[j] || "")) return;
      if (i === 0 || (cls[i - 1] || "") !== c) td.style.borderTop = edge;
      if (i === n - 1 || (cls[i + 1] || "") !== c) td.style.borderBottom = edge;
      if (j === 0 || (cls[j - 1] || "") !== c) td.style.borderLeft = edge;
      if (j === n - 1 || (cls[j + 1] || "") !== c) td.style.borderRight = edge;
    });
  });
}
/** SORT PERMUTES BOTH AXES. A DSM whose rows and columns disagree is not a
 *  DSM — the diagonal stops being the diagonal and every box lands on the
 *  wrong pair. Reordering rows alone corrupts the picture silently. */
function dsmSort(w) {
  const table = w.querySelector("table");
  const rows = [...w.querySelectorAll(".dsmr")];
  const keyOf = (r) => {
    const sel = r.querySelector(".dsmdsel");
    const v = sel ? sel.value : "";
    return (v === "" ? "zzzz" : v) + "|" + String(r.getAttribute("data-r")).padStart(4, "0");
  };
  rows.sort((a, b) => (keyOf(a) < keyOf(b) ? -1 : 1));
  const perm = rows.map((r) => Number(r.getAttribute("data-r")));
  const move = (host) => {
    const byOld = {};
    host.querySelectorAll(".dsmc").forEach((c) => { byOld[c.getAttribute("data-c")] = c; });
    perm.forEach((old, k) => {
      const c = byOld[String(old)];
      if (!c) return;
      c.setAttribute("data-c", String(k));
      host.appendChild(c);
    });
  };
  const head = table.querySelector("tr");
  if (head) move(head);
  rows.forEach((r, i) => {
    r.setAttribute("data-r", String(i));
    move(r);
    const num = r.querySelector(".dsmn");
    if (num) num.textContent = String(i + 1);
    table.appendChild(r);
  });
  dsmApply(w);
  dsmBoxes(w);
}
/** THE NEXT FREE LABEL, zero-padded so the list keeps sorting as numbers. */
function dsmNextLabel(w) {
  let n = 0;
  w.querySelectorAll(".dsmg").forEach((tr) => {
    const v = String(tr.getAttribute("data-c") || "").replace("c", "");
    if (Number(v) > n) n = Number(v);
  });
  return "c" + String(n + 1).padStart(2, "0");
}
document.addEventListener("click", (ev) => {
  const t = ev.target;
  if (!t || !t.closest) return;
  const add = t.closest(".dsmadd");
  if (add) {
    const w = add.closest(".dsmwrap");
    const c = dsmNextLabel(w);
    const tb = add.closest("table");
    const proto = w.querySelector(".dsmg");
    if (proto) {
      const row = proto.cloneNode(true);
      row.setAttribute("data-c", c);
      row.setAttribute("data-g", String(w.querySelectorAll(".dsmg").length));
      row.querySelectorAll("[data-item]").forEach((el) => { el.setAttribute("data-item", c); if (el.tagName === "INPUT") el.value = ""; else el.selectedIndex = 0; });
      const jump = row.querySelector(".dsmgo");
      if (jump) jump.textContent = c;
      const del = row.querySelector(".dsmdel");
      if (del) del.setAttribute("data-c", c);
      tb.appendChild(row);
    }
    // EVERY ROW PICKER GAINS THE OPTION, or the new cluster is one nobody
    // could put anything into.
    w.querySelectorAll(".dsmdsel").forEach((sel) => {
      const o = document.createElement("option");
      o.value = c;
      o.textContent = c;
      sel.appendChild(o);
    });
    w.setAttribute("data-g", String(w.querySelectorAll(".dsmg").length));
    dsmApply(w);
    dsmBoxes(w);
    return;
  }
  // REMOVING A CLUSTER UNCLUSTERS ITS FUNCTIONS. They are not deleted and not
  // moved somewhere arbitrary — they go back to unplaced, which is the honest
  // state for a function whose group just stopped existing.
  const del = t.closest(".dsmdel");
  if (del) {
    const w = del.closest(".dsmwrap");
    const c = del.getAttribute("data-c");
    w.querySelectorAll(".dsmdsel").forEach((sel) => {
      if (sel.value === c) { sel.value = ""; const row = sel.closest(".dsmr"); const cell = row ? row.querySelector(".dsmcl") : null; if (cell) cell.textContent = "-"; }
      sel.querySelectorAll("option").forEach((o) => { if (o.value === c) o.remove(); });
    });
    const row = del.closest(".dsmg");
    if (row) row.remove();
    w.querySelectorAll(".dsmg").forEach((r, i) => { r.setAttribute("data-g", String(i)); });
    w.setAttribute("data-g", String(w.querySelectorAll(".dsmg").length));
    dsmApply(w);
    dsmBoxes(w);
    return;
  }
  // SORT REORDERS BY THE CURRENT ASSIGNMENT, putting the blocks back on the
  // diagonal after a hand move. It does not re-run the search — that would
  // overwrite the decision the move just made.
  const so = t.closest(".dsmsort");
  if (so) dsmSort(so.closest(".dsmwrap"));
});
`;
