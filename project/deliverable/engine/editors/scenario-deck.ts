// THE SCENARIO DECK — ATAM's walk dealt one card at a time (owner ruling
// 2026-08-10). A card shows the SCENARIO (the quality requirement and its
// six-part section), the PATH (the elements and interfaces that carry it) and
// the VERDICT: addressed, at risk, or unaddressed. A verdict posts at once;
// at-risk and unaddressed mint their register entry before the page redraws.
// The fitness button files the scenario in fitness_candidates instead.
//
// The panels and styles ride in from card-parts.ts — one copy, shared with
// the compare card and the flip deck. No backtick in any body.
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
      const scen = '<div style="' + cardCel + 'flex:1.4;"><div style="' + cardMeta + 'padding-bottom:2px;">the scenario</div><div style="font-size:10.5px;color:var(--se-muted);">' + link(c.requirement) + "</div>" + (fx.statement ? '<div style="margin-top:6px;line-height:1.45;">' + escText(fx.statement) + "</div>" : "") + scenTxt + "</div>";
      // Panel two: the path — what the trace says carries the stimulus.
      const fnsHtml = c.functions.length > 0 ? c.functions.map(link).join("<br>") : '<span style="color:var(--se-muted);">no function satisfies this row</span>';
      const implHtml = c.implementers.length > 0 ? c.implementers.map(link).join("<br>") : '<span style="color:var(--se-accent);">nothing carries this scenario \\u2014 unaddressed is one click away</span>';
      const path = '<div style="' + cardCel + 'flex:1;"><div style="' + cardMeta + 'padding-bottom:2px;">the path</div><div style="font-size:11px;color:var(--se-muted);">functions</div><div style="font-size:12px;line-height:1.5;">' + fnsHtml + '</div><div style="font-size:11px;color:var(--se-muted);margin-top:6px;">elements and interfaces</div><div style="font-size:12px;line-height:1.5;">' + implHtml + "</div></div>";
      // Panel three: the verdict. THE QUESTION IS PRINTED, and every button
      // carries its meaning in visible text — a hover title is not enough
      // (owner feedback 2026-08-10: the card must say what to do).
      const hint = function (t) { return '<div style="font-size:10.5px;color:var(--se-muted);line-height:1.35;margin-top:2px;">' + t + "</div>"; };
      const row = function (inner, help) { return '<div style="margin-top:8px;"><div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">' + inner + "</div>" + hint(help) + "</div>"; };
      const decOpts = '<option value="">\\u2014 no single decision, the path is the evidence \\u2014</option>' + sd.decisions.map(function (d) { return '<option value="' + escText(d) + '">' + shortName(d) + "</option>"; }).join("");
      const hinges = (c.implementers.length > 0 ? c.implementers : sd.elements);
      const hingeOpts = '<option value="">\\u2014 the hinge \\u2014</option>' + hinges.map(function (h) { return '<option value="' + escText(h) + '">' + shortName(h) + "</option>"; }).join("");
      const decPick = sd.decisions.length > 0 ? '<select class="sfscndec" style="' + pick + '">' + decOpts + "</select>" : "";
      const addressed = row(decPick + '<button class="sfscn" style="' + cardBtn + '" data-kind="addressed" data-req="' + escText(c.requirement) + '">addressed</button>', "yes \\u2014 the structure on the path delivers the measure. Name a decision only where a recorded choice is why it holds." + (sd.decisions.length === 0 ? " The register holds no decisions yet." : ""));
      const atrisk = row('<select class="sfscnhinge" style="' + pick + '">' + hingeOpts + '</select><input class="sfscnnote" style="' + pick + 'flex:1;min-width:120px;" placeholder="the tradeoff, one line"><button class="sfscn" style="' + cardBtn + '" data-kind="at-risk" data-req="' + escText(c.requirement) + '">at risk \\u2014 mint</button>', "it holds only while the hinge holds \\u2014 the click mints the register risk, graded with the requirement.");
      const unaddr = row('<button class="sfscn" style="' + cardBtn + '" data-kind="unaddressed" data-req="' + escText(c.requirement) + '">unaddressed \\u2014 mint</button>', "nothing carries this scenario \\u2014 the click mints the register issue, a standing finding for the gate.");
      const fit = row('<button class="sfscn" style="' + cardBtn + '" data-kind="fitness" data-req="' + escText(c.requirement) + '">fitness candidate</button>', "the response measure could run as an automated check at M7 \\u2014 files it in fitness_candidates.");
      const verdict = '<div style="' + cardCel + 'flex:1;"><div style="' + cardMeta + 'padding-bottom:2px;">the verdict</div><div style="font-size:11.5px;line-height:1.4;">Does the structure, as decided, deliver the response measure?</div>' + addressed + atrisk + unaddr + fit + "</div>";
      const sides = '<div style="display:flex;gap:10px;align-items:stretch;">' + scen + path + verdict + "</div>";
      const nav = function (dir, label) { return '<button class="sfscnnav" style="' + cardBtn + '" type="button" data-dir="' + dir + '" title="browse \\u2014 decides nothing">' + label + "</button>"; };
      return '<div class="sfscncard" style="' + (i === 0 ? "" : "display:none;") + '">' + head + sides + '<div style="display:flex;gap:8px;margin-top:8px;align-items:center;">' + nav("-1", "\\u2190") + nav("1", "\\u2192") + "</div></div>";
    }).join("");
    const intro = '<div style="' + meta + '">The walk, worst grade first: ' + mine.length + " scenario" + (mine.length === 1 ? "" : "s") + " unruled, " + ledger.length + " ruled. A verdict posts at once; at-risk and unaddressed mint their register entry.</div>";
    const ledgerHtml = ledger.length > 0 ? '<div style="' + meta + '">' + ledger.join("<br>") + "</div>" : "";
    const empty = mine.length === 0 ? '<div style="' + meta + '">every scenario is ruled</div>' : "";
    const warn = sd.problems.length > 0 ? '<div style="' + meta + 'color:var(--se-accent);">' + sd.problems.map(function (p) { return "<div>" + escText(p) + "</div>"; }).join("") + "</div>" : "";
    return '<div class="sfscndeck">' + intro + stack + empty + ledgerHtml + warn + "</div>";
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
