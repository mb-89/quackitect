// THE MATRIX, WITH THE GROUPS DRAWN ON IT. Elements on both axes, a mark
// where one affects the other, and the row order arranged so each cluster is
// a contiguous block. That block IS the finding: a person reads structure off
// the picture instead of being told about it.
//
// IT HAS NO COLLECTOR OF ITS OWN. Its cluster picker, its name box and its
// coupling select all carry `class="sfnt"`, so the node-table serialiser
// gathers them. Two editors, one storage shape, on purpose — the naming table
// IS a node table that happens to sit beside a matrix.
import type { EditorKind } from "./kinds.ts";

export const DSM_EDITOR: EditorKind = {
  id: "dsm",
  render: `
    // The naming table sits underneath, because the engine can group and
    // cannot name.
    const d = args.dsm || {};
    const order = d.order || [];
    if (order.length === 0) {
      return '<div style="font-size:11px;color:var(--se-accent);padding:6px 0;">nothing to partition — this field&#39;s item source resolved to an empty set</div>';
    }
    const cl = d.cluster || {};
    const eg = d.edges || {};
    const mark = function (a, b) { return (eg[a] || []).indexOf(b) >= 0; };
    // THE LAST DOTTED SEGMENT, with the type prefix off the root. Showing the
    // raw id put fn-run-a-governed-walk beside keep-the-archive, which reads
    // as two different naming schemes when it is one.
    //
    // NO BACKTICKS IN HERE, EVER. This whole block is one template literal,
    // so a backtick in a comment ends the script.
    const short = function (id) {
      const tail = String(id).split(".").pop();
      const cut = tail.indexOf("-");
      return cut > 0 && cut <= 8 ? tail.slice(cut + 1) : tail;
    };
    // EVERY CELL CARRIES ITS OWN GRID LINE. Without them the marks float in
    // space and nobody can tell which row meets which column — which is the
    // one thing a matrix is for.
    const grid = "1px solid var(--se-border)";
    const cel = "width:16px;height:16px;padding:0;text-align:center;font-size:9px;line-height:16px;border:" + grid + ";";
    // THE BOX ROUND A CLUSTER OVERRIDES THE GRID on its boundary. A cell gets
    // the heavy edge wherever its neighbour belongs to a different group,
    // which puts a line exactly on every boundary and nowhere else.
    const edge = "2px solid var(--se-accent)";
    const bord = function (i, j) {
      const ci = cl[order[i]] || "";
      const cj = cl[order[j]] || "";
      if (ci === "" || ci !== cj) return "";
      let s = "";
      if (i === 0 || (cl[order[i - 1]] || "") !== ci) s += "border-top:" + edge + ";";
      if (i === order.length - 1 || (cl[order[i + 1]] || "") !== ci) s += "border-bottom:" + edge + ";";
      if (j === 0 || (cl[order[j - 1]] || "") !== cj) s += "border-left:" + edge + ";";
      if (j === order.length - 1 || (cl[order[j + 1]] || "") !== cj) s += "border-right:" + edge + ";";
      return s;
    };
    const groups = [];
    order.forEach(function (id) { const c = cl[id] || ""; if (c !== "" && groups.indexOf(c) < 0) groups.push(c); });
    const lbl = function (c) { return c === "" ? "—" : short(c); };
    const opts = (args.picks && args.picks.cluster ? args.picks.cluster : []).concat(groups.filter(function (g) {
      return (args.picks && args.picks.cluster ? args.picks.cluster : []).indexOf(g) < 0;
    }));
    const hdr = "padding:0 4px;font-size:9px;color:var(--se-muted);font-weight:normal;border:" + grid + ";";
    // THE FIRST PAGE IS RENDERED HIDDEN-BEYOND, not left to a script. A matrix
    // that shows everything for an instant and then collapses is a flash of
    // the wrong thing, and on a slow paint it never collapses at all.
    const size = args.page_size || 10;
    const off = function (k) { return k >= size ? "display:none;" : ""; };
    const head = '<tr><th style="' + hdr + '"></th><th style="' + hdr + '">cl</th>' + order.map(function (id, j) {
      return '<th class="dsmc" data-c="' + j + '" style="' + cel + off(j) + 'color:var(--se-muted);font-weight:normal;" title="' + escText(id) + '">' + escText(String(j + 1)) + "</th>";
    }).join("") + "</tr>";
    const rows = order.map(function (a, i) {
      const cells = order.map(function (b, j) {
        // THE DIAGONAL IS SELF-REFLEXIVE and carries no information, so it is
        // blacked out rather than left looking like an absent dependency.
        const on = i !== j && mark(a, b);
        const bg = i === j ? "background:var(--se-border);" : (on ? "background:var(--se-fg);" : "");
        // THE CELL NAMES ITS FLOWS. Every flow between two functions is the
        // same relation, so they AGGREGATE into one mark — and a mark whose
        // contents you cannot see is a fact with its reason hidden.
        const via = (d.via || {})[a + "|" + b] || [];
        const tip = escText(short(a)) + " → " + escText(short(b)) + (via.length > 0 ? ": " + escText(via.map(short).join(", ")) : "");
        return '<td class="dsmc" data-c="' + j + '" style="' + cel + off(j) + bord(i, j) + bg + '" title="' + tip + '"></td>';
      }).join("");
      const pick = '<select class="sfnt dsmdsel" style="background:transparent;border:0;color:var(--se-muted);font:inherit;font-size:10.5px;" data-field="' + name + '" data-item="' + escText(a) + '" data-col="cluster">'
        + ['<option value="">—</option>'].concat(opts.map(function (c) {
          return '<option value="' + escText(c) + '"' + (cl[a] === c ? " selected" : "") + ">" + escText(lbl(c)) + "</option>";
        })).join("") + "</select>";
      return '<tr class="dsmr" data-r="' + i + '" style="' + off(i) + '"><td style="padding:0 6px;font-size:10.5px;white-space:nowrap;color:var(--se-fg);border:' + grid + ';"><span class="dsmn">' + escText(String(i + 1)) + "</span> " + escText(short(a)) + " " + pick
        + '</td><td class="dsmcl" style="' + hdr + 'color:var(--se-accent);text-align:center;">' + escText(lbl(cl[a] || "")) + "</td>" + cells + "</tr>";
    }).join("");
    // THE CLUSTER LIST IS THE NAMING TABLE. One field, not two: a row per
    // cluster, carrying the jump, the name and the coupling. Splitting them
    // meant scrolling between a group and the box you name it in.
    const btn = "display:block;width:100%;text-align:left;padding:3px 7px;margin-bottom:3px;border:1px solid var(--se-border);border-radius:4px;background:transparent;color:var(--se-fg);font:inherit;font-size:11px;cursor:pointer;";
    const jump = "padding:1px 6px;border:1px solid var(--se-border);border-radius:4px;background:transparent;color:var(--se-fg);font:inherit;font-size:10.5px;cursor:pointer;";
    const box = "width:100%;box-sizing:border-box;background:transparent;border:0;outline:none;font:inherit;font-size:11.5px;color:var(--se-fg);padding:0 4px;";
    // THE ROWS MATCH THE MATRIX'S HEIGHT AND ITS PAGE, so the panel never runs
    // taller than the thing it sits beside.
    const crow = "height:16px;border:" + grid + ";padding:0 2px;";
    const couplings = args.options || [];
    const list = groups.length === 0
      ? '<div style="font-size:11px;color:var(--se-muted);">no clusters yet</div>'
      : '<table style="border-collapse:collapse;width:100%;">'
        + '<tr><th style="' + hdr + '"></th><th style="' + hdr + '">name</th><th style="' + hdr + '">coupling</th><th style="' + hdr + '"><button class="dsmadd" title="add a cluster" style="' + jump + '">+</button></th></tr>'
        + groups.map(function (c, k) {
          const first = order.findIndex(function (id) { return cl[id] === c; });
          const n = order.filter(function (id) { return cl[id] === c; }).length;
          const fx = (facts || {})[c] || {};
          const sel = '<select class="sfnt" style="' + box + '" data-field="' + name + '" data-item="' + escText(c) + '" data-col="coupling">'
            + ['<option value="">—</option>'].concat(couplings.map(function (v) {
              return '<option value="' + escText(v) + '"' + (fx.coupling === v ? " selected" : "") + ">" + escText(v) + "</option>";
            })).join("") + "</select>";
          return '<tr class="dsmg" data-g="' + k + '" data-c="' + escText(c) + '" style="' + off(k) + '">'
            + '<td style="' + crow + 'white-space:nowrap;"><button class="dsmgo" data-at="' + first + '" style="' + jump + '">' + escText(lbl(c)) + '</button> <span style="color:var(--se-muted);font-size:10px;">' + n + "</span></td>"
            + '<td style="' + crow + '"><input class="sfnt" style="' + box + '" data-field="' + name + '" data-item="' + escText(c) + '" data-col="name" value="' + escText(fx.name || "") + '" placeholder="name it"></td>'
            + '<td style="' + crow + '">' + sel + '</td>'
            + '<td style="' + crow + '"><button class="dsmdel" data-c="' + escText(c) + '" title="remove this cluster — its functions go unclustered" style="' + jump + '">−</button></td></tr>';
        }).join("") + "</table>";
    const nav = function (kind) {
      const total = kind === "g" ? groups.length : order.length;
      return '<button class="dsmpg" data-kind="' + kind + '" data-step="-1" style="' + btn + 'display:inline-block;width:auto;margin:0 2px 0 0;">‹</button>'
        + '<span class="dsmat" data-kind="' + kind + '" style="font-size:10.5px;color:var(--se-muted);">1-' + Math.min(total, size) + " of " + total + "</span>"
        + '<button class="dsmpg" data-kind="' + kind + '" data-step="1" style="' + btn + 'display:inline-block;width:auto;margin:0 0 0 2px;">›</button>';
    };
    const sizer = '<select class="dsmsize" style="background:transparent;border:1px solid var(--se-border);border-radius:4px;color:var(--se-fg);font:inherit;font-size:10.5px;margin-left:8px;">'
      + [5, 10, 20, 50].map(function (n) { return '<option value="' + n + '"' + (n === size ? " selected" : "") + ">" + n + " per page</option>"; }).join("") + "</select>";
    // ROWS AND COLUMNS PAGE INDEPENDENTLY. A square window would hide exactly
    // the off-diagonal marks that say two distant functions are coupled.
    // SORT REORDERS BY THE CURRENT ASSIGNMENT. It is not a re-run of the
    // search — it puts the blocks back on the diagonal after you have moved
    // things by hand, which is when the picture stops being readable.
    const sortBtn = '<button class="dsmsort" title="reorder the rows so the clusters are contiguous again" style="' + jump + 'margin-left:8px;">sort</button>';
    const bar = '<div style="font-size:10.5px;color:var(--se-muted);padding:4px 0;">rows ' + nav("r") + " &nbsp; cols " + nav("c") + " &nbsp; clusters " + nav("g") + sizer + sortBtn + "</div>";
    return '<div class="dsmwrap" data-size="' + size + '" data-n="' + order.length + '" data-g="' + groups.length + '" data-rp="0" data-cp="0" data-gp="0">'
      + bar
      + '<div style="display:flex;gap:12px;align-items:flex-start;">'
      + '<div style="overflow-x:auto;"><table style="border-collapse:collapse;">' + head + rows + "</table></div>"
      + '<div style="min-width:230px;"><div style="font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:var(--se-muted);padding-bottom:4px;">clusters</div>' + list + "</div>"
      + "</div></div>";
  `,
  collect: "",
};
