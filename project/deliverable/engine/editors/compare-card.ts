// ONE PAIR, TWO BUTTONS. A hundred rows of pairwise cells is a form people
// close; one question is a form people finish. The engine picks which pair and
// never puts one the earlier answers already settled.
//
// The walk lives in engine/compare.ts and is a pure function of the items and
// the recorded answers, so this card stores no position and needs no draft.
// Stopping at pair nine of sixty loses nothing.
//
// IT HAS NO COLLECTOR. Each button posts its own verdict and the page
// re-renders on the next pair, so there is nothing sitting in the DOM waiting
// for a save.
//
// THE PANEL AND THE STYLES ARE SHARED (card-parts.ts) — the sensitivity deck
// draws the same shapes, and one copy serves both.
import { CARD_PARTS } from "../card-parts.ts";
import type { EditorKind } from "./kinds.ts";

export const COMPARE_CARD_EDITOR: EditorKind = {
  id: "compare-card",
  render: `
${CARD_PARTS}
    const st = args.walk || {};
    if (!st.ask) {
      // NOTHING TO ASK HAS TWO CAUSES, and they must not read alike. Every
      // pair genuinely settled is success. An EMPTY SET is a broken source,
      // and it used to render as "every pair settled — 0 answered": wrong,
      // and shaped exactly like being finished.
      const n = Number(st.answered || 0);
      const size = ((st.order || []).length);
      if (size === 0) {
        return '<div style="' + cardMeta + 'color:var(--se-accent);padding:6px 0;">nothing to compare — this field&#39;s item source resolved to an empty set</div>';
      }
      return '<div style="' + cardMeta + 'padding:6px 0;">' + n + " / " + n + " answered — every pair settled</div>";
    }
    const pick = function (v, label) {
      return '<button class="sfcmp" style="' + cardBtn + '" data-field="' + name + '" data-a="' + escText(st.ask.a) + '" data-b="' + escText(st.ask.b) + '" data-verdict="' + escText(v) + '">' + escText(label) + "</button>";
    };
    const isSame = args.relation === "equivalence";
    const buttons = isSame
      ? [pick("=", "same thing"), pick(">", "different")]
      : [pick(">", "← this one"), pick("=", "they match"), pick("<", "that one →")];
    // THE REASON IS OPTIONAL AND RIDES THE SAME LINE. A sentence demanded on
    // every card is a card people stop answering.
    const why = args.reason
      ? '<input class="sfcmpwhy" style="flex:1;min-width:110px;box-sizing:border-box;background:transparent;border:1px solid var(--se-border);border-radius:5px;color:var(--se-fg);font:inherit;font-size:12px;padding:6px 8px;" data-field="' + name + '" placeholder="why (optional)">'
      : "";
    // HOW MANY THERE ARE, AND HOW MANY ARE DONE (owner ruling 2026-08-08).
    //
    // It used to read answered out of answered-plus-ESTIMATE, and the estimate
    // could rise without bound — ninety criteria once showed about five
    // thousand, more than the entire cross product. A denominator that grows
    // while you work reads as the sort having failed.
    //
    // Both numbers here are settled facts. An ordering walk counts the items
    // placed; an equivalence walk counts the pairs answered.
    const done = Number(st.done || 0);
    const total = Number(st.total || 0);
    const answered = Number(st.answered || 0);
    const asked = answered > 0 ? '<span style="opacity:.7;"> · ' + answered + " asked</span>" : "";
    const bar = '<div style="' + cardMeta + 'padding:6px 0;">' + done + " of " + total + " settled" + asked + "</div>";
    const cycles = (st.cycles || []).length > 0
      ? '<div style="' + cardMeta + 'color:var(--se-accent);padding:4px 0;">' + st.cycles.length + " contradiction(s) in your answers — see the form's findings</div>"
      : "";
    return bar + cycles
      + '<div style="display:flex;gap:10px;align-items:stretch;">' + cardSide(st.ask.a) + cardSide(st.ask.b) + "</div>"
      + '<div style="display:flex;gap:8px;margin-top:8px;align-items:center;flex-wrap:wrap;">' + buttons.join("") + why + "</div>";
  `,
  collect: "",
};
