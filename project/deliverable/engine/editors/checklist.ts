// A KNOWN LIST, CHECKED OFF — one row per item, one checkbox each. The
// items are the FIELD's argument ($claim-specs, $iq_checklist); the label
// is not editable, because the set is the question.
//
// Stored as markdown task lines: `- [x] <item>` checked, `- [ ] <item>`
// not yet. The field check demands every box — checking is the deliberate
// act this editor exists to record.
//
// IT FALLS THROUGH WITH NO ITEMS, like per-item: an empty source becomes a
// plain text box rather than an empty box pretending to be a form.
import type { EditorKind } from "./kinds.ts";

export const CHECKLIST_EDITOR: EditorKind = {
  id: "checklist",
  render: `
    if ((args.items || []).length > 0) {
      return '<div class="sfrows">' + args.items.map(function (it) {
        const done = (fl.content || "").split("\\n").some(function (l) { return l.trim() === "- [x] " + it; });
        return '<div class="sfrow"><label class="sfck"><input type="checkbox" class="sfckbox" data-field="' + name + '" data-item="' + escText(it) + '"' + (done ? " checked" : "") + '> <span>' + escText(it) + "</span></label></div>";
      }).join("") + "</div>";
    }
  `,
  collect: `
  document.querySelectorAll(".sfckbox").forEach(function (t) { push(t.dataset.field, "- [" + (t.checked ? "x" : " ") + "] " + t.dataset.item); });
  `,
};
