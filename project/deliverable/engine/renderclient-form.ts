// THE FORMS — conditions, the state form, its editors, the ingest of a
// returned sheet, and the collect that reads every field back out.
//
// see dsp-mirror-render.md#the-client-script-is-served-in-parts
import { editorBehaviourBlocks, editorCollectBranches, editorRenderBranches } from "./editors/index.ts";

export const FORM = `
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

`;
