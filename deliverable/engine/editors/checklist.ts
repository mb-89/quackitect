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
//
// A REFERENCE IS A LINK, NEVER TEXT (owner ruling 2026-08-23). An item ending
// in a bracketed path renders that path as a clickable link, in the same
// `doclink` shape the mirror already uses everywhere else.
//
// THE RULE IS GENERAL AND THIS IS ONE PLACE IT LANDS. Wherever a surface holds
// a path, an id or a URL, it is rendered as something a reader can follow. A
// path printed as plain text asks the reader to go and find it by hand, which
// is a worse version of a job the page could have done.
//
// THE LINK SITS OUTSIDE THE LABEL, on purpose. A link inside a `<label>` toggles
// the checkbox when clicked, so following a reference would silently tick the
// box it was explaining.
//
// `data-item` KEEPS THE WHOLE ORIGINAL LINE, including the bracketed path, so
// what the collector writes back is byte-identical to the catalog's own item.
// Only the DISPLAY splits.
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
        const ref = /(([^()\\s]+\\.[A-Za-z0-9]+))\\s*$/.exec(it);
        const label = ref ? it.slice(0, ref.index).trim() : it;
        const link = ref ? ' <a class="doclink" data-path="' + escText(ref[1]) + '">' + escText(ref[1]) + "</a>" : "";
        return '<div class="sfrow"><label class="sfck"><input type="checkbox" class="sfckbox" data-field="' + name + '" data-item="' + escText(it) + '"' + mark + (done ? " checked" : "") + '> <span>' + escText(label) + "</span>" + tail + "</label>" + link + "</div>";
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
