// THE EXPOSURE CHART — damage against likelihood, every standing register
// entry a dot (owner design 2026-08-10). Dots are coloured by KIND from the
// palette's register section, with the legend beneath; a picked entry — one
// standing in the list below — wears a red ring. Hover names the entry; a
// click opens it in the editor. The pick list decides; the chart informs.
//
// The rows reuse the list editor's classes on purpose: .sfli rows are
// collected by the list's own collect branch, so this editor stores nothing
// of its own.
import type { EditorKind } from "./kinds.ts";

export const EXPOSURE_PICK_EDITOR: EditorKind = {
  id: "exposure-pick",
  render: `
    const xv = args.exposure;
    if (!xv || xv.damageOrder.length === 0 || xv.likelihoodOrder.length === 0) {
      return '<div class="sfempty" style="color:var(--se-muted);font-style:italic;padding:6px 0;">The register or its scales are unreadable \\u2014 no chart to draw.</div>';
    }
    const refId = function (v) {
      const bare = String(v || "").trim().replace(/^\\[\\[/, "").replace(/\\]\\]$/, "").trim();
      const target = (bare.split("|")[0] || "").trim();
      const last = target.replace(/\\\\/g, "/").split("/").filter(Boolean).pop() || "";
      return last.replace(/\\.md$/i, "").trim();
    };
    // THE PICKED SET comes from the rows below — one source, read here for
    // the rings and stored by the list collect.
    const pickedRows = sfDash(fl.content);
    const picked = {};
    pickedRows.forEach(function (v) { const id = refId(v); if (id !== "") picked[id] = true; });
    const kindFill = function (kind) {
      if (kind === "risk" || kind === "assumption" || kind === "issue" || kind === "dependency" || kind === "decision") return "var(--se-reg-" + kind + ")";
      return "var(--se-muted)";
    };
    const W = 640, H = 300, padL = 88, padB = 34, padT = 10, padR = 16;
    const nx = xv.damageOrder.length, ny = xv.likelihoodOrder.length;
    const cw = (W - padL - padR) / nx, ch = (H - padT - padB) / ny;
    // Worst damage on the RIGHT, most likely on TOP: the hot corner is top
    // right, and the catalogue orders arrive worst-first.
    const cellX = function (damage) { return padL + (nx - 1 - damage) * cw; };
    const cellY = function (likelihood) { return padT + likelihood * ch; };
    // Dots in one cell arrange in a small grid — deterministic, so the
    // drawing holds still across looks.
    const byCell = {};
    xv.items.filter(function (it) { return it.damage >= 0 && it.likelihood >= 0; }).forEach(function (it) {
      const k = it.damage + ":" + it.likelihood;
      (byCell[k] = byCell[k] || []).push(it);
    });
    let dots = "";
    const kindsSeen = {};
    Object.keys(byCell).forEach(function (k) {
      const cell = byCell[k];
      const cols = Math.ceil(Math.sqrt(cell.length));
      const rowsN = Math.ceil(cell.length / cols);
      cell.forEach(function (it, i) {
        kindsSeen[it.kind] = true;
        const gx = i % cols, gy = Math.floor(i / cols);
        const x = cellX(it.damage) + (gx + 1) * (cw / (cols + 1));
        const y = cellY(it.likelihood) + (gy + 1) * (ch / (rowsN + 1));
        const p = paths ? paths[it.id] : null;
        const title = "<title>" + escText(it.id + " (" + it.kind + ") \\u2014 " + it.statement) + "</title>";
        // Enclosure marks the pick: a separate neutral ring with a gap, and
        // the unpicked step back through desaturation.
        if (picked[it.id]) dots += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="9.5" fill="none" stroke="var(--se-reg-pick)" stroke-width="2"/>';
        dots += '<circle class="reflink" ' + (p ? 'data-path="' + escText(p) + '" ' : "") + 'cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="6" fill="' + kindFill(it.kind) + '" fill-opacity="' + (picked[it.id] ? "1" : "0.55") + '" style="cursor:pointer;">' + title + "</circle>";
      });
    });
    let grid = "";
    for (let i = 0; i <= nx; i++) { const gx = padL + i * cw; grid += '<line x1="' + gx + '" y1="' + padT + '" x2="' + gx + '" y2="' + (H - padB) + '" stroke="var(--se-border)" stroke-width="1"/>'; }
    for (let j = 0; j <= ny; j++) { const gy = padT + j * ch; grid += '<line x1="' + padL + '" y1="' + gy + '" x2="' + (W - padR) + '" y2="' + gy + '" stroke="var(--se-border)" stroke-width="1"/>'; }
    let labels = "";
    xv.damageOrder.forEach(function (d, i) { labels += '<text x="' + (cellX(i) + cw / 2) + '" y="' + (H - padB + 16) + '" text-anchor="middle" font-size="11" fill="var(--se-muted)">' + escText(d) + "</text>"; });
    xv.likelihoodOrder.forEach(function (l, j) { labels += '<text x="' + (padL - 8) + '" y="' + (cellY(j) + ch / 2 + 4) + '" text-anchor="end" font-size="11" fill="var(--se-muted)">' + escText(l) + "</text>"; });
    const svg = '<svg viewBox="0 0 ' + W + " " + H + '" style="width:100%;max-width:760px;display:block;">' + grid + labels + dots + "</svg>";
    const meta = "font-size:11px;color:var(--se-muted);padding:4px 0;";
    // THE LEGEND — only the kinds actually on the chart, plus the ring.
    const chip = function (color, label, ring) {
      const dot = '<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:' + (ring ? "transparent" : color) + ";" + (ring ? "border:2px solid var(--se-reg-pick);" : "") + 'vertical-align:middle;margin-right:4px;"></span>';
      return '<span style="margin-right:12px;white-space:nowrap;">' + dot + escText(label) + "</span>";
    };
    let legend = "";
    ["risk", "assumption", "issue", "dependency", "decision"].forEach(function (kind) {
      if (kindsSeen[kind]) legend += chip(kindFill(kind), kind, false);
    });
    legend += chip("", "picked", true);
    const legendHtml = '<div style="' + meta + '">' + legend + "</div>";
    const intro = '<div style="' + meta + '">Every standing register entry, placed by its grades \\u2014 the hot corner is top right. Hover a dot for its name; click it to open the entry. The pick below decides; the chart only informs.</div>';
    const warn = xv.problems.length > 0 ? '<div style="' + meta + 'color:var(--se-accent);">' + xv.problems.map(function (p) { return "<div>" + escText(p) + "</div>"; }).join("") + "</div>" : "";
    const link = function (v) {
      const p2 = paths ? paths[refId(v)] : null;
      return p2 ? '<a class="reflink" data-path="' + escText(p2) + '" title="open ' + escText(p2) + ' in the editor">open</a>' : "";
    };
    const rows = pickedRows.concat([""]).map(function (v) { return '<div class="sfrow"><input class="sfli" data-field="' + name + '" placeholder="' + ph + '" value="' + escText(v) + '">' + link(v) + sfRowBtns() + "</div>"; }).join("");
    return '<div class="sfexpo">' + intro + svg + legendHtml + warn + '<div class="sfrows">' + rows + "</div></div>";
  `,
  collect: "",
};
