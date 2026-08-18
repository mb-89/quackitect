// THE BROWSER-SIDE APPLICATION, carried as one string and served with the page.
//
// It is 2,000 lines of JavaScript that never runs in the engine — it runs in
// the reader's panel. It lived inside render.ts, which made that file look
// like it did one job when it did three: the server HTML, the stylesheet, and
// this.
//
// It stays a string because the mirror is a page we serve ourselves: no
// bundler, no build step, no nonce. see dsp-mirror-render.md#the-native-skin
import { editorBehaviourBlocks, editorCollectBranches, editorRenderBranches } from "./editors/index.ts";

export const SCRIPT = `
// Re-read after every morph — a morph never re-runs a script tag.
let D = JSON.parse(document.getElementById("se-data").textContent);

function jsonTable(v) {
  if (v === null || v === undefined) return '<span class="vnull">null</span>';
  if (typeof v === "number") return '<span class="vnum">' + v + "</span>";
  if (typeof v === "boolean") return '<span class="vbool">' + v + "</span>";
  if (typeof v === "string") {
    const looksLikePath = v.startsWith("project/") && !v.includes(" ") && v.lastIndexOf(".") > v.lastIndexOf("/");
    if (looksLikePath) {
      return '<a class="doclink" data-path="' + v + '">' + v + "</a>";
    }
    const escaped = v.replace(/&/g,"&amp;").replace(/</g,"&lt;");
    // Paragraphs survive the pane: a multi-line string keeps its breaks
    // (HTML collapses raw newlines - the wall-of-text bug, owner 2026-07-28).
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
  // nothing here.
  const top = sameSubject ? el.scrollTop : 0;
  document.getElementById("details-title").textContent = title;
  el.innerHTML = html;
  el.scrollTop = top;
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
// THE PARITY LAW — a state's human-callable tools as links; the modal
// takes the arguments and shows the result in place.
const HUMAN_TOOLS = {
  se_seed_expedition: [{ name: "kind", hint: "spike | fix | explore" }, { name: "goal", hint: "what this expedition is after", long: true }, { name: "depends_on", hint: "ids this waits for, comma-separated — leave EMPTY to state that it waits for nothing", always: true }],
  se_seed_iteration: [{ name: "goal", hint: "what this iteration is after", long: true }, { name: "vision", hint: "roughly how — what done looks like", long: true }, { name: "inputs", hint: "context refs, comma-separated: an expedition id, note refs" }, { name: "depends_on", hint: "ids this waits for, comma-separated — leave EMPTY to state that it waits for nothing; the container orders the work from this", always: true }],
  se_reload: [],
  // see dsp-mirror-render.md#no-arguments
  se_survey: [],
  se_exp_close: [{ name: "merge", hint: "true = apply: merge to trunk (default); false = dismiss: archive unmerged" }],
  se_note_drain: [
    { name: "ref", hint: "the note's ref (note-…) — the feed shows it" },
    { name: "disposition", hint: "done | obsolete | carried | backlog" },
    { name: "where", hint: "where it landed or lives on — backlog REQUIRES it: ready when …" },
    { name: "statement", hint: "backlog REQUIRES it: what the work token IS, in your own words — a paste of the note refuses" },
  ],
};
function toolModal(name) {
  const fields = HUMAN_TOOLS[name] || [];
  let html = fields.map((f) =>
    '<div style="padding:6px 0 2px"><b>' + f.name + '</b></div><div class="comment-text">' + escText(f.hint) + "</div>" +
    (f.long ? '<textarea class="formfield toolarg"' + (f.always ? ' data-always="1"' : '') + ' data-arg="' + f.name + '"></textarea>' : '<input class="formfield toolarg"' + (f.always ? ' data-always="1"' : '') + ' style="min-height:0" data-arg="' + f.name + '">')
  ).join("");
  html += '<div style="padding:10px 0"><button class="primary runtool" data-tool="' + name + '">run</button></div><div id="tool-result"></div>';
  openModal("tool · " + name, html);
}
document.addEventListener("click", async (ev) => {
  const tl = ev.target.closest ? ev.target.closest(".toollink") : null;
  if (tl) {
    // A tool link exists everywhere the tool is listed; it WORKS only
    // where the state gate allows — elsewhere, a short toast.
    const legal = D.packet.legal_tools;
    const enabled = legal === "all" || (Array.isArray(legal) && legal.includes(tl.dataset.tool));
    if (enabled) toolModal(tl.dataset.tool); else toast("tool disabled");
    return;
  }
  const rt = ev.target.closest ? ev.target.closest(".runtool") : null;
  if (rt) {
    const args = {};
    // AN ALWAYS FIELD SENDS ITS BLANK. Dropping empties is right for an
    // optional argument and wrong for a required one: the box was shown, so
    // leaving it empty is the person's answer, not their silence.
    document.querySelectorAll(".toolarg").forEach((i) => { if (i.value !== "" || i.dataset.always) args[i.dataset.arg] = i.value; });
    const r = await fetch("/tool", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: rt.dataset.tool, args }) });
    const data = await r.json();
    const out = document.getElementById("tool-result");
    if (out) out.innerHTML = jsonTable(data);
    refreshLog();
    return;
  }
  const eb = ev.target.closest ? ev.target.closest("#escape-btn") : null;
  if (eb) {
    openModal("escape — to idle", '<div class="comment-text">The machine is left standing; a later continue re-enters it. The reason is recorded as a failure.</div><textarea class="formfield" id="escape-reason" placeholder="why the walk cannot continue"></textarea><div style="padding:10px 0"><button class="primary" id="escape-go">escape</button></div>');
    return;
  }
  const eg = ev.target.closest ? ev.target.closest("#escape-go") : null;
  if (eg) {
    const reason = (document.getElementById("escape-reason") || {}).value || "";
    await fetch("/escape", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ reason }) });
    location.href = "/";
    return;
  }
});
// see dsp-mirror-render.md#the-walk-stands-in-several-states-at-once
let CURRENTS = (D.describe.active || []).map(function (a) { return a.split("/").pop(); });
// The details panel opens on ONE state, because a panel shows one thing.
// That is a default, never a claim that the other legs are not standing.
let CURRENT = CURRENTS.length > 0 ? CURRENTS[0] : null;
function standingAt(id) { return WALK_HERE && CURRENTS.indexOf(id) >= 0; }
let WALK_HERE = D.viewingWalk;
function nextTable(id, s) {
  const here = standingAt(id);
  // THE NEW WAY (owner ruling 2026-07-30): the host's own elements, the same
  // ones the facts and the pull already use. A bordered table nested inside
  // another bordered table was the last of the old rendering left in here.
  const field = (k, v) => (v === undefined || v === null || v === "") ? ""
    : '<vscode-form-group variant="horizontal"><vscode-label>' + k + "</vscode-label>"
      + '<div class="fval">' + escText(String(v)) + "</div></vscode-form-group>";
  return s.next.map((n) => {
    const unlocked = here && s.exit_met && n.enter_met;
    // The locked tooltip NAMES what is missing — never a bare "not met".
    const exitMiss = s.exit ? Object.entries(s.exit).filter(([, c]) => !c.met).map(([k]) => "condition " + k) : [];
    const title = unlocked
      ? "tick: leave " + id + ", enter " + n.to
      : !s.exit_met
        ? "leaving " + id + " waits on:\\n" + (exitMiss.join("\\n") || "its exit conditions")
        : "entering " + n.to + " waits on:\\n" + ((n.missing || []).join("\\n") || "its entry conditions");
    // The walk moves on the agent's pull. Nothing here drives it.
    const btn = here ? '<span class="meta" title="' + escText(title) + '">' + (unlocked ? "open" : "waiting") + "</span>" : "";
    return '<div class="nextitem' + (unlocked ? " open" : "") + '">'
      + '<div class="nexthead"><span class="nextto">' + escText(n.to) + "</span>" + btn + "</div>"
      + field("role", n.role) + field("guard", n.guard) + field("statement", n.statement)
      + "</div>";
  }).join("");
}
// see dsp-mirror-render.md#the-check-is-the-readers-proof
function docChecked(p) {
  return p.checked === true || (D.checkedDocs || []).indexOf(p.path) >= 0;
}
function docRow(p) {
  // The link sits BESIDE the box, never inside its label: a label swallows
  // the click, and the reader would open nothing while checking by accident.
  const on = docChecked(p);
  return '<div class="docline">'
    + '<vscode-checkbox class="docheck" data-path="' + p.path + '"' + (on ? " checked disabled" : "")
    + ' title="' + (on ? "read (this version)" : "check = I read this version") + '"></vscode-checkbox>'
    + '<a class="doclink" data-path="' + p.path + '">' + p.path + "</a></div>";
}
function pulledView(pulled) {
  const bySource = {};
  for (const p of pulled) for (const src of p.sources) (bySource[src] ??= []).push(p);
  // The engine calls the always-on set "root". The reader sees a PULL, and
  // that is the word the fold wears (owner ruling 2026-07-30).
  const SRC_LABEL = { root: "pull" };
  return Object.entries(bySource).map(([srcName, docs]) => {
    const done = docs.filter(docChecked).length;
    // Open while there is still something to read; folded once it is done.
    return '<vscode-collapsible title="' + escText(SRC_LABEL[srcName] || srcName) + '" description="' + done + "/" + docs.length + ' read"' + (done < docs.length ? " open" : "") + ">"
      + '<div class="collbody">' + docs.map(docRow).join("") + "</div></vscode-collapsible>";
  }).join("");
}
// The state's own fields. A scalar is one labelled row; prose folds into its
// own section, because guidance is paragraphs and does not belong in a cell.
function factsView(o) {
  const PROSE = { statement: 1, guidance: 1 };
  let rows = "";
  let prose = "";
  for (const k in o) {
    const v = o[k];
    if (v === undefined || v === null || v === "") continue;
    if (PROSE[k]) {
      prose += '<vscode-collapsible title="' + escText(k) + '" open><div class="collbody comment-detail">' + escText(String(v)) + "</div></vscode-collapsible>";
      continue;
    }
    // A boolean is a state, not a word. The host's own pass icon carries it,
    // so the colour follows the reader's theme rather than our palette.
    let cell;
    if (typeof v === "boolean") cell = '<vscode-icon name="' + (v ? "pass" : "circle-slash") + '" class="' + (v ? "ok" : "no") + '" label="' + (v ? "yes" : "no") + '"></vscode-icon>';
    else if (typeof v === "object") cell = escText(JSON.stringify(v));
    else cell = escText(String(v));
    rows += '<vscode-form-group variant="horizontal"><vscode-label>' + escText(k) + "</vscode-label>"
      + '<div class="fval">' + cell + "</div></vscode-form-group>";
  }
  return rows + prose;
}
function stateDetail(id) {
  const s = D.states[id] ?? {};
  const bare = Object.assign({}, s); delete bare.next; delete bare.pulled; delete bare.script; delete bare.was_filled; delete bare.legal_tools;
  let html = factsView(bare);
  // Legal tools — human-callable ones are LINKS everywhere they appear
  // (parity law); a link outside its state just toasts "tool disabled".
  const tools = [...new Set(s.legal_tools || [])];
  if (tools.length > 0) {
    const link = (t) => '<a class="toollink" data-tool="' + t + '">' + t + "</a>";
    const line = (t) => '<div class="docline">' + (HUMAN_TOOLS[t] !== undefined ? link(t) : escText(t)) + "</div>";
    // "all" stays written as all — and EXPANDS into the human-callable
    // links (parity law), the same fold the pull uses.
    const all = tools.includes("all");
    const inner = all ? Object.keys(HUMAN_TOOLS).map(line).join("") : tools.map(line).join("");
    html += '<vscode-collapsible title="legal tools" description="' + (all ? "all — the human-callable set" : tools.length + " listed") + '">'
      + '<div class="collbody">' + inner + "</div></vscode-collapsible>";
  }
  if (s.pulled && s.pulled.length > 0) {
    // One fold per source rather than a fold inside a fold — the reader is
    // after the documents, not the nesting.
    html += '<div class="meta" style="padding:8px 0 4px" title="derived by the machine, not authored">pulled</div>' + pulledView(s.pulled);
  }
  if (s.archive_record !== undefined) {
    const e = s.archive_record;
    // ONE rendering, in the table (owner ruling 2026-07-27): the ruling is
    // its own key; report is a LINK opening the big modal (ctrl: tab,
    // shift: window). No duplicate prose below.
    if (!e) html += '<div class="vnull">no record found</div>';
    else {
      html += '<table class="kv">'
        + '<tr><td class="k">expedition</td><td class="v">' + escText(e.id) + "</td></tr>"
        + (e.status ? '<tr><td class="k">status</td><td class="v">' + escText(e.status) + "</td></tr>" : "")
        + ((e.ruling || e.report) ? '<tr><td class="k">ruling</td><td class="v">' + escText(e.ruling || e.report) + "</td></tr>" : "")
        + '<tr><td class="k">report</td><td class="v"><a class="replink" data-exp="' + escText(e.id) + '" data-path="project/spec/expeditions/' + escText(e.id) + '/report.md" data-title="report · ' + escText(e.id) + '" title="click: modal · ctrl-click: new tab · shift-click: new window">report.md</a></td></tr>'
        + "</table>";
      // The decision history, one expandable section per visit — the same
      // tree the log click renders, collapsed by default (owner ruling).
      html += '<div class="recdecisions" data-exp="' + escText(e.id) + '"><div class="meta">loading decisions…</div></div>';
    }
  }
  html += '<div class="statetodos" data-state="' + id + '"></div>';
  if (s.next && s.next.length > 0) {
    html += '<div class="meta" style="padding:8px 0 4px">next</div>' + nextTable(id, s);
  }
  if (standingAt(id) && s.kind === "end" && (!s.next || s.next.length === 0) && D.describe.breadcrumb.length > 1) {
    const parent = D.describe.breadcrumb[0];
    html += '<div class="meta" style="padding:8px 0 4px">next</div>' +
      '<div class="nextitem open"><div class="nexthead"><span class="nextto">return to ' + escText(parent) + "</span></div></div>";
  }
  return html;
}
// see dsp-mirror-render.md#the-page-updates-in-place
function sameNode(a, b) {
  if (a.nodeType !== b.nodeType) return false;
  if (a.nodeType !== 1) return true;
  return a.tagName === b.tagName && (a.id || "") === (b.id || "");
}
function morph(from, to) {
  if (from.nodeType !== 1) { if (from.nodeValue !== to.nodeValue) from.nodeValue = to.nodeValue; return; }
  if (from.hasAttribute("data-morph-ignore")) return;
  // A pane the reader has dragged owns its own width — the server never
  // sent that style, so morphing would silently snap it back.
  const keepsStyle = from.hasAttribute("data-keep-style");
  for (const a of to.attributes) if (!(keepsStyle && a.name === "style") && from.getAttribute(a.name) !== a.value) from.setAttribute(a.name, a.value);
  for (const a of [...from.attributes]) if (!to.hasAttribute(a.name) && !(keepsStyle && a.name === "style")) from.removeAttribute(a.name);
  // A control under the reader's hand stays theirs until they leave it.
  if (from.tagName === "INPUT" && from !== document.activeElement && to.hasAttribute("value")) from.value = to.getAttribute("value");
  const byId = new Map();
  for (const c of from.children) if (c.id !== "") byId.set(c.id, c);
  let cur = from.firstChild;
  for (const t of [...to.childNodes]) {
    let match = t.nodeType === 1 && t.id !== "" ? byId.get(t.id) : undefined;
    if (match === undefined && cur !== null && sameNode(cur, t)) match = cur;
    if (match === undefined) { from.insertBefore(document.importNode(t, true), cur); continue; }
    if (match !== cur) from.insertBefore(match, cur);
    morph(match, t);
    cur = match.nextSibling;
  }
  while (cur !== null) { const next = cur.nextSibling; from.removeChild(cur); cur = next; }
}
// Everything derived FROM a render has to be derived again after one.
function rebind() {
  const blob = document.getElementById("se-data");
  if (blob) D = JSON.parse(blob.textContent);
  CURRENTS = (D.describe.active || []).map(function (a) { return a.split("/").pop(); });
  CURRENT = CURRENTS.length > 0 ? CURRENTS[0] : null;
  WALK_HERE = D.viewingWalk;
  // Without this the next poll compares against the OLD position forever.
  ACTIVE_AT_RENDER = JSON.stringify(D.describe.active || []);
  TARGET_AT_RENDER = D.target || "";
  restoreViewBox();
  if (CURRENT_DETAIL) { const dp = detailFor(CURRENT_DETAIL); showDetails(dp[0], dp[1]); }
}
let refreshInFlight = false;
// ONE ACTION, ONE LOAD (owner 2026-07-28). A tick both navigates this page
// and wakes /events, so the outgoing page used to fetch itself again on its
// way out — the archive visibly loaded twice. Once we are leaving, we leave.
let navigatingAway = false;
// see dsp-mirror-render.md#the-reader-keeps-their-place
const EMBED_Q = new URLSearchParams(location.search).has("embed");
const PLACE = [
  ["detail", () => CURRENT_DETAIL],
  ["card", () => CARD_NOW],
  // Frozen is a place too: a snapshot window that follows a link inside
  // itself stays a snapshot. A live window reports null and never picks it
  // up, so the flag spreads nowhere it does not belong.
  ["frozen", () => (FROZEN ? "1" : null)],
  ["embed", () => (EMBED_Q ? "1" : null)],
];
/** Carry the place onto a URL the reader is NAVIGATING to. */
function withPlace(url) {
  const u = new URL(url, location.href);
  for (const p of PLACE) {
    const v = p[1]();
    if (v && !u.searchParams.has(p[0])) u.searchParams.set(p[0], v);
  }
  return u.pathname + u.search;
}
/** Pin the place onto the URL of the page the reader is ALREADY on. */
function pinPlace(q) {
  for (const p of PLACE) {
    const v = p[1]();
    if (v) q.set(p[0], v); else q.delete(p[0]);
  }
}
// see dsp-mirror-render.md#a-popped-out-card-is-a-snapshot
const FROZEN = new URLSearchParams(location.search).has("frozen");
function frozenUrl(url) {
  const u = new URL(withPlace(url), location.href);
  u.searchParams.set("frozen", "1");
  return u.pathname + u.search;
}
// A SOLO CARD STAYS A CARD. Going to "/" replaced one card with the WHOLE
// mirror inside it — which is what broke double-clicking into a sub-machine,
// and what left the bar waiting on a page that was never the right one.
// Only the mirror's own root is rewritten; a document link still goes where
// it says.
function keepCard(url) {
  const here = location.pathname;
  if (!here.startsWith("/widget/")) return url;
  if (url !== "/" && url.slice(0, 2) !== "/?") return url;
  const q = url.indexOf("?");
  return here + (q < 0 ? "" : url.slice(q));
}
function navigateTo(url, label) {
  navigatingAway = true;
  showLoading(label);
  url = withPlace(keepCard(url));
  hostTrace("navigateTo " + url);
  // This document is about to be replaced, so the host must stop posting
  // into it. A post that lands in a dying document is swallowed whole.
  if (window.parent !== window) window.parent.postMessage({ se: "nav" }, "*");
  location.href = url;
}
// The crumbs are plain anchors, so a solo card would follow one straight out
// to the whole mirror. Capture them and route them through the same rule.
document.addEventListener("click", (ev) => {
  if (!location.pathname.startsWith("/widget/")) return;
  const a = ev.target.closest ? ev.target.closest("a[href^='/?']") : null;
  hostTrace("anchor hit=" + (a === null ? "none" : String(a.getAttribute("href"))));
  if (a === null) return;
  ev.preventDefault();
  navigateTo(a.getAttribute("href"), "loading " + (a.textContent || "view"));
}, true);
async function refresh(detail) {
  if (FROZEN) return;
  if (navigatingAway) return;
  if (detail !== undefined) CURRENT_DETAIL = detail;
  const q = new URLSearchParams(location.search);
  // THE VIEW HOLDS STILL (owner ruling 2026-07-28): finishing a state is
  // data change, and data change never jumps the reader — every refresh
  // pins the machine being looked at explicitly.
  q.set("view", D.viewed.id);
  pinPlace(q);
  const qs = q.toString();
  const url = location.pathname + (qs ? "?" + qs : "");
  history.replaceState(null, "", url);
  if (refreshInFlight) return;
  refreshInFlight = true;
  try {
    const r = await fetch(url);
    const doc = new DOMParser().parseFromString(await r.text(), "text/html");
    // see dsp-mirror-render.md#the-stylesheet-morphs-too
    const freshCss = doc.querySelector("head style");
    const liveCss = document.querySelector("head style");
    if (freshCss && liveCss && liveCss.textContent !== freshCss.textContent) liveCss.textContent = freshCss.textContent;
    morph(document.body, doc.body);
    rebind();
  } catch (e) {
    location.href = url; // a failed morph must never strand the reader
  } finally {
    refreshInFlight = false;
    hideLoading(); // THE LOAD SETTLED — win or lose, the bar goes
  }
}
// VS CODE EMBED. The hosting webview says hello with a theme message: the
// palette follows the editor from then on, and record links open as real
// files THERE. Help stays a detail HERE — the ux rule. The flag survives
// in-page navigation; the host re-sends the theme on every iframe load.
let EMBED = false;
try { EMBED = sessionStorage.getItem("se-embed") === "1"; } catch { EMBED = false; }
window.addEventListener("message", (ev) => {
  const d = ev.data;
  if (!d) return;
  // HELP IS A DETAIL, NEVER A BUTTON (ux rule). A host with an icon strip
  // has no room to explain itself, so what an icon means arrives HERE, in
  // the details pane, the one place the reader already looks for meaning.
  // The host saw the walk move. Embedded, this replaces the event stream.
  if (d.se === "wake") {
    // No event stream in a frame — the wake stands in for it, so the same
    // alive-driven work (the pull landing above all) runs here too.
    void fetch("/api/alive").then((r) => r.json()).then((a) => applyAlive(a)).catch(() => {});
    refresh();
    return;
  }
  if (d.se === "help") { hostTrace("page got help"); LAST_RELAY = { title: d.title, html: d.html }; CURRENT_DETAIL = "relay"; showDetails(d.title, d.html); hostAck(); return; }
  // A LOG LINE CLICKED IN THE HOST'S TERMINAL. The record is rendered HERE,
  // by the same code the mirror uses, so a host never grows a second
  // renderer for what this page already knows how to draw.
  if (d.se === "logref") {
    hostTrace("page got logref " + d.ref + " on " + location.pathname);
    void openLogDetail(d.ref).then(() => { hostTrace("logref rendered " + d.ref); hostAck(); }, (e) => hostTrace("logref FAILED " + String((e && e.message) || e)));
    return;
  }
  if (d.se !== "theme") return;
  EMBED = true;
  try { sessionStorage.setItem("se-embed", "1"); } catch { /* storage denied — the flag just will not survive navigation */ }
  const vars = d.vars || {};
  for (const k in vars) if (vars[k]) document.documentElement.style.setProperty(k, vars[k]);
});
function cssPalette(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
function embedOpen(path) {
  if (!EMBED || !path) return false;
  window.parent.postMessage({ se: "open", path: path }, "*");
  return true;
}
// THE HOST HOLDS THE SUBJECT UNTIL THIS ARRIVES. Without it the relay had to
// infer from a load event whether this page was still there to receive.
function hostAck() {
  if (window.parent !== window) window.parent.postMessage({ se: "ack" }, "*");
}
document.addEventListener("click", async (ev) => {
  const c = ev.target.closest ? ev.target.closest(".docheck") : null;
  if (c) {
    // FEEDBACK FIRST. The old handler cancelled the click and waited on a
    // round trip, so the box sat unchecked for a second and then a full
    // refresh rebuilt the pane under the reader, who lost what they had open.
    if (c.hasAttribute("disabled")) return;
    const path = c.dataset.path;
    c.setAttribute("checked", "");
    c.setAttribute("disabled", "");
    if (!D.checkedDocs) D.checkedDocs = [];
    if (D.checkedDocs.indexOf(path) < 0) D.checkedDocs.push(path);
    // No refresh here. The poll sees the log grow and redraws in its own
    // time; forcing it now is what threw the reader out of the details pane.
    await fetch("/check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path: path }) });
    return;
  }
  const rp = ev.target.closest ? ev.target.closest(".runpre") : null;
  if (rp) {
    // Grey IMMEDIATELY — no second run behind an unresponsive button; the
    // server coalesces stray extra clicks into the one run anyway.
    rp.disabled = true; rp.classList.add("locked"); rp.textContent = "running…";
    await fetch("/script", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ state: rp.dataset.state || CURRENT }) });
    refresh();
    return;
  }
  const rpl = ev.target.closest ? ev.target.closest(".replink") : null;
  if (rpl) {
    if (embedOpen(rpl.dataset.path)) return;
    const expQ = rpl.dataset.exp ? "&exp=" + encodeURIComponent(rpl.dataset.exp) : "";
    const pageUrl = "/doc?path=" + encodeURIComponent(rpl.dataset.path) + expQ + "&page=1";
    if (ev.ctrlKey || ev.metaKey) { window.open(pageUrl, "_blank"); return; }
    if (ev.shiftKey) { window.open(pageUrl, "_blank", "popup,width=900,height=700"); return; }
    const r = await fetch("/doc?path=" + encodeURIComponent(rpl.dataset.path) + expQ);
    const d = await r.json();
    openModal(rpl.dataset.title || rpl.dataset.path, '<div class="docview">' + d.html + "</div>");
    return;
  }
  // A FILE LINK OPENS THE FILE, in the editor the host already has (owner
  // ruling 2026-08-06). The pane render is the FALLBACK, for the standalone
  // browser where there is no editor to open into.
  const dl = ev.target.closest ? ev.target.closest(".doclink") : null;
  if (dl) {
    if (embedOpen(dl.dataset.path)) return;
    openDoc(dl.dataset.path, dl.dataset.return || CURRENT_DETAIL || (CURRENT ? "state:" + CURRENT : "comment"));
    return;
  }
  const back = ev.target.closest ? ev.target.closest(".back") : null;
  if (back) { const [t, h] = detailFor(back.dataset.return); showDetails(t, h); return; }
});
function condRows(id, dict, standing) {
  return Object.entries(dict).map(([key, c]) => {
    let row = '<div style="padding:6px 0 2px"><a class="doclink" data-path="' + c.note + '">' + key + "</a> ";
    row += c.met ? '<span style="color:var(--se-ok)">✓ met</span>' : '<span style="color:var(--se-accent)">! unmet</span>';
    row += "</div>";
    if (key === "script") {
      if (c.args.length > 0) row += jsonTable(c.args);
      const s = D.states[id] ?? {};
      const sc = s.script || { ran: false, ok: false, output: "", running: false };
      // The button greys IMMEDIATELY on click and stays grey while running
      // and after success — it re-enables only on a FAILED run.
      let btn;
      if (sc.running) btn = '<button class="primary go locked" disabled>running…</button>';
      else if (!standing) btn = '<button class="primary go locked" disabled title="enter the state to run the script">run</button>';
      else if (sc.ran && sc.ok) btn = '<button class="primary go locked" disabled title="exit 0 — the condition is met">✓ ran</button>';
      else btn = '<button class="primary runpre" data-state="' + id + '">' + (sc.ran ? "re-run" : "run") + "</button>";
      row += '<div style="padding:6px 0">' + btn + "</div>";
      if (sc.running) row += '<div style="color:var(--se-accent)">running — the page follows; the result lands here</div>';
      else if (sc.ran) row += '<div style="color:' + (sc.ok ? "var(--se-ok)" : "var(--se-fail)") + ';white-space:pre-wrap;font-size:12px">' + sc.output.replace(/&/g,"&amp;").replace(/</g,"&lt;") + "</div>";
      else row += '<div style="color:var(--se-muted)">not run yet</div>';
    } else if (key === "evidence_form") {
      // The A3 page: open it in the details pane — fill, confirm prefills,
      // manage files, set done. One button per named template.
      row += c.args.map((n) => '<div style="padding:4px 0"><button class="ghost openform" data-form="' + n + '">open form: ' + n + "</button></div>").join("");
    } else if (key === "read") {
      // One checkbox per doc — the human's proof, once per version. (The
      // agent proves the same docs by sending hashes on its tick.)
      const s = D.states[id] ?? {};
      const pulled = s.pulled || [];
      row += c.args.map((p) => docRow(pulled.find((d) => d.path === p) || { path: p, checked: false })).join("");
    } else if (c.args.length > 0) {
      row += jsonTable(c.args);
    }
    return row;
  }).join("");
}
function condDetail(id) {
  const s = D.states[id] ?? {};
  const standing = standingAt(id);
  let html = "";
  if (s.exit) html += '<div class="meta" style="padding:4px 0">exit</div>' + condRows(id, s.exit, standing);
  if (s.entry) html += '<div class="meta" style="padding:4px 0">entry</div>' + condRows(id, s.entry, standing);
  // A form-bearing state's prose lives in its form — repeating the guidance
  // here would fork the one truth the details already render.
  if (!s.has_form) html += '<div class="comment-detail">' + (s.guidance || "").replace(/&/g,"&amp;").replace(/</g,"&lt;") + "</div>";
  return ["conditions · " + id, html];
}
// THE FORM SURFACE — an evidence form rendered to fill: required fields
// as textareas, each unconfirmed prefill with its OWN confirm button (the
// prefill law: one confirmation per prefill, never in bulk), the evidence
// folder one click away, done runs the same lint the agent's tick runs.
// A form renders into the MODAL by default; "details" pins it to the
// details surface instead — which is what a detached form window is.
function presentForm(name, into, title, html, machine) {
  // The machine rides INSIDE the detail key, so a popped-out window
  // re-resolves the same form wherever its own view happens to stand.
  // The pane title stays EMPTY — the sheet body carries the one heading.
  if (into === "details") { CURRENT_DETAIL = "form:" + name + (machine ? "@" + machine : ""); showDetails("", html); return; }
  openModal(title, html);
}
// see dsp-mirror-render.md#the-state-forms-sheet
function wikiText(text, paths) {
  const s = String(text || "");
  let out = "";
  let i = 0;
  while (i < s.length) {
    const open = s.indexOf("[[", i);
    const close = open < 0 ? -1 : s.indexOf("]]", open);
    if (open < 0 || close < 0) {
      out += escText(s.slice(i));
      break;
    }
    out += escText(s.slice(i, open));
    const id = s.slice(open + 2, close).trim();
    const p = paths[id];
    out += p
      ? '<a class="reflink" style="color:var(--se-accent);cursor:pointer;font-style:normal;" data-path="' + escText(p) + '" title="open ' + escText(p) + ' in the editor">' + escText(id) + "</a>"
      : escText(id);
    i = close + 2;
  }
  return out;
}

function sfOne(f, fl) {
  const name = f.form;
  const tpl = (f.field_templates || {})[fl.name] || "free-form";
  const tm = (f.template_meta || {})[tpl] || {};
  const args = (f.field_args || {})[fl.name] || { options: [], items: [], passing: [] };
  const hint = (f.field_hints || {})[fl.name] || {};
  let s = '<div style="border:1px solid var(--se-line,#888);border-radius:4px;padding:7px 10px;margin:7px 0">';
  // THE TYPE IS A DOOR, NOT A WORD. A field that accepts one kind of node
  // says which, and the rules for that kind are one click away — otherwise
  // the filler has to guess what a legal line even looks like.
  const ofChip = hint.of && hint.of_template
    ? ' · of: <a class="reflink" data-path="' + escText(hint.of_template) + '" title="open the ' + escText(hint.of) + ' template in the editor">' + escText(hint.of) + "</a>"
    : (hint.of ? " · of: " + escText(hint.of) : "");
  s += '<span style="float:right;font-size:11.5px;color:var(--se-accent)">template: ' + escText(tpl) + ofChip + "</span>";
  s += "<b>" + escText(fl.name) + "</b>" + (fl.required ? ' <span style="color:var(--se-fail);font-size:11px">required</span>' : ' <span class="meta">optional</span>');
  if (fl.guidance) s += '<div class="meta" style="font-style:italic">' + wikiText(fl.guidance, f.ref_paths || {}) + "</div>";
  // Free text carries its ask as the PLACEHOLDER; the structured editors
  // keep the description above, because their rows replace the empty box.
  // The FIELD's ask comes first, then the TEMPLATE's mechanics — written
  // once in the template and expanded for this field's type.
  if ((tm.editor || "text") !== "text") {
    s += '<div class="meta">' + wikiText(fl.description || "", f.ref_paths || {}) + "</div>";
    if (hint.description) s += '<div class="meta">' + wikiText(hint.description, f.ref_paths || {}) + "</div>";
  }
  (fl.prefills || []).forEach(function (p, i) {
    s += '<div class="prefill"><div class="comment-text">prefill — unconfirmed:</div><div>' + escText(p) + '</div><button class="primary confirmpre" data-form="' + name + '" data-machine="' + escText(f.machine || "") + '" data-field="' + escText(fl.name) + '" data-index="' + i + '">confirm</button></div>';
  });
  s += sfEditor(fl, tm, args, f.ref_paths || {}, hint, f.ref_facts || {}) + "</div>";
  return s;
}
// see dsp-mirror-render.md#the-editor-is-the-templates-shape
function sfDash(c) {
  return (c || "").split("\\n").map(function (l) { return l.trim(); }).filter(function (l) { return l.indexOf("- ") === 0; }).map(function (l) { return l.slice(2); });
}
function sfEditor(fl, tm, args, paths, hint, facts) {
  const name = escText(fl.name);
  const ph = escText((hint && hint.placeholder) || "");
${editorRenderBranches()}
  // FREE TEXT IS THE FALLBACK, and an editor that falls through on purpose
  // lands here — per-item with no items, for one.
  return '<textarea class="formfield" data-field="' + name + '" placeholder="' + escText(fl.description || "") + '">' + escText(fl.content || "") + "</textarea>";
}
function sfRowBtns() {
  return '<button type="button" class="sfrowadd" title="add a row below">+</button><button type="button" class="sfrowdel" title="remove this row">−</button>';
}
// A collapsible box — the same truth, folded for a narrow pane.
function sfBox(title, inner, open) {
  return '<details' + (open ? " open" : "") + ' style="margin:6px 0"><summary style="cursor:pointer;font-weight:600">' + title + "</summary>" + inner + "</details>";
}
function renderStateForm(f) {
  const name = f.form;
  const mach = f.machine || viewedMachine();
  const fld = function (n) {
    const hit = (f.fields || []).filter(function (q) { return q.name === n; })[0];
    return hit || { name: n, description: "", required: false, content: "", prefills: [] };
  };
  // A real heading; every header item its own line, at the body text size.
  let h = '<div style="font-size:17px;font-weight:700;padding:2px 0 6px">Evidence form <span style="font-weight:400;color:var(--se-muted)">/ ' + escText(name) + "</span></div>";
  h += '<table class="kv" style="font-size:12.5px">' + Object.keys(f.header || {}).map(function (k) { return "<tr><td>" + escText(k) + "</td><td>" + escText(String(f.header[k] || "____")) + "</td></tr>"; }).join("") + "</table>";
  h += sfBox("Description", '<div class="comment-text">' + escText(f.description || "") + "</div>", false);
  if (f.motivation) h += sfBox("Motivation", '<div class="comment-text">' + escText(f.motivation) + "</div>", false);
  h += sfBox("Current situation", sfOne(f, fld("current_situation")), false);
  h += sfBox("Inputs", (f.inputs || []).map(function (i) {
    const on = (f.checked || []).indexOf(i.label) >= 0;
    const label = i.path ? '<a class="doclink" data-path="' + escText(i.path) + '">' + escText(i.label) + "</a>" : "<b>" + escText(i.label) + "</b>";
    return '<div style="font-size:12.5px"><input type="checkbox" class="sfcheck" data-form="' + name + '" data-machine="' + escText(mach) + '" data-label="' + escText(i.label) + '"' + (on ? " checked" : "") + "> " + label + (i.entry ? ' <span style="color:var(--se-fail);font-size:11px">before entry</span>' : "") + ' <span class="meta">' + escText(i.description || "") + "</span></div>";
  }).join(""), false);
  const tail = ["current_situation", "follow_up", "anything_else"];
  h += sfBox("Evidence", (f.fields || []).filter(function (x) { return tail.indexOf(x.name) < 0; }).map(function (x) { return sfOne(f, x); }).join(""), false);
  // ANYTHING ELSE IS A FOLLOW-UP, not evidence (owner, 2026-08-05). It is
  // what the boxes above had no room for, so it belongs beside what happens
  // next — never among the claims the gate judges.
  h += sfBox(
    "Follow-up" + (f.follow_up_label ? " / " + escText(f.follow_up_label) : ""),
    sfOne(f, fld("follow_up")) + ((f.fields || []).some(function (q) { return q.name === "anything_else"; }) ? sfOne(f, fld("anything_else")) : ""),
    false,
  );
  // No verdicts here — the details are the DEFINITION; a submit's pass or
  // fail lands in the log, where its line carries the why.
  if (f.gate) {
    if ((f.bless || "").indexOf("blessed") === 0) h += '<div style="color:var(--se-ok);padding:4px 0">👍 ' + escText(f.bless) + "</div>";
    else if ((f.bless || "").indexOf("dismissed") === 0) h += '<div style="color:var(--se-fail);padding:4px 0">👎 ' + escText(f.bless) + "</div>";
    else if (f.met) h += '<div class="meta" style="padding:4px 0">submitted — awaiting the bless</div>';
  }
  h += '<div style="padding:10px 0"><button class="primary sfexport" data-form="' + name + '" data-machine="' + escText(mach) + '">export</button> ';
  h += '<button class="primary sfimport" data-form="' + name + '">import</button><input type="file" accept=".html,text/html" style="display:none" class="ingestform" data-form="' + name + '" data-machine="' + escText(mach) + '"> ';
  h += '<button class="primary saveform" data-form="' + name + '" data-machine="' + escText(mach) + '">save</button> ';
  // Questions are answered in ORDER: submit and the thumbs wake only
  // while the walk stands in the state. Save works from anywhere.
  const inactive = f.active ? "" : ' disabled title="available only while the state is active — save still works"';
  h += '<button class="primary doneform" data-form="' + name + '" data-machine="' + escText(mach) + '"' + (inactive || ' title="marks the claim complete — the gate judges it"') + ">submit</button>";
  if (f.gate) {
    const off = inactive || (f.signed ? "" : ' disabled title="available after submit"');
    h += ' <button class="primary blessform" data-form="' + name + '" data-machine="' + escText(mach) + '"' + (off || ' title="the gate opens — the human, or a hand above its rung"') + ">👍 bless</button>";
    h += ' <button class="primary dismissform" data-form="' + name + '" data-machine="' + escText(mach) + '"' + (off || ' title="send it back — the reasons go in the form"') + ">👎 dismiss</button>";
  }
  h += "</div>";
  return h;
}
async function seIngest(inp, name) {
  const file = inp.files && inp.files[0];
  if (!file) return;
  const html = await file.text();
  await formPost("/form/ingest", { name: name, html: html, machine: inp.dataset.machine || viewedMachine() });
  showFormAgain(name, inp.dataset.machine, inp);
}
// Delegated, like every other control — an inline handler needs quote
// nesting the fixer is free to normalise, and one stripped escape killed
// the whole page script at parse.
document.addEventListener("change", function (ev) {
  const inp = ev.target.closest ? ev.target.closest(".ingestform") : null;
  if (inp) { void seIngest(inp, inp.getAttribute("data-form")); return; }
  // A checked input saves QUIETLY — no re-render, so the reader's folds
  // and scroll hold still and the box already shows its new state.
  const cb = ev.target.closest ? ev.target.closest(".sfcheck") : null;
  if (cb) {
    const labels = [];
    document.querySelectorAll('.sfcheck[data-form="' + cb.dataset.form + '"]').forEach(function (x) { if (x.checked) labels.push(x.dataset.label); });
    void formPost("/form/save", { name: cb.dataset.form, fields: { inputs_checked: labels.join("\\n") }, machine: cb.dataset.machine || viewedMachine() });
  }
});
// ENTER ADDS THE NEXT ROW, right below the one being edited.
document.addEventListener("keydown", (ev) => {
  if (ev.key !== "Enter") return;
  const t = ev.target.closest ? ev.target.closest(".sfli, .sfff, .sffa") : null;
  if (!t) return;
  ev.preventDefault();
  const row = t.closest(".sfrow");
  if (!row) return;
  const clone = row.cloneNode(true);
  clone.querySelectorAll("input").forEach(function (i) { i.value = ""; });
  row.after(clone);
  const first = clone.querySelector("input");
  if (first) first.focus();
});
// The machine on display resolves a form name — without it, two records'
// same-named states would collide and the walk's machine would shadow the view.
function viewedMachine() { return (D.viewed && D.viewed.id) || ""; }
async function showForm(name, into, machine) {
  machine = machine || viewedMachine();
  const r = await fetch("/api/form?name=" + encodeURIComponent(name) + "&machine=" + encodeURIComponent(machine));
  const f = await r.json();
  // The body carries the one "Evidence form" heading — the pane title
  // stays the bare state name so nothing repeats.
  if (f.state_form) { presentForm(name, into, name, renderStateForm(f), machine); return; }
  if (f.kind === "rejected" || f.error) {
    // Plain words at the human — never raw rejection JSON.
    presentForm(name, into, "form · " + name,
      '<div class="comment-detail">' + escText(f.expected || f.error || "") + "</div>" +
      '<div class="meta">' + escText(f.got || "") + "</div>" +
      (f.remedy && f.remedy.note ? '<div class="comment-text">' + escText(f.remedy.note) + "</div>" : ""), machine);
    return;
  }
  const ro = f.preview === true;
  let html = '<div class="comment-text">' + escText(f.statement || "") + "</div>";
  // The GRAPH-IS-EVIDENCE gate, visible to the human: the page cannot
  // pass over open decision points — they surface under problems below.
  html += '<div class="meta">gate: every open decision point of this record must be resolved (done · obsolete · revert · defer) before this page passes</div>';
  html += '<div class="meta">' + escText(f.instance) + (ro ? " · template preview — filling happens inside an expedition" : " · status: " + escText(f.status) + (f.met ? ' · <span style="color:var(--se-ok)">✓ passes</span>' : "")) + "</div>";
  (f.fields || []).forEach((fl) => {
    html += '<div style="padding:8px 0 2px"><b>' + escText(fl.name) + "</b>" + (fl.required ? ' <span style="color:var(--se-accent)">required</span>' : "") + "</div>";
    html += '<div class="comment-text">' + escText(fl.description) + "</div>";
    if (ro) return;
    (fl.prefills || []).forEach((p, i) => {
      html += '<div class="prefill"><div class="comment-text">prefill — unconfirmed:</div><div>' + escText(p) + '</div><button class="primary confirmpre" data-form="' + name + '" data-field="' + escText(fl.name) + '" data-index="' + i + '">confirm</button></div>';
    });
    html += '<textarea class="formfield" data-field="' + escText(fl.name) + '">' + escText(fl.content) + "</textarea>";
  });
  if (!ro) {
    html += '<div class="meta" style="padding:6px 0 2px">files — <a class="doclink openfolder" data-form="' + name + '">open ' + escText(f.evidence_dir) + "</a></div>";
    (f.files || []).forEach((fi) => { html += "<div>" + (fi.present ? "✓ " : '<span style="color:var(--se-fail)">✗ </span>') + escText(fi.name) + "</div>"; });
    if (f.problems && f.problems.length) html += '<div style="color:var(--se-accent);padding:6px 0">' + f.problems.map(escText).join("<br>") + "</div>";
    html += '<div style="padding:10px 0"><button class="primary saveform" data-form="' + name + '">save</button> <button class="primary doneform" data-form="' + name + '" title="sets status done and runs the lint">done</button></div>';
  }
  presentForm(name, into, "form · " + name, html, machine);
}
// WHERE IT WAS IS WHERE IT RE-RENDERS. Guessing the surface from
// CURRENT_DETAIL opened a modal COPY on top of a form already on screen, and
// left the surface the reader was actually looking at showing the state
// BEFORE the click — so a bless that had landed looked like it had not.
// A detached form panel carries neither #modal nor #details of its own; it
// takes the details route and the host relays it into the panel.
function showFormAgain(name, machine, el) {
  const inModal = el && el.closest ? el.closest("#modal") : null;
  void showForm(name, inModal ? undefined : "details", machine);
}
// THE BLESS IS THE ONE MOMENT WORTH MARKING. A gate passing is the person's
// act and the whole point of the walk stopping there; a silent re-render made
// it read as nothing having happened.
function confetti() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const box = document.createElement("div");
  box.className = "confetti";
  const roles = ["--se-ok", "--se-accent", "--se-link", "--se-warn"];
  for (let i = 0; i < 70; i++) {
    const p = document.createElement("i");
    p.style.left = 8 + Math.random() * 84 + "vw";
    p.style.top = 6 + Math.random() * 28 + "vh";
    p.style.background = cssPalette(roles[i % roles.length]);
    p.style.setProperty("--dx", Math.random() * 220 - 110 + "px");
    p.style.animationDelay = Math.random() * 0.28 + "s";
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(function () { box.remove(); }, 2000);
}
async function formPost(path, body) {
  await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
}
// One collector for save and submit: every editor serialises back to its
// field's markdown lines — the same shapes the lint checks.
function sfCollect() {
  const fields = {};
  document.querySelectorAll(".formfield").forEach(function (t) { fields[t.dataset.field] = t.value; });
  // TWO ACCUMULATORS THE EDITORS SHARE. push appends one markdown line to a
  // field; acc is drained into fields at the end, so an editor that emits
  // lines never has to know how many other editors did too.
  // NO BACKTICKS ANYWHERE IN HERE. This whole block is one template literal.
  const acc = {};
  const push = function (n, line) { (acc[n] = acc[n] || []).push(line); };
${editorCollectBranches()}
  Object.keys(acc).forEach(function (n) { fields[n] = acc[n].join("\\n"); });
  return fields;
}
// THE EDITORS THAT NEED REAL INTERACTION WIRE THEMSELVES HERE, once, from
// their own files. An editor whose markup lives in one place and whose
// behaviour lives four hundred lines away is the defect engine/editors/ was
// made to fix, and the morph box would have reintroduced it.
${editorBehaviourBlocks()}
document.addEventListener("click", async (ev) => {
  const of = ev.target.closest ? ev.target.closest(".openform") : null;
  if (of) { void showForm(of.dataset.form); return; }
  const cp = ev.target.closest ? ev.target.closest(".confirmpre") : null;
  if (cp) { await formPost("/form/confirm", { name: cp.dataset.form, field: cp.dataset.field, index: Number(cp.dataset.index), machine: cp.dataset.machine || viewedMachine() }); showFormAgain(cp.dataset.form, cp.dataset.machine, cp); return; }
  const ex = ev.target.closest ? ev.target.closest(".sfexport") : null;
  if (ex) {
    const exUrl = location.origin + "/form/export?name=" + encodeURIComponent(ex.dataset.form) + "&machine=" + encodeURIComponent(ex.dataset.machine || viewedMachine());
    // Inside the editor a webview cannot download; the HOST opens the
    // system browser, whose save dialog names the place.
    if (window.parent !== window) { window.parent.postMessage({ se: "download", url: exUrl }, "*"); return; }
    const a = document.createElement("a");
    a.href = exUrl;
    a.download = "";
    a.click();
    return;
  }
  const im = ev.target.closest ? ev.target.closest(".sfimport") : null;
  if (im) {
    const inp = document.querySelector('.ingestform[data-form="' + im.dataset.form + '"]');
    if (inp) inp.click();
    return;
  }
  const bl = ev.target.closest ? ev.target.closest(".blessform, .dismissform") : null;
  if (bl) {
    const blessed = bl.classList.contains("blessform");
    await formPost("/form/bless", { name: bl.dataset.form, ok: blessed, machine: bl.dataset.machine || viewedMachine() });
    if (blessed) confetti();
    showFormAgain(bl.dataset.form, bl.dataset.machine, bl);
    return;
  }
  const ra = ev.target.closest ? ev.target.closest(".sfrowadd") : null;
  if (ra) {
    const row = ra.closest(".sfrow");
    const clone = row.cloneNode(true);
    clone.querySelectorAll("input").forEach(function (i) { i.value = ""; });
    // A CLONED CHOOSER CARRIES THE SELECTION WITH IT. Cleared here, or the
    // new row arrives pre-answered with whatever the row above said.
    clone.querySelectorAll("select").forEach(function (s) { s.selectedIndex = 0; });
    row.after(clone);
    const first = clone.querySelector("input");
    if (first) first.focus();
    return;
  }
  const rd = ev.target.closest ? ev.target.closest(".sfrowdel") : null;
  if (rd) {
    const row = rd.closest(".sfrow");
    // The last row stays — an empty list still needs its one editor.
    if (row && row.parentElement && row.parentElement.querySelectorAll(".sfrow").length > 1) row.remove();
    return;
  }
  const sv = ev.target.closest ? ev.target.closest(".saveform") : null;
  if (sv) {
    await formPost("/form/save", { name: sv.dataset.form, fields: sfCollect(), machine: sv.dataset.machine || viewedMachine() });
    showFormAgain(sv.dataset.form, sv.dataset.machine, sv);
    return;
  }
  const dn2 = ev.target.closest ? ev.target.closest(".doneform") : null;
  if (dn2) {
    await formPost("/form/save", { name: dn2.dataset.form, fields: sfCollect(), machine: dn2.dataset.machine || viewedMachine() });
    await formPost("/form/done", { name: dn2.dataset.form, machine: dn2.dataset.machine || viewedMachine() });
    showFormAgain(dn2.dataset.form, dn2.dataset.machine, dn2);
    return;
  }
  const ofo = ev.target.closest ? ev.target.closest(".openfolder") : null;
  if (ofo) { await formPost("/form/folder", { name: ofo.dataset.form }); return; }
  // see dsp-mirror-render.md#the-artifact-opens-in-the-editor
  const orf = ev.target.closest ? ev.target.closest(".reflink") : null;
  if (orf) {
    if (window.parent !== window) window.parent.postMessage({ se: "open", path: orf.dataset.path }, "*");
    return;
  }
});

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
    // ONE TRUTH, TWO RENDERS (owner ruling 2026-08-04): a state with an
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
// A GRID CELL OPENS ITS DETAIL (owner, 2026-08-09): the score grid shows
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
// NUMBER KEYS, NOT FUNCTION KEYS (owner 2026-07-29). F1, F5, F6, F11 and F12
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
// THE NUMBER IS A CONTROL, NOT A LABEL (owner 2026-07-29). Whatever the key
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
// 58/42 to start (owner 2026-07-29), then wherever the reader drags it,
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
  // NEWEST ON TOP (owner ruling): the feed reads downward into the past;
  // the scroll pins to the top while the reader is there.
  const stick = logPanel.scrollTop < 40;
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
  const top = logPanel.scrollTop;
  logPanel.innerHTML = html;
  // Sticking to the top is the reader's place TOO, when that is where they are.
  logPanel.scrollTop = stick ? 0 : top;
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
  showDetails("the autonomy scale", '<table class="kv">' + rows + '</table><div style="padding:8px 0 0"><a class="doclink" data-path="project/guidance/authoring/machines.md">the full scale — machines.md · Priority</a></div>');
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
    if (act.dataset.post === "/note") {
      const f = document.getElementById("note-body");
      if (f && f.value.trim() !== "") {
        const pr = document.querySelector('.param-choice[data-key="note_priority"]');
        void fetch("/note", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text: f.value, priority: pr === null ? "could" : pr.value }) }).then(() => { f.value = ""; refreshLog(); });
      }
      return;
    }
    // A JSON-answering control reports its refusal IN PLACE — the target
    // button used to swallow it (owner report 2026-08-09). A redirecting
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

// see dsp-mirror-render.md#session-over
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
  if (thr && document.activeElement !== thr && Number(thr.value) !== a.autonomy) {
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
  // THE PERSON PULLED (owner design 2026-08-04): the answer lands in the
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
