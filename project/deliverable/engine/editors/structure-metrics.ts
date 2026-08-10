// THE STRUCTURE NUMBERS — the evaluation's computed half. The table is drawn
// from the trace on every look. Each name explains itself on hover, the list
// behind a number renders one entry per line, and the interpretation is ONE
// LABELED INPUT PER NUMBER — stored as list lines, never free text (owner
// feedback 2026-08-10).
import type { EditorKind } from "./kinds.ts";

export const STRUCTURE_METRICS_EDITOR: EditorKind = {
  id: "structure-metrics",
  render: `
    const sm = args.smetrics;
    if (!sm) {
      return '<div class="sfempty" style="color:var(--se-muted);font-style:italic;padding:6px 0;">The structure is not readable \\u2014 no numbers to draw.</div>';
    }
    // The stored lines are "- <name> \\u2014 <text>"; each input holds its own
    // text part, so the field round-trips as a list.
    const stored = String(fl.content || "").split("\\n").map(function (l) { return l.trim(); });
    const storedFor = function (metric) {
      const head = "- " + metric + " \\u2014 ";
      for (let i = 0; i < stored.length; i++) if (stored[i].indexOf(head) === 0) return stored[i].slice(head.length);
      return "";
    };
    const cell = "padding:4px 8px;border-bottom:1px solid var(--se-border);font-size:12px;color:var(--se-fg);text-align:left;vertical-align:top;";
    const th = cell + "font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--se-muted);";
    const pick = "background:transparent;color:inherit;border:1px solid var(--se-border);border-radius:4px;font:inherit;font-size:12px;padding:2px 6px;width:100%;box-sizing:border-box;";
    const rows = sm.map(function (r) {
      const detail = r.detail.length > 0 ? '<div style="font-size:11px;color:var(--se-muted);line-height:1.5;">' + r.detail.map(function (d) { return escText(d); }).join("<br>") + "</div>" : '<span style="color:var(--se-muted);">\\u2014</span>';
      const nameCell = '<span title="' + escText(r.help) + '" style="cursor:help;text-decoration:underline dotted;">' + escText(r.name) + "</span>";
      const moved = '<input class="sfsmxl" style="' + pick + '" data-field="' + name + '" data-metric="' + escText(r.name) + '" placeholder="what this number changed \\u2014 or moved nothing" value="' + escText(storedFor(r.name)) + '">';
      return '<tr><td style="' + cell + 'white-space:nowrap;">' + nameCell + '</td><td style="' + cell + 'font-variant-numeric:tabular-nums;">' + r.value + '</td><td style="' + cell + '">' + detail + '</td><td style="' + cell + 'min-width:180px;">' + moved + "</td></tr>";
    }).join("");
    const head = '<tr><th style="' + th + '">number</th><th style="' + th + '">value</th><th style="' + th + '">behind it</th><th style="' + th + '">what it moved</th></tr>';
    const table = '<table style="border-collapse:collapse;width:100%;margin:4px 0;">' + head + rows + "</table>";
    const note = '<div style="font-size:11px;color:var(--se-muted);padding:2px 0;">Hover a name for what it counts. \\u201cWhat it moved\\u201d answers one question \\u2014 did this number change any decision or action? \\u201cmoved nothing\\u201d is a complete answer.</div>';
    return '<div class="sfsmwrap">' + table + note + "</div>";
  `,
  collect: `
  document.querySelectorAll(".sfsmxl").forEach(function (t) { if (t.value.trim() !== "") push(t.dataset.field, "- " + t.dataset.metric + " \\u2014 " + t.value.trim()); });
  `,
};
