// see dsp-form-editors.md#the-typed-table
import type { EditorKind } from "./kinds.ts";

export const TABLE_EDITOR: EditorKind = {
  id: "table",
  render: `
    const cols = args.columns || [];
    const help = args.column_help || [];
    const picks = args.picks || {};
    const free = args.pick_free || [];
    const sources = args.pick_sources || {};
    const cellsOf = function (line) {
      const t = String(line || "").trim();
      if (t.charAt(0) !== "|" || t.charAt(t.length - 1) !== "|") return null;
      const parts = t.slice(1, -1).split("|").map(function (c) { return c.trim(); });
      return parts.every(function (c) { return /^:?-{2,}:?$/.test(c); }) ? null : parts;
    };
    const stored = String(fl.content || "").split("\\n").map(cellsOf).filter(function (r) { return r !== null; });
    // The header is the DECLARED columns, so a stored header row is dropped
    // rather than shown twice.
    const body = stored.filter(function (r) { return r.join("\\u0001").toLowerCase() !== cols.join("\\u0001").toLowerCase(); });
    // THE SAME THREE SHAPES THE NODE TABLE USES. Copied deliberately: a class
    // inherits the host's theme, and a colour picked here does not.
    const cel = "padding:5px 8px;border-top:1px solid var(--se-border);vertical-align:middle;";
    const hed = "padding:5px 8px;text-align:left;font-weight:normal;font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--se-muted);";
    const box = "width:100%;box-sizing:border-box;background:transparent;border:0;outline:none;font:inherit;font-size:12.5px;color:var(--se-fg);padding:0;";
    const listId = function (c) { return "sfl-" + name + "-" + c; };
    // WHAT AN EMPTY OFFER IS WAITING FOR, in words rather than in the source
    // name. "$clusters" is an identifier; "clusters" is what a reader wants.
    const waitingFor = function (c) {
      return (sources[c] || []).map(function (s) {
        return String(s).replace(/^\\$/, "").replace(/_/g, " ");
      }).join(" or ");
    };
    const isFree = function (c) { return free.indexOf(c) >= 0; };
    const datalists = Object.keys(picks).filter(isFree).map(function (c) {
      return '<datalist id="' + escText(listId(c)) + '">' + (picks[c] || []).map(function (o) { return '<option value="' + escText(o) + '">'; }).join("") + "</datalist>";
    }).join("");
    const openCell = function (c, v) {
      const listed = picks[c] ? ' list="' + escText(listId(c)) + '"' : "";
      return '<input class="sftb" style="' + box + '"' + listed + ' data-field="' + name + '" data-col="' + escText(c) + '" value="' + escText(v) + '">';
    };
    // A CLOSED CHOOSER KEEPS WHAT IS ALREADY WRITTEN, even when the offer no
    // longer holds it. A cluster renamed upstream would otherwise blank the
    // cell on the next render, and nothing would report the loss.
    const closedCell = function (c, v) {
      const offer = picks[c] || [];
      const known = offer.indexOf(v) >= 0;
      const hint = offer.length === 0 ? '<option value="" disabled>— no ' + escText(waitingFor(c)) + " yet —</option>" : '<option value=""></option>';
      const opts = offer.map(function (o) {
        return '<option value="' + escText(o) + '"' + (o === v ? " selected" : "") + ">" + escText(o) + "</option>";
      }).join("");
      const stray = v !== "" && !known ? '<option value="' + escText(v) + '" selected>' + escText(v) + " — no longer offered</option>" : "";
      return '<select class="sftb sfpick" style="' + box + 'cursor:pointer;" data-field="' + name + '" data-col="' + escText(c) + '">' + hint + opts + stray + "</select>";
    };
    const head = "<thead><tr>" + cols.map(function (c, i) {
      const h = help[i] ? '<div style="text-transform:none;letter-spacing:0;padding-top:2px;">' + escText(help[i]) + "</div>" : "";
      return '<th style="' + hed + '">' + escText(c) + h + "</th>";
    }).join("") + '<th style="' + hed + 'width:56px;"></th></tr></thead>';
    const rowHtml = function (r) {
      const cellsHtml = cols.map(function (c, ci) {
        const v = r[ci] || "";
        const inner = picks[c] && !isFree(c) ? closedCell(c, v) : openCell(c, v);
        return '<td style="' + cel + '">' + inner + "</td>";
      }).join("");
      return '<tr class="sfrow" style="display:table-row;">' + cellsHtml + '<td style="' + cel + 'white-space:nowrap;">' + sfRowBtns() + "</td></tr>";
    };
    // AT LEAST ONE ROW ALWAYS STANDS. An empty table still needs its editor,
    // and the delete handler already refuses to remove the last one.
    const rows = body.length > 0 ? body : [cols.map(function () { return ""; })];
    const flat = datalists + '<table class="sfnodetable sftable" style="width:100%;border-collapse:collapse;table-layout:fixed;">' + head + "<tbody>" + rows.map(rowHtml).join("") + "</tbody></table>";
    // see dsp-form-editors.md#the-grid-read-view
    let grid = "";
    if (cols.length >= 3 && picks[cols[0]] && picks[cols[1]] && !isFree(cols[0]) && !isFree(cols[1]) && body.length > 0) {
      const rk = []; const ck = []; const cellAt = {};
      body.forEach(function (r) {
        const a = r[0] || ""; const b = r[1] || "";
        if (a === "" || b === "") return;
        if (rk.indexOf(a) < 0) rk.push(a);
        if (ck.indexOf(b) < 0) ck.push(b);
        cellAt[a + "\\u0001" + b] = r;
      });
      if (rk.length > 1 || ck.length > 1) {
        const sticky = "position:sticky;left:0;background:var(--se-bg,var(--vscode-editor-background));";
        const shortHead = function (s) { return escText(String(s).replace(/^req-/, "")); };
        const gh = '<th style="' + hed + sticky + '">' + escText(cols[0]) + "</th>" + ck.map(function (c) { return '<th style="' + hed + 'min-width:56px;">' + shortHead(c) + "</th>"; }).join("");
        const gr = rk.map(function (a) {
          const tds = ck.map(function (b) {
            const r = cellAt[a + "\\u0001" + b];
            return '<td class="sfgridcell" tabindex="0" style="' + cel + 'text-align:center;cursor:pointer;" data-cell="' + escText(JSON.stringify(r || [])) + '">' + escText(r ? (r[2] || "") : "") + "</td>";
          }).join("");
          return "<tr><td style=\\"" + cel + sticky + 'white-space:nowrap;">' + escText(a) + "</td>" + tds + "</tr>";
        }).join("");
        grid = '<div style="overflow-x:auto;max-width:100%;margin-bottom:6px;"><table class="sfnodetable" data-cols="' + escText(JSON.stringify(cols)) + '" style="border-collapse:collapse;">' +
          "<thead><tr>" + gh + "</tr></thead><tbody>" + gr + "</tbody></table></div>" +
          '<div class="meta" style="font-size:11px;">the grid reads — click a cell for its detail; the rows below edit</div>';
      }
    }
    return grid !== "" ? grid + '<details><summary class="meta" style="cursor:pointer;">edit the rows</summary>' + flat + "</details>" : flat;
  `,
  collect: `
  // A TYPED TABLE SERIALISES BY DOM ORDER, never by a stored index. The +
  // button clones a row, so an index written into the markup would be
  // duplicated the moment anybody added a line.
  //
  // A row whose cells are all blank is dropped: that is the empty editor an
  // empty table always shows, not an answer.
  const tbSeen = {};
  document.querySelectorAll("table.sftable").forEach(function (tbl) {
    const first = tbl.querySelector(".sftb");
    if (!first) return;
    const f = first.dataset.field;
    if (tbSeen[f]) return;
    tbSeen[f] = true;
    const cols = [];
    tbl.querySelectorAll("tbody tr:first-child .sftb").forEach(function (c) { cols.push(c.dataset.col); });
    const lines = ["| " + cols.join(" | ") + " |", "| " + cols.map(function () { return "---"; }).join(" | ") + " |"];
    tbl.querySelectorAll("tbody tr").forEach(function (tr) {
      const cells = [];
      tr.querySelectorAll(".sftb").forEach(function (c) { cells.push(c.value.trim().replace(/\\|/g, "\\\\|")); });
      if (cells.some(function (c) { return c !== ""; })) lines.push("| " + cells.join(" | ") + " |");
    });
    fields[f] = lines.join("\\n");
  });
  `,
};
