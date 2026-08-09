// THE RANKED LIST WITH A CUTOFF. One row is the last that still counts;
// anything can be struck with a reason; anything can be moved, and a move owes
// a rationale.
//
// IT REPLACED FOUR COLUMNS (owner ruling 2026-08-08). cut-criteria asked
// cut_proposed, cut_verdict, cut_reason and criterion_band of every row — over
// ninety rows that is the same question asked ninety times, and the answers
// were free to disagree with each other.
//
// THE ORDER IS COMPUTED, NOT STORED (owner ruling 2026-08-09). It arrives in
// args.items already sorted worst-breakage first, and that sort is the answer
// rather than a starting point.
//
// A STORED POSITION USED TO WIN, AND THAT WAS THE DEFECT. Once a numbered list
// was saved, its numbers beat the computed order forever, so a corrected sort
// could never reach the page. Measured in iteration one: a corrosive row sat
// first of seventy-two, above every fatal one, because an earlier pass had
// written it there.
//
// THREE MARKS, AND THEY MEAN DIFFERENT THINGS:
//
//   - THE CUTOFF. Exactly one row carries it: the last row that is still a
//     criterion. Everything below is out, by position alone, and needs no
//     reason of its own — the reason is the cutoff.
//   - A CUT. One row struck on its own merits, with a reason. It STAYS on
//     display, struck through, because an option that vanishes gets
//     re-proposed by somebody who never knew it was considered.
//   - A MOVE. Up or down, one place at a time. A moved row is marked and owes
//     a rationale, because moving a row past another jumps an ordering that
//     was made blind, and that is the one edit that can be aimed at a
//     favourite.
//
// NO BACKTICK IN EITHER BODY, not even in a comment. Each is one template
// literal and a backtick ends it.
import type { EditorKind } from "./kinds.ts";

export const RANK_CUT_EDITOR: EditorKind = {
  id: "rank-cut",
  render: `
    const ids = args.items || [];
    if (ids.length === 0) {
      return '<div class="sfempty" style="color:var(--se-muted);font-style:italic;padding:6px 0;">Nothing to rank yet. derive-criteria settles the order, and this is where the line is drawn across it.</div>';
    }
    // The stored form is one line per row, so a person reading the file sees
    // the same order the editor shows.
    const stored = {};
    (fl.content || "").split("\\n").forEach(function (l) {
      const m = /^(\\d+)\\.\\s+\\[\\[([^\\]]+)\\]\\](.*)$/.exec(l.trim());
      if (!m) return;
      const rest = m[3] || "";
      stored[m[2].trim()] = {
        at: Number(m[1]),
        cutoff: rest.indexOf("[cutoff]") >= 0,
        cut: (/\\[cut:\\s*([^\\]]*)\\]/.exec(rest) || [])[1] || "",
        moved: (/\\[moved:\\s*([^\\]]*)\\]/.exec(rest) || [])[1] || "",
      };
    });
    // THE COMPUTED ORDER IS THE BASE, and only a recorded MOVE overrides it.
    // A move already carries its rationale, so honouring it is honouring a
    // decision somebody signed; honouring a bare stored number is honouring an
    // accident of when the file was last written.
    const wasMoved = function (id) { return stored[id] && stored[id].moved !== ""; };
    const rows = ids.filter(function (id) { return !wasMoved(id); });
    ids.filter(wasMoved)
      .sort(function (a, b) { return stored[a].at - stored[b].at; })
      .forEach(function (id) {
        const at = Math.max(0, Math.min(rows.length, stored[id].at - 1));
        rows.splice(at, 0, id);
      });
    const cel = "padding:5px 8px;border-top:1px solid var(--se-border);vertical-align:middle;font-size:12.5px;";
    const hed = "padding:5px 8px;text-align:left;font-weight:normal;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--se-muted);";
    const box = "width:100%;box-sizing:border-box;background:transparent;border:0;outline:none;font:inherit;font-size:12.5px;color:var(--se-fg);padding:0;";
    const btn = "background:none;border:1px solid var(--se-border);color:var(--se-muted);border-radius:3px;cursor:pointer;font:inherit;font-size:11px;line-height:16px;padding:0 5px;";
    const rowHtml = function (id) {
      const s = stored[id] || { cutoff: false, cut: "", moved: "" };
      const p = paths ? paths[id] : null;
      const label = p
        ? '<a class="reflink" style="color:var(--se-accent);cursor:pointer;" data-path="' + escText(p) + '" title="open ' + escText(p) + ' in the editor">' + escText(id) + "</a>"
        : escText(id);
      // THE ARROWS ARE THE ORDINARY ONES. Up and down, one place per click, the
      // control everybody already knows.
      const arrows = '<button type="button" class="sfrcup" style="' + btn + '" title="move up one place">\\u2191</button>' +
        '<button type="button" class="sfrcdown" style="' + btn + '" title="move down one place">\\u2193</button>';
      const mark = '<button type="button" class="sfrccutoff" style="' + btn + (s.cutoff ? "color:var(--se-accent);border-color:var(--se-accent);" : "") + '" title="the last row that is still a criterion">cutoff</button>';
      return '<tr class="sfrcrow" data-id="' + escText(id) + '" data-cutoff="' + (s.cutoff ? "1" : "") + '">' +
        '<td style="' + cel + 'white-space:nowrap;color:var(--se-muted);" class="sfrcpos"></td>' +
        '<td style="' + cel + '">' + label + '<span class="sfrcout" style="font-size:11px;color:var(--se-muted);"></span></td>' +
        '<td style="' + cel + 'white-space:nowrap;">' + arrows + mark + "</td>" +
        '<td style="' + cel + '"><input class="sfrccut" style="' + box + '" value="' + escText(s.cut) + '" placeholder="strike it \\u2014 say why"></td>' +
        '<td style="' + cel + '"><input class="sfrcmoved" style="' + box + '" value="' + escText(s.moved) + '" placeholder="why it moved"></td>' +
        "</tr>";
    };
    const head = "<thead><tr>" +
      '<th style="' + hed + '">#</th>' +
      '<th style="' + hed + '">criterion</th>' +
      '<th style="' + hed + '"></th>' +
      '<th style="' + hed + '">cut, with the reason</th>' +
      '<th style="' + hed + '">why it moved</th>' +
      "</tr></thead>";
    // WHAT IT LOOKED LIKE AT THE LAST SAVE, carried on the table so revert has
    // somewhere to go back to (owner report 2026-08-08: a move could not be
    // undone). It is the SAVED state, not the previous DOM — revert means back
    // to the last save, not back one step.
    const pristine = rows.map(function (id, i) {
      const s = stored[id] || { cutoff: false, cut: "", moved: "" };
      return [String(i + 1), id, s.cutoff ? "1" : "", s.cut, s.moved].join("");
    }).join("");
    // CLICKING IS TOO CHEAP TO BE A COMMIT. An arrow is one press and it
    // reorders the ranking, so the changes are held until they are kept.
    const bar = '<div class="sfrcbar" style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:11px;color:var(--se-muted);">' +
      '<button type="button" class="sfrcsave sfact save" title="write these changes to the form">save</button>' +
      '<button type="button" class="sfrcrevert sfact revert" title="throw the changes away and go back to the last save">revert</button>' +
      '<span class="sfrcdirty"></span></div>';
    const count = '<div class="sfrccount" style="font-size:11px;color:var(--se-muted);padding:4px 0;"></div>';
    return bar + '<table class="sfnodetable sfrc" data-field="' + escText(name) + '" data-pristine="' + escText(pristine) + '" style="width:100%;border-collapse:collapse;">' + head + "<tbody>" + rows.map(rowHtml).join("") + "</tbody></table>" + count;
  `,
  collect: `
  // ONE LINE PER ROW, numbered, so the file reads as the ranking it is.
  document.querySelectorAll("table.sfrc").forEach(function (tbl) {
    const lines = [];
    tbl.querySelectorAll("tr.sfrcrow").forEach(function (tr, i) {
      const cut = tr.querySelector(".sfrccut");
      const moved = tr.querySelector(".sfrcmoved");
      const marks = [];
      if (tr.dataset.cutoff === "1") marks.push("[cutoff]");
      if (cut && cut.value.trim() !== "") marks.push("[cut: " + cut.value.trim() + "]");
      // A MOVE WITH NO REASON STILL LANDS IN THE FILE, as a bare [moved]. It
      // has to: the checker cannot refuse what the save never wrote, and
      // dropping it would let a move slip through by leaving the box empty.
      if (moved && moved.value.trim() !== "") marks.push("[moved: " + moved.value.trim() + "]");
      else if (tr.dataset.moved === "1") marks.push("[moved]");
      lines.push(i + 1 + ". [[" + tr.dataset.id + "]]" + (marks.length > 0 ? " " + marks.join(" ") : ""));
    });
    fields[tbl.dataset.field] = lines.join("\\n");
  });
  `,
  behaviour: `
  // ONLY ONE ROW IS THE CUTOFF. Pressing it on another row moves it rather
  // than adding a second, because two cutoffs is not a thing a ranking can
  // have.
  function sfrcPaint() {
    document.querySelectorAll("table.sfrc").forEach(function (tbl) {
      const rows = [].slice.call(tbl.querySelectorAll("tr.sfrcrow"));
      let past = false;
      let kept = 0;
      let struck = 0;
      let rank = 0;
      rows.forEach(function (tr) {
        const cutBox = tr.querySelector(".sfrccut");
        const isCut = cutBox && cutBox.value.trim() !== "";
        const pos = tr.querySelector(".sfrcpos");
        // A STRUCK ROW TAKES NO RANK (owner, 2026-08-09): the numbers count
        // what is KEPT, so the cutoff's number reads as what it keeps. The
        // stored lines keep their positional numbering — this is the read.
        if (pos) pos.textContent = isCut ? "\\u2014" : String(++rank);
        const out = tr.querySelector(".sfrcout");
        // BELOW THE LINE AND STRUCK ARE DIFFERENT REASONS TO BE OUT, and the
        // row says which. Below the line needs no reason of its own.
        const why = isCut ? " struck" : past ? " below the cutoff" : "";
        if (out) out.textContent = why;
        tr.style.opacity = why === "" ? "" : "0.55";
        const link = tr.querySelector(".reflink");
        if (link) link.style.textDecoration = isCut ? "line-through" : "";
        if (isCut) struck++;
        else if (!past) kept++;
        const btn = tr.querySelector(".sfrccutoff");
        if (btn) {
          const on = tr.dataset.cutoff === "1";
          btn.style.color = on ? "var(--se-accent)" : "var(--se-muted)";
          btn.style.borderColor = on ? "var(--se-accent)" : "var(--se-border)";
        }
        if (tr.dataset.cutoff === "1") past = true;
        // A MOVED ROW OWES A RATIONALE. The box says so until it has one, and
        // the form's own check refuses the submit while it is empty.
        const movedBox = tr.querySelector(".sfrcmoved");
        if (movedBox) {
          const owes = tr.dataset.moved === "1" && movedBox.value.trim() === "";
          movedBox.style.borderBottom = owes ? "1px solid var(--se-fail)" : "";
          movedBox.placeholder = owes ? "this row was moved \\u2014 say why" : "why it moved";
        }
      });
      const count = tbl.nextElementSibling;
      if (count && count.className === "sfrccount") {
        const marked = rows.some(function (tr) { return tr.dataset.cutoff === "1"; });
        count.textContent = marked
          ? kept + " of " + rows.length + " kept, " + struck + " struck"
          : "no cutoff set \\u2014 press cutoff on the last row that is still a criterion";
      }
      // UNSAVED CHANGES SAY SO. Comparing against the saved snapshot is the
      // only honest way to know: a person who moved a row and moved it back
      // has changed nothing, and should not be told they have.
      const bar = tbl.previousElementSibling;
      const now = rows.map(function (tr, i) {
        const c = tr.querySelector(".sfrccut");
        const m = tr.querySelector(".sfrcmoved");
        return [String(i + 1), tr.dataset.id, tr.dataset.cutoff === "1" ? "1" : "", c ? c.value : "", m ? m.value : ""].join("\\u0001");
      }).join("\\u0002");
      if (bar && bar.className === "sfrcbar") {
        const flag = bar.querySelector(".sfrcdirty");
        const dirty = now !== (tbl.dataset.pristine || "");
        if (flag) flag.textContent = dirty ? "unsaved changes" : "";
        if (flag) flag.style.color = dirty ? "var(--se-accent)" : "";
      }
    });
  }
  document.addEventListener("click", function (ev) {
    const t = ev.target.closest ? ev.target.closest(".sfrcup, .sfrcdown, .sfrccutoff") : null;
    if (!t) return;
    const tr = t.closest("tr.sfrcrow");
    const body = tr.parentElement;
    if (t.className.indexOf("sfrccutoff") >= 0) {
      const was = tr.dataset.cutoff === "1";
      body.querySelectorAll("tr.sfrcrow").forEach(function (r) { r.dataset.cutoff = ""; });
      tr.dataset.cutoff = was ? "" : "1";
      sfrcPaint();
      return;
    }
    const up = t.className.indexOf("sfrcup") >= 0;
    const other = up ? tr.previousElementSibling : tr.nextElementSibling;
    if (!other) return;
    if (up) body.insertBefore(tr, other);
    else body.insertBefore(other, tr);
    // BOTH ROWS MOVED, so both owe a rationale. Only marking the dragged one
    // would leave the row it jumped looking untouched.
    tr.dataset.moved = "1";
    other.dataset.moved = "1";
    sfrcPaint();
    const box = tr.querySelector(".sfrcmoved");
    if (box) box.focus();
  });
  // REVERT PUTS THE TABLE BACK TO THE LAST SAVE. Reordering rows is the one
  // edit a person cannot undo by hand — the arrows move one place at a time
  // and nothing remembers where a row started (owner report 2026-08-08).
  document.addEventListener("click", function (ev) {
    const r = ev.target.closest ? ev.target.closest(".sfrcrevert") : null;
    if (!r) return;
    const tbl = r.closest(".sfrcbar").nextElementSibling;
    if (!tbl) return;
    const body = tbl.querySelector("tbody");
    const byId = {};
    body.querySelectorAll("tr.sfrcrow").forEach(function (tr) { byId[tr.dataset.id] = tr; });
    (tbl.dataset.pristine || "").split("").filter(Boolean).forEach(function (line) {
      const p = line.split("");
      const tr = byId[p[1]];
      if (!tr) return;
      // Appending in the saved order restores the ranking; the rows are the
      // same elements, so nothing is recreated and nothing is lost.
      body.appendChild(tr);
      tr.dataset.cutoff = p[2] === "1" ? "1" : "";
      tr.dataset.moved = "";
      const cut = tr.querySelector(".sfrccut");
      const moved = tr.querySelector(".sfrcmoved");
      if (cut) cut.value = p[3] || "";
      if (moved) moved.value = p[4] || "";
    });
    sfrcPaint();
  });
  // SAVE IS THE FORM'S OWN SAVE, pressed from here. A second save that wrote
  // by another path would be a second way for the form to land, and the two
  // would drift.
  document.addEventListener("click", function (ev) {
    const s = ev.target.closest ? ev.target.closest(".sfrcsave") : null;
    if (!s) return;
    const real = document.querySelector(".saveform");
    if (real) real.click();
  });
  document.addEventListener("input", function (ev) {
    if (ev.target.closest && ev.target.closest(".sfrccut, .sfrcmoved")) sfrcPaint();
  });
  setInterval(function () { if (document.querySelector("table.sfrc")) sfrcPaint(); }, 500);
  `,
};
