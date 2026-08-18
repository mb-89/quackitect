// A KNOWN LIST, CHECKED OFF — one row per item, one checkbox each. The
// items are the FIELD's argument ($claim-specs, $iq_checklist); the label
// is not editable, because the set is the question.
//
// Stored as markdown task lines: `- [x] <item>` checked, `- [ ] <item>`
// not yet, `- [owed] <item> — <ref>` addressed to an open raid entry.
//
// A CHECKBOX CANNOT DRAW THE THIRD MARK, and that is why the owed line is
// carried rather than re-derived. A box has two states and the grammar has
// three, so a collector that rebuilds every line from the box alone deletes
// every owed line the moment anybody opens the form. The line is stashed on
// the element and handed back unchanged.
//
// IT FALLS THROUGH WITH NO ITEMS, like per-item: an empty source becomes a
// plain text box rather than an empty box pretending to be a form.
import type { EditorKind } from "./kinds.ts";

export const CHECKLIST_EDITOR: EditorKind = {
  id: "checklist",
  render: `
    if ((args.items || []).length > 0) {
      const lines = (fl.content || "").split("\\n").map(function (l) { return l.trim(); });
      return '<div class="sfrows">' + args.items.map(function (it) {
        const done = lines.some(function (l) { return l === "- [x] " + it; });
        const owed = lines.filter(function (l) { return l.indexOf("- [owed] " + it + " ") === 0; })[0] || "";
        const mark = owed !== "" ? ' disabled data-owed="' + escText(owed) + '"' : "";
        const tail = owed !== "" ? ' <span class="muted">' + escText(owed.slice(("- [owed] " + it + " ").length)) + "</span>" : "";
        return '<div class="sfrow"><label class="sfck"><input type="checkbox" class="sfckbox" data-field="' + name + '" data-item="' + escText(it) + '"' + mark + (done ? " checked" : "") + '> <span>' + escText(it) + "</span>" + tail + "</label></div>";
      }).join("") + "</div>";
    }
  `,
  collect: `
  document.querySelectorAll(".sfckbox").forEach(function (t) {
    if (t.dataset.owed && !t.checked) { push(t.dataset.field, t.dataset.owed); return; }
    push(t.dataset.field, "- [" + (t.checked ? "x" : " ") + "] " + t.dataset.item);
  });
  `,
};
