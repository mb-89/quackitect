// A FILLABLE TABLE OVER THE REGISTER. The rows are nodes and the columns are
// their frontmatter, so the node itself is a LINK and never a copy: whatever
// the reader needs to judge a row is one click away, in the note.
//
// THERE IS NO SECOND COPY. Typing in a cell writes that key on that node, and
// editing the note shows in the form. That is the whole reason this editor
// exists rather than a plain table.
import type { EditorKind } from "./kinds.ts";

export const NODE_TABLE_EDITOR: EditorKind = {
  id: "node-table",
  render: `
    const cols = args.columns || [];
    const cells = {};
    (fl.content || "").split("\\n").forEach(function (l) {
      const t = String(l).trim();
      if (t.indexOf("|") !== 0) return;
      const cs = t.replace(/^\\|/, "").replace(/\\|$/, "").split("|").map(function (c) { return c.trim(); });
      const id = (cs[0] || "").replace(/^\\[\\[/, "").replace(/\\]\\]$/, "").trim();
      if (id) cells[id] = cs.slice(1);
    });
    // A REAL TABLE, with the layout on the ELEMENTS (ux.md). A table aligns
    // its columns because it is a table. The first build used rows and
    // classes, which align only while their stylesheet reaches the fragment.
    // It did not, so three headings ran together over three columns.
    //
    // Every colour is a theme variable. A literal colour shows the default
    // control through, and that reads as a white box in a dark panel.
    const cel = "padding:5px 8px;border-top:1px solid var(--se-border);vertical-align:middle;";
    const hed = "padding:5px 8px;text-align:left;font-weight:normal;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--se-muted);";
    const box = "width:100%;box-sizing:border-box;background:transparent;border:0;outline:none;font:inherit;font-size:12.5px;color:var(--se-fg);padding:0;";
    const head = "<thead><tr>" + [args.of || "node"].concat(cols).map(function (c) { return '<th style="' + hed + '">' + escText(c) + "</th>"; }).join("") + "</tr></thead>";
    // A CONSTRAINED COLUMN OFFERS ITS SOURCE, and HOW it offers it is the
    // field's own declaration (owner ruling 2026-08-08).
    //
    // CLOSED IS THE DEFAULT, because a known set means the cell holds a member
    // of it. pick_free names the exceptions, and the comparison cards are why
    // the exception exists: their cells hold an id PLUS something else — an
    // operator, or the reason two rows measure one thing — and a closed
    // chooser would forbid both.
    //
    // NO BACKTICK MAY APPEAR BELOW, not even inside a comment. This whole body
    // is one template literal, and a backtick ENDS it — everything after would
    // become real TypeScript. It happened here on 2026-08-08.
    const picks = args.picks || {};
    const free = args.pick_free || [];
    const sources = args.pick_sources || {};
    const isFree = function (c) { return free.indexOf(c) >= 0; };
    const listId = function (c) { return "sfl-" + name + "-" + c; };
    const waitingFor = function (c) {
      return (sources[c] || []).map(function (s) { return String(s).replace(/^\\$/, "").replace(/_/g, " "); }).join(" or ");
    };
    const datalists = Object.keys(picks).filter(isFree).map(function (c) {
      return '<datalist id="' + escText(listId(c)) + '">' + (picks[c] || []).map(function (o) { return '<option value="' + escText(o) + '">'; }).join("") + "</datalist>";
    }).join("");
    // A CLOSED CHOOSER KEEPS WHAT IS ALREADY WRITTEN, even where the offer no
    // longer holds it — a renamed source would otherwise blank the cell on the
    // next render, and nothing would report the loss.
    const chooser = function (c, id, v, dim) {
      const offer = picks[c] || [];
      const hint = offer.length === 0 ? '<option value="" disabled>— no ' + escText(waitingFor(c)) + " yet —</option>" : '<option value=""></option>';
      const opts = offer.map(function (o) { return '<option value="' + escText(o) + '"' + (o === v ? " selected" : "") + ">" + escText(o) + "</option>"; }).join("");
      const stray = v !== "" && offer.indexOf(v) < 0 ? '<option value="' + escText(v) + '" selected>' + escText(v) + " — no longer offered</option>" : "";
      return '<select class="sfnt sfpick" style="' + box + dim + 'cursor:pointer;" data-field="' + name + '" data-item="' + escText(id) + '" data-col="' + escText(c) + '">' + hint + opts + stray + "</select>";
    };
    const rowHtml = function (id) {
      const p = paths ? paths[id] : null;
      const nameCell = p
        ? '<a class="reflink" style="color:var(--se-accent);cursor:pointer;" data-path="' + escText(p) + '" title="open ' + escText(p) + ' in the editor">' + escText(id) + "</a>"
        : escText(id);
      const row = cells[id] || [];
      const cellsHtml = cols.map(function (c, i) {
        // NO INVENTED PLACEHOLDER. What belongs in the cell is written in the
        // node's own frontmatter, as a comment, and arrives here as the value.
        // A second prompt in the input would say it twice and could disagree.
        const v = row[i] || "";
        // NO REGEX. The escaping between here and the served page has eaten a
        // character class once already, silently, leaving a test that matched
        // nothing. Two string compares cannot be eaten.
        const todo = v === "" || (v.indexOf("<!--") === 0 && v.slice(-3) === "-->");
        const dim = todo ? "color:var(--se-muted);font-style:italic;" : "";
        if (picks[c] && !isFree(c)) return '<td style="' + cel + '">' + chooser(c, id, v, dim) + "</td>";
        const listed = picks[c] ? ' list="' + escText(listId(c)) + '"' : "";
        return '<td style="' + cel + '"><input class="sfnt" style="' + box + dim + '"' + listed + ' data-field="' + name + '" data-item="' + escText(id) + '" data-col="' + escText(c) + '" value="' + escText(v) + '"></td>';
      }).join("");
      return '<tr class="sfntrow" data-idx="' + rowAt[id] + '"><td style="' + cel + 'font-size:12.5px;white-space:nowrap;">' + nameCell + "</td>" + cellsHtml + "</tr>";
    };
    const table = (list) => '<table class="sfnodetable" style="width:100%;border-collapse:collapse;table-layout:fixed;">' + head + "<tbody>" + list.map(rowHtml).join("") + "</tbody></table>";
    const ids = args.items || [];
    const rowAt = {};
    ids.forEach(function (id, i) { rowAt[id] = i; });
    const per = args.page_size || 0;
    if (per <= 0 || ids.length <= per) return datalists + table(ids);
    // ONE PAGE AT A TIME, with previous and next (owner ruling 2026-08-08).
    //
    // WHAT THIS REPLACED. Stacked details groups, ten rows each, every group
    // on the page at once. That is the whole list with folds in it, not
    // pagination, and over ninety criteria it was unreadable. The owner named
    // the shape they meant: click left and right through pages, and choose how
    // big a page is.
    //
    // EVERY ROW STAYS IN THE DOM, on the page or not, so whatever collects
    // them on save is untouched. A pager that removed rows would silently drop
    // the answers on every page but the one showing.
    const sizes = [10, 25, 50, 0];
    const opts = sizes.map(function (s) {
      return '<option value="' + s + '"' + (s === per ? " selected" : "") + ">" + (s === 0 ? "all" : s + " a page") + "</option>";
    }).join("");
    const btn = "background:none;border:1px solid var(--se-border);color:var(--se-muted);border-radius:3px;cursor:pointer;font:inherit;font-size:11px;line-height:18px;padding:0 8px;";
    const bar = '<div class="sfntpager" data-field="' + name + '" data-per="' + per + '" data-total="' + ids.length + '" data-page="0" style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:11px;color:var(--se-muted);">' +
      '<button type="button" class="sfntprev" style="' + btn + '" title="previous page">‹</button>' +
      '<span class="sfntwhere"></span>' +
      '<button type="button" class="sfntnext" style="' + btn + '" title="next page">›</button>' +
      '<select class="sfntper" style="' + btn + 'padding:0 4px;">' + opts + "</select></div>";
    return datalists + bar + table(ids);
  `,
  collect: `
  // A NODE TABLE SERIALISES WHOLE ROWS, blanks included. An empty cell is
  // what makes the submit refuse by name, so dropping it would hide the very
  // thing the field exists to catch.
  const nt = {};
  document.querySelectorAll(".sfnt").forEach((t) => {
    const f = t.dataset.field;
    nt[f] = nt[f] || { cols: [], rows: {} };
    if (nt[f].cols.indexOf(t.dataset.col) < 0) nt[f].cols.push(t.dataset.col);
    (nt[f].rows[t.dataset.item] = nt[f].rows[t.dataset.item] || []).push(t.value.trim().replace(/\\|/g, "\\\\|"));
  });
  // THE PAGER HIDES ROWS; IT NEVER REMOVES THEM, so every field the register
  // holds is serialised whether or not its page is showing.
  Object.keys(nt).forEach((f) => {
    const cols = nt[f].cols;
    const lines = ["| node | " + cols.join(" | ") + " |", "| " + ["---"].concat(cols.map(() => "---")).join(" | ") + " |"];
    Object.keys(nt[f].rows).forEach((id) => { lines.push("| [[" + id + "]] | " + nt[f].rows[id].join(" | ") + " |"); });
    fields[f] = lines.join("\\n");
  });
  `,
  behaviour: `
  // THE PAGER — previous, next, and how big a page is (owner ruling
  // 2026-08-08). It shows one page and HIDES the rest. Hides, never removes:
  // the save reads every row in the DOM, so a pager that pruned them would
  // silently drop the answers on every page but the one showing.
  //
  // WHAT THIS REPLACED. Stacked details groups, all on the page at once. That
  // is the whole list with folds in it, and over ninety rows it was unusable.
  //
  // NO BACKTICK BELOW, not even in a comment. This body is one template
  // literal and a backtick ends it.
  const sfntPage = {};
  function sfntApply() {
    document.querySelectorAll(".sfntpager").forEach(function (bar) {
      const f = bar.dataset.field;
      const total = Number(bar.dataset.total || 0);
      const per = Number(bar.dataset.per || 0);
      const pages = per > 0 ? Math.max(1, Math.ceil(total / per)) : 1;
      const page = Math.min(Math.max(0, sfntPage[f] || 0), pages - 1);
      sfntPage[f] = page;
      const from = per > 0 ? page * per : 0;
      const to = per > 0 ? Math.min(total, from + per) : total;
      const where = bar.querySelector(".sfntwhere");
      if (where) where.textContent = total === 0 ? "nothing here" : from + 1 + "\\u2013" + to + " of " + total;
      const prev = bar.querySelector(".sfntprev");
      const next = bar.querySelector(".sfntnext");
      if (prev) prev.disabled = page === 0;
      if (next) next.disabled = page >= pages - 1;
      // The rows belong to the table right after the bar, so a form holding
      // two paged fields never pages both at once.
      const tbl = bar.nextElementSibling;
      if (!tbl) return;
      tbl.querySelectorAll("tr.sfntrow").forEach(function (tr) {
        const i = Number(tr.dataset.idx || 0);
        tr.style.display = per <= 0 || (i >= from && i < to) ? "" : "none";
      });
    });
  }
  document.addEventListener("click", function (ev) {
    const b = ev.target.closest ? ev.target.closest(".sfntprev, .sfntnext") : null;
    if (!b) return;
    const bar = b.closest(".sfntpager");
    const f = bar.dataset.field;
    sfntPage[f] = (sfntPage[f] || 0) + (b.className.indexOf("sfntnext") >= 0 ? 1 : -1);
    sfntApply();
  });
  document.addEventListener("change", function (ev) {
    const s = ev.target.closest ? ev.target.closest(".sfntper") : null;
    if (!s) return;
    const bar = s.closest(".sfntpager");
    bar.dataset.per = s.value;
    // A BIGGER PAGE KEEPS THE ROW YOU WERE LOOKING AT. Jumping to page one
    // every time the size changes loses your place in ninety rows.
    const f = bar.dataset.field;
    const wasAt = (sfntPage[f] || 0) * Number(s.dataset.was || s.value || 1);
    sfntPage[f] = Number(s.value) > 0 ? Math.floor(wasAt / Number(s.value)) : 0;
    s.dataset.was = s.value;
    sfntApply();
  });
  // The form is redrawn whole on every look, so the page has to be reapplied
  // rather than bound once to elements that will not survive.
  setInterval(function () { if (document.querySelector(".sfntpager")) sfntApply(); }, 400);
  `,
};
