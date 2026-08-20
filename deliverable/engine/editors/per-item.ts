// ONE ROW PER KNOWN ITEM, labelled. The items are the FIELD's argument, and
// the literal "$inbox" resolves to the live pending notes before it arrives.
//
// The label is not editable on purpose: the set is the question, and a row
// somebody renamed is a question nobody answered.
//
// IT FALLS THROUGH WITH NO ITEMS. A per-item field over an empty source has
// nothing to label, so it becomes a plain text box rather than an empty box
// pretending to be a form. The render source returns only inside the guard;
// falling out of it continues to the next editor.
import type { EditorKind } from "./kinds.ts";

export const PER_ITEM_EDITOR: EditorKind = {
  id: "per-item",
  render: `
    if ((args.items || []).length > 0) {
      return '<div class="sfrows">' + args.items.map(function (it) {
        const pref = "- " + it + ":";
        const hit = (fl.content || "").split("\\n").map(function (l) { return l.trim(); }).filter(function (l) { return l.indexOf(pref) === 0; })[0];
        const ans = hit ? hit.slice(pref.length).trim() : "";
        return '<div class="sfrow"><span class="sfitem">' + escText(it) + '</span><input class="sfpi" data-field="' + name + '" data-item="' + escText(it) + '" placeholder="' + ph + '" value="' + escText(ans) + '"></div>';
      }).join("") + "</div>";
    }
  `,
  collect: `
  document.querySelectorAll(".sfpi").forEach(function (t) { if (t.value.trim() !== "") push(t.dataset.field, "- " + t.dataset.item + ": " + t.value.trim()); });
  `,
};
