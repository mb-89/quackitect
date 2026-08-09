// THE MORPHOLOGICAL BOX. Rows are function clusters, cells are the options
// serving them, and a curve across the box is one candidate architecture.
//
// THE GRID IS DERIVED AND UNEDITABLE HERE. It comes from the option nodes the
// seven finders minted, so there is nothing to type into a cell — an option is
// changed in its own note. What a person DOES here is draw lines.
//
// THE LINES JOIN DOTS, NOT CELLS (owner design 2026-08-08, and it replaced a
// first cut that ran the curve through cell centres). One cell can belong to
// several candidates, so a cell cannot carry a colour. Instead every cell holds
// a fixed row of dot SLOTS — one per candidate — and a candidate's dot always
// sits in its own slot, wherever it goes. The curve joins those dots.
//
// Two things fall out of that, and both are the reason for it:
//   - A cell on four lines shows four dots, side by side, in a stable order.
//   - A line keeps a consistent offset down the chart, so two lines through
//     the same cells stay readable instead of overlapping exactly.
// The slots WRAP inside the cell, so a chart with two dozen candidates gets a
// second and third row of dots rather than a cell that grows sideways.
//
// HOW A LINE IS DRAWN. Hold shift and click cells; each click adds a waypoint,
// and clicking a second cell in a row you already visited MOVES the waypoint.
// Release shift to keep it. Escape abandons it. A drawn dot can also be
// DRAGGED to another cell in its own row.
//
// A LINE IS A CANDIDATE ONLY WHEN IT IS COMPLETE — one option per cluster
// (owner ruling). An unfinished line is kept and drawn dashed rather than
// thrown away, because a person mid-thought is the normal case, and the state's
// own check names it at submit.
//
// COLOUR IS A FUNCTION OF POSITION, never stored. See sfmbPen below.
//
// NO BACKTICK MAY APPEAR IN ANY BODY BELOW, not even inside a comment. Each
// body is one template literal and a backtick ENDS it — everything after would
// become real TypeScript. It has happened twice.
import type { EditorKind } from "./kinds.ts";

export const MORPH_BOX_EDITOR: EditorKind = {
  id: "morph-box",
  render: `
    const box = args.box || { rows: [], lines: [] };
    if (box.rows.length === 0) {
      return '<div class="sfempty" style="color:var(--se-muted);font-style:italic;padding:6px 0;">No clusters yet, so there is no chart to draw on. partition-functions names the rows, and the seven finders fill the cells.</div>';
    }
    // EVERY COLUMN WRAPS, AND THE ROW HEADER WRAPS TOO (owner, 2026-08-09).
    // The header carried white-space:nowrap, so a cluster name held the whole
    // chart open and pushed the cells off the side. A chart nobody can see
    // across is a chart nobody draws on.
    const cel = "padding:5px 8px;border-top:1px solid var(--se-border);vertical-align:top;font-size:12.5px;min-width:140px;max-width:240px;white-space:normal;overflow-wrap:anywhere;";
    // A MIN-WIDTH IS WHAT MAKES IT WRAP (owner, 2026-08-09). Wrapping alone
    // let the table squeeze the header to one character per line, because
    // overflow-wrap:anywhere permits a break between any two letters. The
    // floor gives the column a width to wrap INSIDE.
    const hed = "padding:5px 8px;text-align:left;font-weight:normal;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--se-muted);vertical-align:top;white-space:normal;overflow-wrap:break-word;min-width:150px;max-width:200px;";
    // THE CONTROLS WEAR THE THEME, never the browser's default (ux.md). A bare
    // button renders white on a dark panel, which is what the owner saw.
    const btn = "background:transparent;border:1px solid var(--se-border);border-radius:3px;color:var(--se-muted);font:inherit;font-size:11px;line-height:1.4;padding:0 6px;cursor:pointer;";
    const rowHtml = function (r) {
      const cells = r.cells.map(function (c) {
        const struck = c.pruned !== "" ? "text-decoration:line-through;color:var(--se-muted);" : "";
        const why = c.pruned !== "" ? "pruned: " + c.pruned : (c.found_by !== "" ? "found by " + c.found_by : "");
        // THE SLOTS ARE FILLED BY THE CLIENT, never here. The count follows the
        // number of lines, which changes as a person draws, so rendering them
        // server-side would put two sources in charge of one thing.
        // EVERY CELL IS AN OPTION, SO EVERY CELL LINKS TO ITS NOTE (owner,
        // 2026-08-09). It opens in the EDITOR rather than the details pane,
        // because the pane is already holding the matrix you are reading.
        const p = paths ? paths[c.id] : null;
        const idLink = p
          ? '<a class="doclink" data-path="' + escText(p) + '" title="open ' + escText(p) + ' in the editor" style="color:var(--se-accent);font-size:10.5px;cursor:pointer;">' + escText(c.id) + "</a>"
          : '<span style="font-size:10.5px;color:var(--se-muted);">' + escText(c.id) + "</span>";
        return '<td class="sfmbcell" style="' + cel + 'cursor:pointer;" data-opt="' + escText(c.id) + '" data-row="' + escText(r.id) + '" data-pruned="' + (c.pruned !== "" ? "1" : "") + '" title="' + escText(why) + '">' +
          '<div class="sfmbid" style="padding-bottom:2px;">' + idLink + "</div>" +
          '<div class="sfmbtext" style="' + struck + '">' + escText(c.label) + "</div>" +
          '<div class="sfmbdots" style="display:flex;flex-wrap:wrap;gap:3px;padding-top:4px;min-height:9px;"></div>' +
          '<button type="button" class="sfmbprune" title="prune this option out of the chart" style="' + btn + 'display:none;margin-top:4px;">prune</button>' +
          "</td>";
      }).join("");
      const empty = r.cells.length === 0 ? '<td style="' + cel + 'color:var(--se-muted);font-style:italic;">nobody found an option for this cluster</td>' : "";
      return '<tr data-row="' + escText(r.id) + '"><th style="' + hed + '">' + escText(r.name) + "</th>" + cells + empty + "</tr>";
    };
    const grid = '<div class="sfmbwrap" style="position:relative;overflow:auto;">' +
      '<table class="sfnodetable sfmb" style="border-collapse:collapse;"><tbody>' + box.rows.map(rowHtml).join("") + "</tbody></table>" +
      '<svg class="sfmbsvg" style="position:absolute;left:0;top:0;pointer-events:none;overflow:visible;"></svg></div>';
    const bx = "background:transparent;border:0;outline:none;font:inherit;color:var(--se-fg);padding:0;";
    // THE ROW IS A REFERENCE TO A NOTE, not a record of its own. Clicking the
    // id opens the candidate in the editor, where its prose lives — the same
    // move a reference list makes, for the same reason: the note is the truth
    // and copying it here would fork it.
    const lineRow = function (l) {
      const p = paths ? paths[l.id] : null;
      const open = p ? '<a class="reflink" style="color:var(--se-accent);cursor:pointer;flex:0 0 auto;font-size:11px;" data-path="' + escText(p) + '" title="open ' + escText(p) + ' in the editor">' + escText(l.id) + "</a>" : '<span style="flex:0 0 auto;font-size:11px;color:var(--se-muted);" title="the note is written when the form is saved">' + escText(l.id) + "</span>";
      return '<div class="sfrow sfmbline" data-cand="' + escText(l.id) + '" data-picks="' + escText(l.picks.join(" ")) + '">' +
        '<span class="sfmbswatch" style="flex:0 0 auto;width:10px;height:10px;border-radius:2px;display:inline-block;"></span>' +
        open +
        '<input class="sfmbname" style="' + bx + 'flex:0 0 160px;font-weight:600;font-size:12.5px;" value="' + escText(l.name) + '" placeholder="name it">' +
        '<input class="sfmbwhat" style="' + bx + 'flex:1 1 auto;font-size:12.5px;" value="' + escText(l.statement) + '" placeholder="what this whole architecture is, in one line">' +
        '<span class="sfmbwarn" style="font-size:11px;color:var(--se-muted);"></span>' +
        '<button type="button" class="sfmbdel" title="remove this candidate and its line" style="' + btn + '">−</button>' +
        "</div>";
    };
    const rowCount = box.rows.filter(function (r) { return r.id !== ""; }).length;
    // THE SAVED SNAPSHOT IS WHAT REVERT GOES BACK TO, never the previous step.
    // Drawing a line is several clicks and deleting one is a single press, so
    // a person needs somewhere to return to that is not one click back.
    const U1 = String.fromCharCode(1);
    const U2 = String.fromCharCode(2);
    const pristine = box.lines.map(function (l) {
      return [l.id, l.name, l.statement, l.picks.join(" ")].join(U1);
    }).join(U2);
    const list = '<div class="sfmblines" data-field="' + escText(name) + '" data-rows="' + rowCount + '" data-pristine="' + escText(pristine) + '">' + box.lines.map(lineRow).join("") + "</div>";
    const bar = '<div class="sfmbbar" style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:11px;color:var(--se-muted);">' +
      '<button type="button" class="sfmbsave sfact save" title="write these changes to the form">save</button>' +
      '<button type="button" class="sfmbrevert sfact revert" title="throw the changes away and go back to the last save">revert</button>' +
      '<span class="sfmbdirty"></span></div>';
    const how = '<div class="sfmbhow" style="color:var(--se-muted);font-size:11px;padding:6px 0;">Hold shift and click one cell per row to draw a candidate. Release shift to keep it, escape to abandon it. Drag a dot to move that waypoint within its row.</div>';
    return grid + how + bar + list;
  `,
  collect: `
  // ONE ROW PER LINE, in the order they are drawn — and that order is the
  // palette order, so the file is what a person reorders to recolour.
  document.querySelectorAll(".sfmblines").forEach(function (box) {
    const lines = ["| candidate | name | what it is | visits |", "| --- | --- | --- | --- |"];
    box.querySelectorAll(".sfmbline").forEach(function (row) {
      const picks = (row.dataset.picks || "").split(" ").filter(Boolean).map(function (p) { return "[[" + p + "]]"; });
      const nm = row.querySelector(".sfmbname");
      const wt = row.querySelector(".sfmbwhat");
      lines.push("| [[" + row.dataset.cand + "]] | " + (nm ? nm.value.trim() : "") + " | " + (wt ? wt.value.trim() : "") + " | " + picks.join(" \\u00b7 ") + " |");
    });
    // THE PRUNES RIDE THE SAME FIELD, under their own heading, so one save
    // carries both and the state script can apply them together.
    const pruned = [];
    document.querySelectorAll('.sfmbcell[data-pruned="1"]').forEach(function (c) {
      if (c.dataset.prunedHere === "1") pruned.push("- [[" + c.dataset.opt + "]] — " + (c.dataset.prunedWhy || ""));
    });
    fields[box.dataset.field] = lines.join("\\n") + (pruned.length > 0 ? "\\n\\npruned:\\n" + pruned.join("\\n") : "");
  });
  `,
  behaviour: `
  // THE PALETTE — pyqtgraph's intColor(index, hues=n), which the owner named.
  //
  // Its rule is one line: h = minHue + (index * (maxHue - minHue)) / hues,
  // with hues set to the number of series. So the hue wheel is CUT INTO N
  // EQUAL PARTS and each line takes one. Two lines land opposite each other;
  // twenty land close but still ordered. Adding a line re-cuts the wheel, so
  // every colour moves — which is why a colour is never stored.
  //
  // THE ONE DEVIATION, said out loud: pyqtgraph builds the colour at full
  // saturation and value, which is right on a black plot and harsh in a text
  // panel that may be light. The saturation and lightness below are softened;
  // the HUE rule is pyqtgraph's exactly.
  //
  // IT BREAKS THE HOUSE RULE that only theme tokens name colours (ux.md). A
  // fixed token set cannot produce N distinguishable series, and N is not
  // known until the person draws the Nth line. Colour is never the only
  // difference: each line carries its name at its first dot.
  function sfmbPen(i, n) {
    return "hsl(" + Math.round((i * 360) / Math.max(1, n)) + " 80% 55%)";
  }
  // A CATMULL-ROM SPLINE THROUGH THE WAYPOINTS, as cubic Beziers — the same
  // shape the machine drawing's route line uses.
  function sfmbPath(pts) {
    if (pts.length === 0) return "";
    if (pts.length === 1) return "M " + pts[0][0] + " " + pts[0][1];
    let d = "M " + pts[0][0] + " " + pts[0][1];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 >= pts.length ? pts.length - 1 : i + 2];
      d += " C " + (p1[0] + (p2[0] - p0[0]) / 6) + " " + (p1[1] + (p2[1] - p0[1]) / 6) +
        " " + (p2[0] - (p3[0] - p1[0]) / 6) + " " + (p2[1] - (p3[1] - p1[1]) / 6) +
        " " + p2[0] + " " + p2[1];
    }
    return d;
  }
  let sfmbDraft = null;
  let sfmbDrag = null;
  const sfmbU1 = String.fromCharCode(1);
  const sfmbU2 = String.fromCharCode(2);
  function sfmbLines() { return [].slice.call(document.querySelectorAll(".sfmbline")); }
  // ONE PLACE BUILDS A LINE ROW. Drawing one and reverting to one produce the
  // same element, so the two cannot drift into different markup.
  function sfmbRowEl(cand, nm, what, picks) {
    const el = document.createElement("div");
    el.className = "sfrow sfmbline";
    el.dataset.cand = cand;
    el.dataset.picks = picks;
    const bx = "background:transparent;border:0;outline:none;font:inherit;color:var(--se-fg);padding:0;";
    const btn = "background:transparent;border:1px solid var(--se-border);border-radius:3px;color:var(--se-muted);font:inherit;font-size:11px;line-height:1.4;padding:0 6px;cursor:pointer;";
    const esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); };
    el.innerHTML = '<span class="sfmbswatch" style="flex:0 0 auto;width:10px;height:10px;border-radius:2px;display:inline-block;"></span>' +
      '<span style="flex:0 0 auto;font-size:11px;color:var(--se-muted);" title="the note is written when the form is saved">' + esc(cand) + "</span>" +
      '<input class="sfmbname" style="' + bx + 'flex:0 0 160px;font-weight:600;font-size:12.5px;" value="' + esc(nm) + '" placeholder="name it">' +
      '<input class="sfmbwhat" style="' + bx + 'flex:1 1 auto;font-size:12.5px;" value="' + esc(what) + '" placeholder="what this whole architecture is, in one line">' +
      '<span class="sfmbwarn" style="font-size:11px;color:var(--se-muted);"></span>' +
      '<button type="button" class="sfmbdel" title="remove this candidate and its line" style="' + btn + '">−</button>';
    return el;
  }
  function sfmbPicks(row) { return (row.dataset.picks || "").split(" ").filter(Boolean); }
  // EVERY CELL HOLDS ONE SLOT PER LINE, plus one for whatever is being drawn.
  // The slot index IS the line's index, so a candidate's dot sits in the same
  // place in every cell it visits and the curve keeps a steady offset.
  function sfmbSyncSlots() {
    const rows = sfmbLines();
    const want = rows.length + 1;
    document.querySelectorAll(".sfmbdots").forEach(function (holder) {
      while (holder.children.length > want) holder.removeChild(holder.lastChild);
      while (holder.children.length < want) {
        const dot = document.createElement("i");
        dot.className = "sfmbdot";
        dot.style.cssText = "width:7px;height:7px;border-radius:50%;display:block;visibility:hidden;cursor:grab;";
        holder.appendChild(dot);
      }
      const opt = holder.closest(".sfmbcell").dataset.opt;
      const n = want;
      rows.forEach(function (row, i) {
        const dot = holder.children[i];
        const on = sfmbPicks(row).indexOf(opt) >= 0;
        dot.style.visibility = on ? "visible" : "hidden";
        dot.style.background = sfmbPen(i, rows.length);
        dot.dataset.cand = row.dataset.cand;
        dot.dataset.slot = i;
      });
      const draftDot = holder.children[n - 1];
      const drawing = sfmbDraft !== null && sfmbDraft.picks.indexOf(opt) >= 0;
      draftDot.style.visibility = drawing ? "visible" : "hidden";
      draftDot.style.background = sfmbPen(rows.length, rows.length + 1);
      draftDot.dataset.cand = "";
      draftDot.dataset.slot = n - 1;
    });
  }
  function sfmbDotAt(wrap, optId, slot) {
    const cell = wrap.querySelector('.sfmbcell[data-opt="' + optId + '"]');
    if (!cell) return null;
    const dot = cell.querySelectorAll(".sfmbdot")[slot];
    if (!dot) return null;
    const a = dot.getBoundingClientRect();
    const b = wrap.getBoundingClientRect();
    if (a.width === 0) return null;
    return [a.left - b.left + wrap.scrollLeft + a.width / 2, a.top - b.top + wrap.scrollTop + a.height / 2];
  }
  function sfmbUnvisited(row) {
    const picks = sfmbPicks(row);
    const list = document.querySelector(".sfmblines");
    const need = list ? Number(list.dataset.rows || 0) : 0;
    const seen = {};
    picks.forEach(function (p) {
      const cell = document.querySelector('.sfmbcell[data-opt="' + p + '"]');
      if (cell) seen[cell.dataset.row] = 1;
    });
    return need - Object.keys(seen).length;
  }
  function sfmbDraw() {
    sfmbSyncSlots();
    const rows = sfmbLines();
    rows.forEach(function (row, i) {
      const sw = row.querySelector(".sfmbswatch");
      if (sw) sw.style.background = sfmbPen(i, rows.length);
      const left = sfmbUnvisited(row);
      const warn = row.querySelector(".sfmbwarn");
      // A LINE IS A CANDIDATE ONLY WHEN IT IS COMPLETE. The row says so rather
      // than the save refusing silently.
      if (warn) warn.textContent = left > 0 ? "unfinished — " + left + " row" + (left === 1 ? "" : "s") + " to go" : "";
      row.dataset.complete = left > 0 ? "" : "1";
    });
    // UNSAVED CHANGES SAY SO, measured against the SAVED snapshot. Somebody
    // who drew a line and deleted it again has changed nothing, and should
    // not be told otherwise.
    const list = document.querySelector(".sfmblines");
    const flag = document.querySelector(".sfmbdirty");
    if (list && flag) {
      const now = rows.map(function (row) {
        const nm = row.querySelector(".sfmbname");
        const wt = row.querySelector(".sfmbwhat");
        return [row.dataset.cand, nm ? nm.value : "", wt ? wt.value : "", row.dataset.picks || ""].join(sfmbU1);
      }).join(sfmbU2);
      const dirty = now !== (list.dataset.pristine || "");
      flag.textContent = dirty ? "unsaved changes" : "";
      flag.style.color = dirty ? "var(--se-accent)" : "";
    }
    document.querySelectorAll(".sfmbwrap").forEach(function (wrap) {
      const svg = wrap.querySelector(".sfmbsvg");
      const tbl = wrap.querySelector("table.sfmb");
      if (!svg || !tbl) return;
      svg.setAttribute("width", tbl.scrollWidth);
      svg.setAttribute("height", tbl.scrollHeight);
      const parts = [];
      const draw = function (picks, colour, slot, label, dashed) {
        const pts = picks.map(function (p) { return sfmbDotAt(wrap, p, slot); }).filter(Boolean);
        if (pts.length === 0) return;
        const dash = dashed ? ' stroke-dasharray="5 4"' : "";
        if (pts.length > 1) parts.push('<path d="' + sfmbPath(pts) + '" fill="none" stroke="' + colour + '" stroke-width="2" stroke-linecap="round"' + dash + "/>");
        if (label !== "") parts.push('<text x="' + (pts[0][0] + 9) + '" y="' + (pts[0][1] - 6) + '" fill="' + colour + '" font-size="11">' + label.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</text>");
      };
      rows.forEach(function (row, i) {
        const nameEl = row.querySelector(".sfmbname");
        const label = nameEl && nameEl.value.trim() !== "" ? nameEl.value.trim() : row.dataset.cand;
        draw(sfmbPicks(row), sfmbPen(i, rows.length), i, label, row.dataset.complete !== "1");
      });
      if (sfmbDraft !== null) draw(sfmbDraft.picks, sfmbPen(rows.length, rows.length + 1), rows.length, "", true);
      svg.innerHTML = parts.join("");
    });
  }
  // ONE CELL PER ROW. Clicking a second cell in a row already visited MOVES
  // the waypoint — a candidate picks one option per cluster, so two in a row
  // is never what somebody meant.
  function sfmbPlace(picks, optId, rowId) {
    const kept = picks.filter(function (p) {
      const cell = document.querySelector('.sfmbcell[data-opt="' + p + '"]');
      return !cell || cell.dataset.row !== rowId;
    });
    return kept.indexOf(optId) >= 0 ? kept : kept.concat([optId]);
  }
  document.addEventListener("click", function (ev) {
    const cell = ev.target.closest ? ev.target.closest(".sfmbcell") : null;
    if (cell && ev.shiftKey) {
      ev.preventDefault();
      // A PRUNED CELL IS OUT OF THE CHART. It still shows, so the reader sees
      // what was considered, and no line may pass through it.
      if (cell.dataset.pruned === "1") return;
      if (sfmbDraft === null) sfmbDraft = { picks: [] };
      sfmbDraft.picks = sfmbPlace(sfmbDraft.picks, cell.dataset.opt, cell.dataset.row);
      sfmbDraw();
      return;
    }
    const del = ev.target.closest ? ev.target.closest(".sfmbdel") : null;
    if (del) {
      const row = del.closest(".sfmbline");
      if (row) row.remove();
      sfmbDraw();
      return;
    }
    // PRUNING IS A DECISION WITH A REASON, so it asks for one. An option
    // struck without a reason gets reinvented next iteration.
    const prune = ev.target.closest ? ev.target.closest(".sfmbprune") : null;
    if (prune) {
      const c = prune.closest(".sfmbcell");
      const why = window.prompt("Why is this option out of the chart?");
      if (why === null || why.trim() === "") return;
      c.dataset.pruned = "1";
      c.dataset.prunedHere = "1";
      c.dataset.prunedWhy = why.trim();
      const t = c.querySelector(".sfmbtext");
      if (t) { t.style.textDecoration = "line-through"; t.style.color = "var(--se-muted)"; }
      // A PRUNED CELL DROPS OFF EVERY LINE THROUGH IT, and the lines that lose
      // a waypoint go back to unfinished rather than quietly shortening.
      sfmbLines().forEach(function (row) {
        row.dataset.picks = sfmbPicks(row).filter(function (p) { return p !== c.dataset.opt; }).join(" ");
      });
      sfmbDraw();
    }
  });
  // A DOT CAN BE DRAGGED to another cell in ITS OWN row. Across rows it would
  // mean something else entirely, so it is refused rather than guessed at.
  document.addEventListener("mousedown", function (ev) {
    const dot = ev.target.closest ? ev.target.closest(".sfmbdot") : null;
    if (!dot || dot.style.visibility !== "visible" || dot.dataset.cand === "") return;
    const cell = dot.closest(".sfmbcell");
    sfmbDrag = { cand: dot.dataset.cand, row: cell.dataset.row, from: cell.dataset.opt };
    ev.preventDefault();
  });
  document.addEventListener("mouseup", function (ev) {
    if (sfmbDrag === null) return;
    const cell = ev.target.closest ? ev.target.closest(".sfmbcell") : null;
    const drag = sfmbDrag;
    sfmbDrag = null;
    if (!cell || cell.dataset.row !== drag.row || cell.dataset.pruned === "1") { sfmbDraw(); return; }
    const row = document.querySelector('.sfmbline[data-cand="' + drag.cand + '"]');
    if (row) row.dataset.picks = sfmbPlace(sfmbPicks(row), cell.dataset.opt, drag.row).join(" ");
    sfmbDraw();
  });
  // RELEASING SHIFT KEEPS THE LINE. It becomes a candidate ROW here; the
  // state's own script turns a COMPLETE one into a candidate node on submit.
  document.addEventListener("keyup", function (ev) {
    if (ev.key !== "Shift" || sfmbDraft === null) return;
    const picks = sfmbDraft.picks;
    sfmbDraft = null;
    const list = document.querySelector(".sfmblines");
    if (picks.length === 0 || !list) { sfmbDraw(); return; }
    const id = "cand-" + (list.querySelectorAll(".sfmbline").length + 1) + "-" + picks[0].replace(/^opt-/, "");
    const el = sfmbRowEl(id, "", "", picks.join(" "));
    list.appendChild(el);
    const nm = el.querySelector(".sfmbname");
    if (nm) nm.focus();
    sfmbDraw();
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape" && sfmbDraft !== null) { sfmbDraft = null; sfmbDraw(); }
  });
  // SAVE IS THE FORM'S OWN SAVE, pressed from here. A second save that wrote
  // by another path would be a second way for the form to land, and the two
  // would drift.
  document.addEventListener("click", function (ev) {
    const s = ev.target.closest ? ev.target.closest(".sfmbsave") : null;
    if (!s) return;
    const real = document.querySelector(".saveform");
    if (real) real.click();
  });
  // REVERT PUTS THE LINES BACK TO THE LAST SAVE. Drawing a line is several
  // clicks and deleting one is a single press, so one step back is not what a
  // person wants when they change their mind.
  document.addEventListener("click", function (ev) {
    const r = ev.target.closest ? ev.target.closest(".sfmbrevert") : null;
    if (!r) return;
    const list = document.querySelector(".sfmblines");
    if (!list) return;
    list.innerHTML = "";
    (list.dataset.pristine || "").split(sfmbU2).filter(Boolean).forEach(function (line) {
      const p = line.split(sfmbU1);
      list.appendChild(sfmbRowEl(p[0] || "", p[1] || "", p[2] || "", p[3] || ""));
    });
    sfmbDraft = null;
    sfmbDraw();
  });
  document.addEventListener("input", function (ev) {
    if (ev.target.closest && ev.target.closest(".sfmbname")) sfmbDraw();
  });
  // The prune button hides until the cell is hovered — a control on every cell
  // at all times is forty buttons nobody asked for.
  document.addEventListener("mouseover", function (ev) {
    const cell = ev.target.closest ? ev.target.closest(".sfmbcell") : null;
    document.querySelectorAll(".sfmbprune").forEach(function (b) { b.style.display = "none"; });
    if (cell && cell.dataset.pruned !== "1") {
      const b = cell.querySelector(".sfmbprune");
      if (b) b.style.display = "";
    }
  });
  // THE OVERLAY IS SIZED FROM THE TABLE, so it redraws whenever the table
  // moves. A form re-render replaces the whole node, so the observer watches
  // the document rather than an element that will not survive it.
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(function () { sfmbDraw(); }).observe(document.body);
  window.addEventListener("resize", sfmbDraw);
  setInterval(function () { if (document.querySelector(".sfmbwrap")) sfmbDraw(); }, 800);
  `,
};
