// see dsp-form-editors.md#the-flip-deck
import { CARD_PARTS } from "../card-parts.ts";
import type { EditorKind } from "./kinds.ts";

export const SENSITIVITY_EDITOR: EditorKind = {
  id: "sensitivity",
  render: `
${CARD_PARTS}
    const sv = args.sensitivity;
    if (!sv || sv.winner === "") {
      const why = sv && sv.problems.length > 0 ? sv.problems.join("; ") : "no stable winner stands yet";
      return '<div class="sfempty" style="color:var(--se-muted);font-style:italic;padding:6px 0;">Nothing to stress \\u2014 ' + why + '.</div>';
    }
    const shortName = function (id) { return escText(String(id).replace(/^req-/, "").replace(/^cand-/, "").replace(/-/g, " ")); };
    const link = function (id) {
      const p = paths ? paths[id] : null;
      if (!p) return shortName(id);
      return '<a class="reflink" data-path="' + escText(p) + '" title="open ' + escText(id) + '" style="color:inherit;cursor:pointer;text-decoration:underline dotted;">' + shortName(id) + "</a>";
    };
    // THE STANDING RULINGS, read off the section: a ruled cell leaves the
    // deck and shows in the ledger with its tripwire link.
    const lines = String(fl.content || "").split("\\n").map(function (l) { return l.trim(); }).filter(function (l) { return l.indexOf("- ") === 0; });
    const ruledRef = function (rival, axis) {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].indexOf("[[" + rival + "]]") >= 0 && lines[i].indexOf("[[" + axis + "]]") >= 0) {
          const m = lines[i].match(/\\[\\[(raid-[^\\]]+)\\]\\]/);
          return m ? m[1] : "pending";
        }
      }
      return "";
    };
    const cards = [];
    const skipped = [];
    const ledger = [];
    sv.rivals.forEach(function (r) {
      const need = r.deficit + 1;
      if (need > 3) {
        skipped.push(link(r.id) + " needs " + need + " swings \\u2014 out of reach by single points, not asked");
        return;
      }
      r.swings.forEach(function (c) {
        const ref = ruledRef(r.id, c.axis);
        if (ref === "") cards.push({ rival: r.id, axis: c.axis, need: need, deficit: r.deficit });
        else ledger.push(link(r.id) + " over " + link(sv.winner) + " on " + link(c.axis) + (ref === "pending" ? " \\u2014 minting" : " \\u2014 " + link(ref)));
      });
    });
    // ONE DECK PER FLIPPABLE RIVAL: each rival
    // that stands within reach deals its own stack, and the arrows browse a
    // stack without deciding anything.
    const decks = [];
    sv.rivals.forEach(function (r) {
      const mine = cards.filter(function (c) { return c.rival === r.id; });
      if (mine.length === 0) return;
      const groupHead = '<div style="' + cardMeta + 'padding:6px 0 2px;">' + link(r.id) + " sits " + r.deficit + " sign" + (r.deficit === 1 ? "" : "s") + " below " + link(sv.winner) + " \\u00b7 " + (r.deficit + 1) + " swing" + (r.deficit === 0 ? "" : "s") + " flip" + (r.deficit === 0 ? "s" : "") + " it \\u00b7 " + mine.length + " unruled cell" + (mine.length === 1 ? "" : "s") + "</div>";
      const stack = mine.map(function (c, i) {
        const head = '<div style="' + cardMeta + 'padding:4px 0;">card ' + (i + 1) + " of " + mine.length + "</div>";
        const sides = '<div style="display:flex;gap:10px;align-items:stretch;">' + cardSide(c.axis, "cell") + cardSide(sv.winner, "winner") + cardSide(c.rival, "rival") + "</div>";
        const rule = '<button class="sfflip" style="' + cardBtn + '" data-rival="' + escText(c.rival) + '" data-winner="' + escText(sv.winner) + '" data-axis="' + escText(c.axis) + '">rival wins \\u2014 credible</button>';
        const nav = function (dir, label) { return '<button class="sfflipnav" style="' + cardBtn + '" type="button" data-dir="' + dir + '" title="browse \\u2014 decides nothing">' + label + "</button>"; };
        return '<div class="sfflipcard" style="' + (i === 0 ? "" : "display:none;") + '">' + head + sides + '<div style="display:flex;gap:8px;margin-top:8px;align-items:center;">' + nav("-1", "\\u2190") + rule + nav("1", "\\u2192") + "</div></div>";
      }).join("");
      decks.push('<div class="sfflipgroup" style="margin:4px 0 10px;">' + groupHead + stack + "</div>");
    });
    const deck = decks.join("");
    const meta = "font-size:11px;color:var(--se-muted);padding:4px 0;";
    const intro = '<div style="' + meta + '">The computed ground under ' + link(sv.winner) + ": " + cards.length + " unruled cell" + (cards.length === 1 ? "" : "s") + ", " + ledger.length + " ruled. A ruling mints its RAID tripwire at once.</div>";
    const ledgerHtml = ledger.length > 0 ? '<div style="' + meta + '">' + ledger.join("<br>") + "</div>" : "";
    const skippedHtml = skipped.length > 0 ? '<div style="' + meta + '">' + skipped.join(" \\u00b7 ") + "</div>" : "";
    const warn = sv.problems.length > 0 ? '<div style="' + meta + 'color:var(--se-accent);">' + sv.problems.map(function (p) { return "<div>" + escText(p) + "</div>"; }).join("") + "</div>" : "";
    const empty = cards.length === 0 ? '<div style="' + meta + '">every reachable cell is ruled</div>' : "";
    return '<div class="sfflipdeck">' + intro + deck + empty + ledgerHtml + skippedHtml + warn + "</div>";
  `,
  collect: "",
  behaviour: `
  // A RULING POSTS AT ONCE, like the compare card intends: the tripwire is
  // minted server-side and the redraw deals the next card. "stands — next"
  // only advances the deck; an unruled cell returns on the next look.
  document.addEventListener("click", async function (ev) {
    const rule = ev.target && ev.target.closest ? ev.target.closest(".sfflip") : null;
    if (rule) {
      const host = document.querySelector(".saveform");
      const form = host ? host.dataset.form : "";
      const machine = host && host.dataset.machine ? host.dataset.machine : viewedMachine();
      await formPost("/form/flip", { name: form, rival: rule.dataset.rival, winner: rule.dataset.winner, axis: rule.dataset.axis, machine: machine });
      showFormAgain(form, machine, rule);
      return;
    }
    const nav = ev.target && ev.target.closest ? ev.target.closest(".sfflipnav") : null;
    if (nav) {
      // The arrows browse the rival's own stack, wrapping at the ends, and
      // decide nothing.
      const group = nav.closest(".sfflipgroup");
      const stack = group ? Array.prototype.slice.call(group.querySelectorAll(".sfflipcard")) : [];
      if (stack.length < 2) return;
      const at = stack.findIndex(function (c) { return c.style.display !== "none"; });
      const to = (at + (nav.dataset.dir === "1" ? 1 : stack.length - 1)) % stack.length;
      stack[at].style.display = "none";
      stack[to].style.display = "";
    }
  });
  `,
};
