// THE PARETO PICTURE. One vertical axis per criterion, one line per candidate,
// and the two constructed corners drawn over them.
//
// WHY NOT A SCATTER. The classic Pareto drawing is two axes with the front as
// a curve, and it is the picture everybody pictures. It only works for TWO
// objectives. A real criteria set is five or fifteen, and there is no third
// dimension to put them in.
//
// PARALLEL COORDINATES IS THE STANDARD ANSWER: stand the axes side by side and
// draw each candidate as a line across them. It carries any number of axes, a
// trade shows as a crossing, and domination shows as one line sitting weakly
// below another the whole way.
//
// NOTHING HERE IS TYPED. The lines, the front, the eliminations and both
// corners all come from the score table. This editor takes no input at all —
// it is a READING, and the only thing a person writes at this state is what
// the reading means.
//
// THE TWO CORNERS ARE NOT CANDIDATES, so they are drawn as reference lines
// rather than as series: utopia along the top of what anybody reached, nadir
// along the bottom of what SURVIVED. The band between them is how much the
// decision is actually worth.
//
// NO BACKTICK IN ANY BODY BELOW. Each is one template literal and a backtick
// ends it.
import type { EditorKind } from "./kinds.ts";

export const PARETO_PLOT_EDITOR: EditorKind = {
  id: "pareto-plot",
  render: `
    const pv = args.pareto;
    if (!pv || pv.axes.length === 0 || pv.candidates.length === 0) {
      return '<div class="sfempty" style="color:var(--se-muted);font-style:italic;padding:6px 0;">Nothing scored yet. Fill the score table and the front draws itself.</div>';
    }
    const axes = pv.axes;
    const cands = pv.candidates;
    const r = pv.result;
    const onFront = function (id) { return r.front.indexOf(id) >= 0; };
    // GEOMETRY. Axes across, scores up. The 0-5 anchors are absolute, so the
    // scale is fixed at 0-5 rather than fitted to the data — a fitted scale
    // would make a set of poor scores look like a healthy spread.
    const W = Math.max(360, 90 * axes.length);
    const H = 200;
    const padL = 8;
    const padT = 18;
    const padB = 46;
    const step = axes.length > 1 ? (W - padL * 2) / (axes.length - 1) : 0;
    const xAt = function (i) { return padL + i * step; };
    const yAt = function (v) { return padT + (5 - Math.max(0, Math.min(5, v))) * ((H - padT - padB) / 5); };
    const esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); };
    const pen = function (i, n) { return "hsl(" + Math.round((i * 360) / Math.max(1, n)) + " 80% 55%)"; };
    const parts = [];
    // The gridlines are the anchor levels, so a reader can see 3 from 4.
    for (let v = 0; v <= 5; v++) {
      parts.push('<line x1="' + padL + '" y1="' + yAt(v) + '" x2="' + (W - padL) + '" y2="' + yAt(v) + '" stroke="var(--se-border)" stroke-width="0.5"/>');
      parts.push('<text x="0" y="' + (yAt(v) + 3) + '" font-size="9" fill="var(--se-muted)">' + v + "</text>");
    }
    axes.forEach(function (a, i) {
      parts.push('<line x1="' + xAt(i) + '" y1="' + padT + '" x2="' + xAt(i) + '" y2="' + yAt(0) + '" stroke="var(--se-border)"/>');
      const short = a.replace(/^req-/, "").replace(/-/g, " ");
      parts.push('<text x="' + xAt(i) + '" y="' + (H - padB + 14) + '" font-size="9" fill="var(--se-muted)" text-anchor="middle" transform="rotate(28 ' + xAt(i) + " " + (H - padB + 14) + ')">' + esc(short) + "</text>");
    });
    // THE CORNERS FIRST, so the candidate lines sit on top of them.
    const corner = function (vals, colour, dash, label) {
      const pts = axes.map(function (a, i) { return vals[a] === undefined ? null : xAt(i) + "," + yAt(vals[a]); }).filter(Boolean);
      if (pts.length < 2) return;
      parts.push('<polyline points="' + pts.join(" ") + '" fill="none" stroke="' + colour + '" stroke-width="1.5" stroke-dasharray="' + dash + '"/>');
      parts.push('<text x="' + (W - padL) + '" y="' + (yAt(vals[axes[axes.length - 1]] || 0) - 4) + '" font-size="9" fill="' + colour + '" text-anchor="end">' + label + "</text>");
    };
    corner(r.utopia, "var(--se-ok)", "4 3", "utopia");
    corner(r.nadir, "var(--se-fail)", "2 3", "nadir");
    // AN ELIMINATED CANDIDATE STILL SHOWS, faint. The front means nothing
    // without the shape of what it beat.
    const line = function (c, i) {
      const pts = axes.map(function (a, j) { return c.scores[a] === undefined ? null : xAt(j) + "," + yAt(c.scores[a]); }).filter(Boolean);
      if (pts.length === 0) return;
      const kept = onFront(c.id);
      const colour = kept ? pen(r.front.indexOf(c.id), Math.max(1, r.front.length)) : "var(--se-muted)";
      parts.push('<polyline class="sfppline" data-cand="' + esc(c.id) + '" points="' + pts.join(" ") + '" fill="none" stroke="' + colour + '" stroke-width="' + (kept ? 2.5 : 1) + '" opacity="' + (kept ? 1 : 0.35) + '"><title>' + esc(c.id) + (kept ? " (on the front)" : " (eliminated)") + "</title></polyline>");
    };
    cands.forEach(line);
    // see dsp-form-editors.md#readable-at-any-axis-count
    const svg = '<div class="sfppbox" style="resize:vertical;overflow:auto;height:280px;max-width:100%;">'
      + '<svg class="sfpp" viewBox="0 0 ' + W + " " + H + '" style="height:100%;width:auto;overflow:visible;display:block;">' + parts.join("") + "</svg></div>";
    // THE LEGEND IS THE FRONT, in the same colours as its lines.
    const legend = r.front.map(function (id, i) {
      return '<span style="display:inline-flex;align-items:center;gap:4px;margin-right:10px;"><i style="width:10px;height:2px;background:' + pen(i, Math.max(1, r.front.length)) + ';display:inline-block;"></i>' + esc(id) + "</span>";
    }).join("");
    const meta = "font-size:11px;color:var(--se-muted);padding:4px 0;";
    const kills = r.eliminated.map(function (e) {
      return "<li>" + esc(e.id) + " \\u2014 dominated by " + esc(e.by) + (e.lost_on.length > 0 ? ", lost on " + e.lost_on.map(esc).join(", ") : "") + "</li>";
    }).join("");
    // EVERY WARNING THE ARITHMETIC CAN RAISE, said here rather than left for a
    // reader to notice. A front over holes is not a front.
    const warn = [];
    if (r.incomplete.length > 0) {
      warn.push("Not fully scored, so these are not judged against anything: " + r.incomplete.map(function (h) { return esc(h.id) + " (" + h.axes.map(esc).join(", ") + ")"; }).join("; "));
    }
    if (r.flat.length > 0) {
      warn.push("Every candidate scores alike on " + r.flat.map(esc).join(", ") + " \\u2014 either the decision does not turn on it, or a discriminating criterion is missing. Say which in the reading.");
    }
    if (r.front.length === cands.length && cands.length > 1) {
      warn.push("Nothing was eliminated. Every candidate trades against every other, which is a real result and worth saying out loud.");
    }
    const warnHtml = warn.length > 0 ? '<div style="' + meta + 'color:var(--se-accent);">' + warn.map(function (w) { return "<div>" + w + "</div>"; }).join("") + "</div>" : "";
    return svg +
      '<div style="' + meta + '">' + r.front.length + " of " + cands.length + " on the front</div>" +
      '<div style="' + meta + '">' + legend + "</div>" +
      warnHtml +
      (kills !== "" ? '<details style="margin:4px 0;"><summary style="' + meta + 'cursor:pointer;">' + r.eliminated.length + " eliminated</summary><ul style=\\"" + meta + 'margin:0;padding-left:18px;">' + kills + "</ul></details>" : "");
  `,
  // see dsp-form-editors.md#nothing-is-collected
  collect: "",
};
