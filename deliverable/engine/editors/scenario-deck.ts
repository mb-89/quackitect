// see dsp-form-editors.md#the-scenario-deck
import { CARD_PARTS } from "../card-parts.ts";
import type { EditorKind } from "./kinds.ts";

export const SCENARIO_DECK_EDITOR: EditorKind = {
  id: "scenario-deck",
  render: `
${CARD_PARTS}
    const sd = args.scenario;
    if (!sd || sd.cards.length === 0) {
      return '<div class="sfempty" style="color:var(--se-muted);font-style:italic;padding:6px 0;">No quality requirements stand in the trace \\u2014 the deck is empty.</div>';
    }
    const shortName = function (id) { return escText(String(id).replace(/^(req|el|if|fn|raid)-/, "").replace(/-/g, " ")); };
    const link = function (id) {
      const p = paths ? paths[id] : null;
      if (!p) return shortName(id);
      return '<a class="reflink" data-path="' + escText(p) + '" title="open ' + escText(id) + '" style="color:inherit;cursor:pointer;text-decoration:underline dotted;">' + shortName(id) + "</a>";
    };
    // THE STORED VERDICTS, read off the section: a ruled scenario leaves the
    // deck and shows in the ledger with its ids drawn as links.
    const lines = String(fl.content || "").split("\\n").map(function (l) { return l.trim(); }).filter(function (l) { return l.indexOf("- ") === 0; });
    const ruled = function (req) {
      for (let i = 0; i < lines.length; i++) if (lines[i].indexOf("[[" + req + "]]") >= 0) return lines[i];
      return "";
    };
    const linkify = function (line) { return line.replace(/\\[\\[([^\\]]+)\\]\\]/g, function (m, id) { return link(id); }); };
    const meta = "font-size:11px;color:var(--se-muted);padding:4px 0;";
    const pick = "background:transparent;color:inherit;border:1px solid var(--se-border);border-radius:4px;font:inherit;font-size:12px;padding:2px 6px;";
    const mine = sd.cards.filter(function (c) { return ruled(c.requirement) === ""; });
    const ledger = sd.cards.map(function (c) { return ruled(c.requirement); }).filter(Boolean).map(linkify);
    const stack = mine.map(function (c, i) {
      const head = '<div style="' + cardMeta + 'padding:4px 0;">card ' + (i + 1) + " of " + mine.length + " \\u00b7 " + escText(c.grade || "ungraded") + (c.characteristic ? " \\u00b7 " + escText(c.characteristic) : "") + "</div>";
      // Panel one: the scenario. The six-part section rides the card, and the
      // link opens the node where the section is edited.
      const scenTxt = c.scenario && c.scenario.trim() !== "" ? '<div style="margin-top:6px;font-size:11.5px;color:var(--se-muted);white-space:pre-wrap;line-height:1.45;">' + escText(c.scenario.trim()) + "</div>" : '<div style="margin-top:6px;font-size:11.5px;color:var(--se-accent);">no ## Scenario section \\u2014 write it on the node first</div>';
      const fx = (facts || {})[c.requirement] || {};
      const scen = '<div style="' + cardCel + 'flex:1.3;"><div style="' + cardMeta + 'padding-bottom:2px;">the scenario</div><div style="font-size:10.5px;color:var(--se-muted);">' + link(c.requirement) + "</div>" + (fx.statement ? '<div style="margin-top:6px;line-height:1.45;">' + escText(fx.statement) + "</div>" : "") + scenTxt + "</div>";
      // Panel two: the path — what the trace says carries the stimulus.
      const fnsHtml = c.functions.length > 0 ? c.functions.map(link).join("<br>") : '<span style="color:var(--se-muted);">no function satisfies this row</span>';
      const implHtml = c.implementers.length > 0 ? c.implementers.map(link).join("<br>") : '<span style="color:var(--se-accent);">nothing carries this scenario \\u2014 unaddressed is one click away</span>';
      const path = '<div style="' + cardCel + 'flex:1;"><div style="' + cardMeta + 'padding-bottom:2px;">the path</div><div style="font-size:11px;color:var(--se-muted);">functions</div><div style="font-size:12px;line-height:1.5;">' + fnsHtml + '</div><div style="font-size:11px;color:var(--se-muted);margin-top:6px;">elements and interfaces</div><div style="font-size:12px;line-height:1.5;">' + implHtml + "</div></div>";
      // Panel three: the verdict — THREE PARTS SEPARATED BY OR, explainer
      // first in each (owner feedback 2026-08-10). Fitness sits apart below.
      const explain = function (t) { return '<div style="font-size:10.5px;color:var(--se-muted);line-height:1.4;">' + t + "</div>"; };
      const controls = function (inner) { return '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-top:4px;">' + inner + "</div>"; };
      const orBar = '<div style="font-size:12px;font-weight:600;letter-spacing:.2em;color:var(--se-muted);text-align:center;padding:6px 0;">OR</div>';
      const decOpts = sd.decisions.length > 0 ? '<option value="">\\u2014 the decision that makes it hold \\u2014</option>' + sd.decisions.map(function (d) { return '<option value="' + escText(d) + '">' + shortName(d) + "</option>"; }).join("") : '<option value="">no decisions stand in the register</option>';
      const hinges = (c.implementers.length > 0 ? c.implementers : sd.elements);
      const hingeOpts = '<option value="">\\u2014 the hinge element \\u2014</option>' + hinges.map(function (h) { return '<option value="' + escText(h) + '">' + shortName(h) + "</option>"; }).join("");
      const addressed = "<div>" + explain("ADDRESSED \\u2014 yes. The structure on the path delivers the measure; the path is the evidence. Name a decision only where a recorded choice is why it holds.") + controls('<select class="sfscndec" style="' + pick + '"' + (sd.decisions.length === 0 ? " disabled" : "") + ">" + decOpts + '</select><button class="sfscn" style="' + cardBtn + '" data-kind="addressed" data-req="' + escText(c.requirement) + '">addressed</button>') + "</div>";
      const atrisk = "<div>" + explain("AT RISK \\u2014 it holds only while one element holds. Name the hinge ELEMENT and the tradeoff; the click mints a register risk, graded with the requirement.") + controls('<select class="sfscnhinge" style="' + pick + '">' + hingeOpts + '</select><input class="sfscnnote" style="' + pick + 'flex:1;min-width:120px;" placeholder="the tradeoff, one line"><button class="sfscn" style="' + cardBtn + '" data-kind="at-risk" data-req="' + escText(c.requirement) + '">at risk \\u2014 mint risk</button>') + "</div>";
      const unaddr = "<div>" + explain("UNADDRESSED \\u2014 nothing carries this scenario. The click mints a register ISSUE, a standing finding for the gate.") + controls('<button class="sfscn" style="' + cardBtn + '" data-kind="unaddressed" data-req="' + escText(c.requirement) + '">unaddressed \\u2014 mint issue</button>') + "</div>";
      const fitWrap = 'margin-top:10px;padding-top:8px;border-top:1px solid var(--se-border);';
      const fitness = c.fitness
        ? '<div style="' + fitWrap + '">' + explain("flagged as fitness candidate \\u2713 \\u2014 the flag lives on the requirement node") + "</div>"
        : '<div style="' + fitWrap + '">' + explain("FITNESS CANDIDATE \\u2014 not a verdict, a flag on the requirement. The measure could run as an automated check at M7; flagged rows land in fitness_candidates.") + controls('<button class="sfscn" style="' + cardBtn + '" data-kind="fitness" data-req="' + escText(c.requirement) + '">flag as fitness candidate</button>') + "</div>";
      const verdict = '<div style="' + cardCel + 'flex:1.2;"><div style="' + cardMeta + 'padding-bottom:2px;">the verdict</div><div style="font-size:11.5px;line-height:1.4;margin-bottom:4px;">Does the structure, as decided, deliver the response measure?</div>' + addressed + orBar + atrisk + orBar + unaddr + fitness + "</div>";
      const sides = '<div style="display:flex;gap:10px;align-items:stretch;">' + scen + path + verdict + "</div>";
      const nav = function (dir, label) { return '<button class="sfscnnav" style="' + cardBtn + '" type="button" data-dir="' + dir + '" title="browse \\u2014 decides nothing">' + label + "</button>"; };
      return '<div class="sfscncard" style="' + (i === 0 ? "" : "display:none;") + '">' + head + sides + '<div style="display:flex;gap:8px;margin-top:8px;align-items:center;">' + nav("-1", "\\u2190") + nav("1", "\\u2192") + "</div></div>";
    }).join("");
    const intro = '<div style="' + meta + '">The walk, worst grade first: ' + mine.length + " scenario" + (mine.length === 1 ? "" : "s") + " unruled, " + ledger.length + " ruled. A verdict posts at once; at-risk and unaddressed mint their register entry.</div>";
    const ledgerHtml = ledger.length > 0 ? '<div style="' + meta + '">' + ledger.join("<br>") + "</div>" : "";
    const empty = mine.length === 0 ? '<div style="' + meta + '">every scenario is ruled</div>' : "";
    // THE STRUCTURE NUMBERS — information only. Hover a name for what it
    // counts; the list behind a number is one entry per line.
    const sm = args.smetrics;
    let metricsHtml = "";
    if (sm) {
      const cellS = "padding:4px 8px;border-bottom:1px solid var(--se-border);font-size:12px;color:var(--se-fg);text-align:left;vertical-align:top;";
      const thS = cellS + "font-size:11px;letter-spacing:.05em;text-transform:uppercase;color:var(--se-muted);";
      const mrows = sm.map(function (r) {
        const detail = r.detail.length > 0 ? r.detail.map(function (d) { return escText(d); }).join("<br>") : '<span style="color:var(--se-muted);">\\u2014</span>';
        return '<tr><td style="' + cellS + 'white-space:nowrap;"><span title="' + escText(r.help) + '" style="cursor:help;text-decoration:underline dotted;">' + escText(r.name) + '</span></td><td style="' + cellS + 'font-variant-numeric:tabular-nums;">' + r.value + '</td><td style="' + cellS + '">' + detail + "</td></tr>";
      }).join("");
      metricsHtml = '<div style="' + cardMeta + 'padding:10px 0 2px;">the structure numbers \\u2014 information only</div><table style="border-collapse:collapse;width:100%;">' + '<tr><th style="' + thS + '">number</th><th style="' + thS + '">value</th><th style="' + thS + '">behind it</th></tr>' + mrows + '</table><div style="font-size:11px;color:var(--se-muted);padding:2px 0;">Computed on every look; hover a name for what it counts. The target is zero \\u2014 a nonzero number is worked in the deck above, or back at decompose-structure.</div>';
    }
    const warn = sd.problems.length > 0 ? '<div style="' + meta + 'color:var(--se-accent);">' + sd.problems.map(function (p) { return "<div>" + escText(p) + "</div>"; }).join("") + "</div>" : "";
    return '<div class="sfscndeck">' + intro + stack + empty + ledgerHtml + metricsHtml + warn + "</div>";
  `,
  collect: "",
  behaviour: `
  // A VERDICT POSTS AT ONCE, like the flip deck's ruling: the register entry
  // is minted server-side and the redraw deals the next card. The arrows
  // browse without deciding; an unruled scenario returns on the next look.
  document.addEventListener("click", async function (ev) {
    const btn = ev.target && ev.target.closest ? ev.target.closest(".sfscn") : null;
    if (btn) {
      const card = btn.closest(".sfscncard");
      const host = document.querySelector(".saveform");
      const form = host ? host.dataset.form : "";
      const machine = host && host.dataset.machine ? host.dataset.machine : viewedMachine();
      const kind = btn.dataset.kind;
      const body = { name: form, kind: kind, requirement: btn.dataset.req, machine: machine };
      if (kind === "addressed") {
        // The decision ref is OPTIONAL — a scenario can hold by plain
        // construction, with the path as its evidence.
        const dec = card ? card.querySelector(".sfscndec") : null;
        if (dec && dec.value !== "") body.decision = dec.value;
      }
      if (kind === "at-risk") {
        const hin = card ? card.querySelector(".sfscnhinge") : null;
        const note = card ? card.querySelector(".sfscnnote") : null;
        if (!hin || hin.value === "") return;
        body.hinge = hin.value;
        body.note = note && note.value.trim() !== "" ? note.value.trim() : "";
      }
      await formPost("/form/scenario", body);
      showFormAgain(form, machine, btn);
      return;
    }
    const nav = ev.target && ev.target.closest ? ev.target.closest(".sfscnnav") : null;
    if (nav) {
      const deck = nav.closest(".sfscndeck");
      const stack = deck ? Array.prototype.slice.call(deck.querySelectorAll(".sfscncard")) : [];
      if (stack.length < 2) return;
      const at = stack.findIndex(function (c) { return c.style.display !== "none"; });
      const to = (at + (nav.dataset.dir === "1" ? 1 : stack.length - 1)) % stack.length;
      stack[at].style.display = "none";
      stack[to].style.display = "";
    }
  });
  `,
};
