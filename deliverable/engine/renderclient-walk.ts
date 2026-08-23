// THE WALK'S OWN SURFACES — the human tool modal, the state detail, the
// morph that swaps the page without reloading it, and the refresh that drives
// both.
//
// see dsp-mirror-render.md#the-client-script-is-served-in-parts

export const WALK = `
// THE PARITY LAW — a state's human-callable tools as links; the modal
// takes the arguments and shows the result in place.
const HUMAN_TOOLS = {
  se_seed_expedition: [{ name: "kind", hint: "spike | fix | explore" }, { name: "goal", hint: "what this expedition is after", long: true }, { name: "depends_on", hint: "ids this waits for, comma-separated — leave EMPTY to state that it waits for nothing", always: true }],
  se_seed_iteration: [{ name: "goal", hint: "what this iteration is after", long: true }, { name: "vision", hint: "roughly how — what done looks like", long: true }, { name: "inputs", hint: "context refs, comma-separated: an expedition id, note refs" }, { name: "depends_on", hint: "ids this waits for, comma-separated — leave EMPTY to state that it waits for nothing; the container orders the work from this", always: true }],
  se_reload: [],
  // see dsp-mirror-render.md#a-lane-tool-is-offered-per-state-never-as-chrome
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
        + '<tr><td class="k">report</td><td class="v"><a class="replink" data-exp="' + escText(e.id) + '" data-path="spec/expeditions/' + escText(e.id) + '/report.md" data-title="report · ' + escText(e.id) + '" title="click: modal · ctrl-click: new tab · shift-click: new window">report.md</a></td></tr>'
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
  if (from.tagName === "INPUT" && !sePlaceIsEdited(from) && to.hasAttribute("value")) from.value = to.getAttribute("value");
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
`;
