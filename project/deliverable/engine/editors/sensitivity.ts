// THE WINNER'S FRAGILE GROUND, DRAWN — AND RULED WITH A BUTTON. The
// perturbation hunt is arithmetic: per rival, how far it sits below the
// winner, and which cells a single one-point score move would raise.
//
// ONLY A REACHABLE FLIP IS SHOWN IN FULL (owner ruling 2026-08-10): a rival
// needing more than three swings is named on one line and not tabled —
// nobody rules on a seven-swing story. Nothing is silently dropped; the
// line says what was left out and why.
//
// THE RULING IS A CLICK. Marking a cell credible arms it; SAVE writes the
// ruling lines and the engine mints a RAID tripwire per new one, rewriting
// the line with the minted ref (session.stateFormSave). REVERT re-renders
// from disk and the unsaved clicks fall away. A standing ruling renders as
// its tripwire link instead of a button.
//
// NO BACKTICK IN ANY BODY. Each is one template literal and a backtick ends
// it.
import type { EditorKind } from "./kinds.ts";

export const SENSITIVITY_EDITOR: EditorKind = {
  id: "sensitivity",
  render: `
    const sv = args.sensitivity;
    if (!sv || sv.winner === "") {
      const why = sv && sv.problems.length > 0 ? sv.problems.join("; ") : "no stable winner stands yet";
      return '<div class="sfempty" style="color:var(--se-muted);font-style:italic;padding:6px 0;">Nothing to stress \\u2014 ' + why + '.</div>';
    }
    const esc = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;"); };
    const short = function (id) { return esc(String(id).replace(/^req-/, "").replace(/^cand-/, "").replace(/-/g, " ")); };
    const link = function (id, label) {
      const p = paths ? paths[id] : null;
      if (!p) return label;
      return '<a class="reflink" data-path="' + esc(p) + '" title="open ' + esc(id) + ' in the editor" style="color:inherit;cursor:pointer;text-decoration:underline dotted;">' + label + "</a>";
    };
    // THE STANDING RULINGS, read back off the section so a save survives a
    // redraw. A minted line carries its raid ref first.
    const existing = String(fl.content || "").split("\\n").map(function (l) { return l.trim(); }).filter(function (l) { return l.indexOf("- ") === 0; });
    const ruledRef = function (rival, axis) {
      for (let i = 0; i < existing.length; i++) {
        const l = existing[i];
        if (l.indexOf("[[" + rival + "]]") >= 0 && l.indexOf("[[" + axis + "]]") >= 0) {
          const m = l.match(/\\[\\[(raid-[^\\]]+)\\]\\]/);
          return m ? m[1] : "pending";
        }
      }
      return "";
    };
    const meta = "font-size:11px;color:var(--se-muted);padding:4px 0;";
    const td = "padding:3px 8px;border:1px solid var(--se-border);";
    const blocks = [];
    const skipped = [];
    sv.rivals.forEach(function (r) {
      const need = r.deficit + 1;
      if (need > 3) {
        skipped.push(link(r.id, short(r.id)) + " needs " + need + " swings \\u2014 out of reach by single points, not tabled");
        return;
      }
      const head = link(r.id, short(r.id)) + " sits " + r.deficit + " sign" + (r.deficit === 1 ? "" : "s") + " below " + link(sv.winner, short(sv.winner)) + " \\u2014 " + need + " swing" + (need === 1 ? "" : "s") + " flip" + (need === 1 ? "s" : "") + " it";
      const rows = r.swings.map(function (c) {
        const ref = ruledRef(r.id, c.axis);
        const line = "- credible: [[" + r.id + "]] over [[" + sv.winner + "]] on [[" + c.axis + "]]";
        const ruling = ref === "" ?
          '<button type="button" class="sfsensbtn" data-line="' + esc(line) + '" aria-pressed="false" style="font:inherit;font-size:11px;padding:1px 8px;border:1px solid var(--se-border);border-radius:3px;background:transparent;color:var(--se-fg);cursor:pointer;">credible</button>'
          : ref === "pending" ? '<span style="color:var(--se-muted);">ruled \\u2014 save pending</span>' : link(ref, "tripwire");
        return "<tr><td style=\\"" + td + '">' + link(c.axis, short(c.axis)) + '</td><td style="' + td + 'text-align:center;">' + link(sv.winner, short(sv.winner)) + " " + c.winner_score + " vs " + link(r.id, short(r.id)) + " " + c.rival_score + '</td><td style="' + td + '">' + ruling + "</td></tr>";
      }).join("");
      blocks.push('<details open style="margin:4px 0;"><summary style="' + meta + 'cursor:pointer;">' + head + "</summary>"
        + '<div style="overflow-x:auto;"><table style="border-collapse:collapse;font-size:12px;"><tr><th style="' + td + 'color:var(--se-muted);">cell</th><th style="' + td + 'color:var(--se-muted);">winner vs rival</th><th style="' + td + 'color:var(--se-muted);">ruling</th></tr>' + rows + "</table></div></details>");
    });
    const warn = sv.problems.length > 0 ? '<div style="' + meta + 'color:var(--se-accent);">' + sv.problems.map(function (p) { return "<div>" + esc(p) + "</div>"; }).join("") + "</div>" : "";
    const skippedHtml = skipped.length > 0 ? '<div style="' + meta + '">' + skipped.join(" \\u00b7 ") + "</div>" : "";
    return '<div class="sfsens" data-field="' + esc(name) + '" data-existing="' + esc(JSON.stringify(existing)) + '">'
      + '<div style="' + meta + '">The computed ground under ' + link(sv.winner, short(sv.winner)) + ". Mark a cell credible and save \\u2014 each ruling mints a RAID tripwire. Revert clears unsaved marks.</div>"
      + blocks.join("") + skippedHtml + warn + "</div>";
  `,
  collect: `
  // THE RULINGS SERIALISE: the standing lines survive verbatim, and every
  // armed button appends its line. The engine mints on save and rewrites
  // the new lines with their raid refs, so the next render shows links.
  document.querySelectorAll(".sfsens").forEach(function (box) {
    const f = box.dataset.field;
    if (!f) return;
    let lines = [];
    try { lines = JSON.parse(box.dataset.existing || "[]"); } catch (e) { lines = []; }
    box.querySelectorAll('.sfsensbtn[aria-pressed="true"]').forEach(function (b) { lines.push(b.dataset.line); });
    fields[f] = lines.join("\\n");
  });
  `,
  behaviour: `
  // A CLICK ARMS A RULING; a second click disarms it. Bound to document so
  // it survives every re-render, matched with closest like the row buttons.
  document.addEventListener("click", function (ev) {
    const b = ev.target && ev.target.closest ? ev.target.closest(".sfsensbtn") : null;
    if (!b) return;
    const armed = b.getAttribute("aria-pressed") === "true";
    b.setAttribute("aria-pressed", armed ? "false" : "true");
    b.style.background = armed ? "transparent" : "color-mix(in srgb, var(--se-ok) 30%, transparent)";
    b.textContent = armed ? "credible" : "credible \\u2713";
  });
  `,
};
