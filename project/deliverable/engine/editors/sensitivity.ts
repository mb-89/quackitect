// THE WINNER'S FRAGILE GROUND, DRAWN. The perturbation hunt is arithmetic:
// per rival, how far it sits below the winner's zero line, and which cells a
// single one-point score move would raise. This editor takes no input.
//
// WHAT THE STATE STILL ASKS is one ruling per flip — credible or dismissed.
// A credible flip is minted as a RAID tripwire with its fallback and listed
// in the tripwires field; a dismissal carries its reason there. The ruling
// is a judgment, so it is typed, and it is the only thing typed.
//
// NO BACKTICK IN THE BODY. It is one template literal and a backtick ends it.
import type { EditorKind } from "./kinds.ts";

export const SENSITIVITY_EDITOR: EditorKind = {
  id: "sensitivity",
  render: `
    const sv = args.sensitivity;
    if (!sv || sv.winner === "") {
      const why = sv && sv.problems.length > 0 ? sv.problems.join("; ") : "no stable winner stands yet";
      return '<div class="sfempty" style="color:var(--se-muted);font-style:italic;padding:6px 0;">Nothing to stress \\u2014 ' + why + '.</div>';
    }
    const esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); };
    const short = function (id) { return esc(String(id).replace(/^req-/, "").replace(/^cand-/, "").replace(/-/g, " ")); };
    const meta = "font-size:11px;color:var(--se-muted);padding:4px 0;";
    const td = "padding:3px 8px;border:1px solid var(--se-border);";
    const blocks = sv.rivals.map(function (r) {
      const need = r.deficit + 1;
      const enough = r.swings.length >= need;
      const head = short(r.id) + " sits " + r.deficit + " sign" + (r.deficit === 1 ? "" : "s") + " below " + short(sv.winner)
        + " \\u2014 " + r.swings.length + " one-point swing cell" + (r.swings.length === 1 ? "" : "s") + " exist, " + need + " needed to pass"
        + (enough ? "" : " (out of reach by single points)");
      if (r.swings.length === 0) return '<div style="' + meta + '">' + head + "</div>";
      const rows = r.swings.map(function (c) {
        return "<tr><td style=\\"" + td + '" title="' + esc(c.axis) + '">' + short(c.axis) + '</td><td style="' + td + 'text-align:center;">' + c.rival_score + " vs " + c.winner_score + '</td><td style="' + td + 'color:var(--se-muted);">unruled \\u2014 credible mints a tripwire, dismissed carries its reason</td></tr>';
      }).join("");
      return '<details style="margin:4px 0;"' + (enough ? " open" : "") + '><summary style="' + meta + 'cursor:pointer;">' + head + "</summary>"
        + '<div style="overflow-x:auto;"><table style="border-collapse:collapse;font-size:12px;"><tr><th style="' + td + 'color:var(--se-muted);">cell</th><th style="' + td + 'color:var(--se-muted);">rival vs winner</th><th style="' + td + 'color:var(--se-muted);">ruling</th></tr>' + rows + "</table></div></details>";
    }).join("");
    const warn = sv.problems.length > 0 ? '<div style="' + meta + 'color:var(--se-accent);">' + sv.problems.map(function (p) { return "<div>" + esc(p) + "</div>"; }).join("") + "</div>" : "";
    return '<div style="' + meta + '">The computed ground under ' + short(sv.winner) + ". A flip needs enough single-point swings to close a deficit; rule each swing in the tripwires field.</div>" + blocks + warn;
  `,
  collect: "",
};
