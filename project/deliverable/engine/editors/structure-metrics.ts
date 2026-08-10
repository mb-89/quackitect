// THE STRUCTURE NUMBERS — the evaluation's computed half. The table is drawn
// from the trace on every look; the textarea beneath holds the one typed line
// per number saying what it moved. A number nobody interprets is noise, and
// the row's guidance says so.
import type { EditorKind } from "./kinds.ts";

export const STRUCTURE_METRICS_EDITOR: EditorKind = {
  id: "structure-metrics",
  render: `
    const sm = args.smetrics;
    if (!sm) {
      return '<div class="sfempty" style="color:var(--se-muted);font-style:italic;padding:6px 0;">The structure is not readable \\u2014 no numbers to draw.</div>';
    }
    const cell = "padding:4px 8px;border-bottom:1px solid var(--se-border);font-size:12px;color:var(--se-fg);text-align:left;vertical-align:top;";
    const rows = sm.map(function (r) {
      const detail = r.detail !== "" ? '<div style="font-size:11px;color:var(--se-muted);margin-top:2px;line-height:1.4;">' + escText(r.detail) + "</div>" : "";
      return '<tr><td style="' + cell + 'white-space:nowrap;">' + escText(r.name) + '</td><td style="' + cell + 'font-variant-numeric:tabular-nums;">' + r.value + '</td><td style="' + cell + '">' + detail + "</td></tr>";
    }).join("");
    const head = '<tr><th style="' + cell + 'font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--se-muted);">number</th><th style="' + cell + 'font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--se-muted);">value</th><th style="' + cell + 'font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--se-muted);">behind it</th></tr>';
    const table = '<table style="border-collapse:collapse;width:100%;margin:4px 0;">' + head + rows + "</table>";
    const note = '<div style="font-size:11px;color:var(--se-muted);padding:2px 0;">One line per number \\u2014 what it moved. A number that moved nothing says so.</div>';
    const box = '<textarea class="sfsmx" data-field="' + name + '" style="width:100%;min-height:90px;background:transparent;color:inherit;border:1px solid var(--se-border);border-radius:4px;font:inherit;font-size:12px;padding:6px;" placeholder="- interface debt \\u2014 what the number moved">' + escText(fl.content || "") + "</textarea>";
    return '<div class="sfsmwrap">' + table + note + box + "</div>";
  `,
  collect: `
  document.querySelectorAll(".sfsmx").forEach(function (t) { t.value.split("\\n").forEach(function (l) { if (l.trim() !== "") push(t.dataset.field, l); }); });
  `,
};
