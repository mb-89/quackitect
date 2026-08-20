// THE DECISION MATRIX, DRAWN. The convergence runs are arithmetic over the
// standing scores and the standing cut order, so this editor takes no input
// at all — it is a READING. What a person writes at the state is the winner's
// why and the veto, and both live in the winner field, not here.
//
// The shape is the classic vendor-selection sheet: criteria down the side
// with their damage grade, the datum column of zeros, one signed column per
// rival, the totals under them, the leader marked. The runs strip above the
// table says how the datum seat moved.
//
// NO BACKTICK IN THE BODY. It is one template literal and a backtick ends it.
import type { EditorKind } from "./kinds.ts";

export const DECISION_MATRIX_EDITOR: EditorKind = {
  id: "decision-matrix",
  render: `
    const mv = args.matrix;
    if (!mv || mv.runs.length === 0) {
      const why = mv && mv.problems.length > 0 ? mv.problems.join("; ") : "the scores and the cut order have not both landed yet";
      return '<div class="sfempty" style="color:var(--se-muted);font-style:italic;padding:6px 0;">Nothing to converge \\u2014 ' + why + '.</div>';
    }
    const esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); };
    const short = function (id) { return esc(String(id).replace(/^req-/, "").replace(/^cand-/, "").replace(/-/g, " ")); };
    // EVERY ID IS A DOOR. The headers are candidates and the criterion rows
    // are requirements; a reader checking the matrix wants the note, so the
    // label links it wherever the record knows its path.
    const link = function (id, label) {
      const p = paths ? paths[id] : null;
      if (!p) return label;
      return '<a class="reflink" data-path="' + esc(p) + '" title="open ' + esc(id) + ' in the editor" style="color:inherit;cursor:pointer;text-decoration:underline dotted;">' + label + "</a>";
    };
    const last = mv.runs[mv.runs.length - 1];
    const rivals = mv.candidates.filter(function (c) { return c !== last.datum; });
    const cellStyle = function (s) {
      if (s > 0) return "background:color-mix(in srgb, var(--se-ok) 22%, transparent);";
      if (s < 0) return "background:color-mix(in srgb, var(--se-fail) 18%, transparent);";
      return "";
    };
    const td = "padding:3px 8px;border:1px solid var(--se-border);text-align:center;";
    const th = td + "color:var(--se-muted);font-weight:600;";
    const rows = [];
    rows.push('<tr><th style="' + th + 'text-align:left;">criterion</th><th style="' + th + '">grade</th><th style="' + th + '">' + link(last.datum, short(last.datum)) + '<div style="font-weight:400;">datum</div></th>' + rivals.map(function (r) { return '<th style="' + th + '">' + link(r, short(r)) + "</th>"; }).join("") + "</tr>");
    mv.axes.forEach(function (a) {
      const cells = rivals.map(function (r) {
        const s = (last.cells[r] || {})[a.id];
        const v = s === undefined ? "" : s > 0 ? "+1" : s < 0 ? "\\u22121" : "0";
        return '<td style="' + td + cellStyle(s || 0) + '">' + v + "</td>";
      }).join("");
      rows.push('<tr><td style="' + td + 'text-align:left;" title="' + esc(a.id) + '">' + link(a.id, short(a.id)) + '</td><td style="' + td + 'color:var(--se-muted);">' + esc(a.grade) + "</td><td style=\\"" + td + '">0</td>' + cells + "</tr>");
    });
    const winnerMark = function (c) { return c === mv.winner ? " \\u2713" : ""; };
    rows.push('<tr><td style="' + td + 'text-align:left;font-weight:600;">total</td><td style="' + td + '"></td><td style="' + td + 'font-weight:600;">0' + winnerMark(last.datum) + "</td>" + rivals.map(function (r) { return '<td style="' + td + 'font-weight:600;">' + (last.totals[r] > 0 ? "+" : "") + last.totals[r] + winnerMark(r) + "</td>"; }).join("") + "</tr>");
    const meta = "font-size:11px;color:var(--se-muted);padding:4px 0;";
    const trail = mv.runs.map(function (r, i) { return "run " + (i + 1) + ": datum " + short(r.datum) + " \\u2192 leader " + short(r.leader); }).join(" \\u00b7 ");
    const verdict = mv.stable
      ? link(mv.winner, short(mv.winner)) + " holds the datum seat \\u2014 the computed winner. The veto is withholding the submit; anything beyond the arithmetic goes to follow_up and the deciding ADRs."
      : "no datum holds the lead \\u2014 the convergence cycles, and that is a finding.";
    const warn = mv.problems.length > 0 ? '<div style="' + meta + 'color:var(--se-accent);">' + mv.problems.map(function (p) { return "<div>" + esc(p) + "</div>"; }).join("") + "</div>" : "";
    const grades = "grades are the damage scale off each requirement; totals are plain sign counts \\u2014 no band value is typed yet, so nothing here is weighted by an invented number.";
    return '<div style="overflow-x:auto;"><table style="border-collapse:collapse;font-size:12px;">' + rows.join("") + "</table></div>"
      + '<div style="' + meta + '">' + trail + "</div>"
      + '<div style="' + meta + '">' + verdict + "</div>"
      + '<div style="' + meta + '">' + grades + "</div>"
      + warn;
  `,
  // A READING STORES NOTHING — the runs would drift from the scores the
  // moment one number moved, and the gate recomputes for the same reason
  // the pareto front does.
  collect: "",
};
