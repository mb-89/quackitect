// A FINDING AND ITS ANSWER, as a pair per row: `- <finding> => <answer>`.
//
// The pair is the point. A finding with no answer is an open question wearing
// a record's clothes, so the two boxes sit side by side and neither is
// serialised without the other.
import type { EditorKind } from "./kinds.ts";

export const FINDINGS_EDITOR: EditorKind = {
  id: "findings",
  render: `
    const pairs = sfDash(fl.content).filter(function (l) { return l.indexOf(" => ") >= 0; }).map(function (l) { const i = l.indexOf(" => "); return { f: l.slice(0, i), a: l.slice(i + 4) }; });
    return '<div class="sfrows">' + pairs.concat([{ f: "", a: "" }]).map(function (p) { return '<div class="sfrow"><input class="sfff" data-field="' + name + '" placeholder="finding" value="' + escText(p.f) + '"><span class="meta">=&gt;</span><input class="sffa" data-field="' + name + '" placeholder="answer — fix, rebuttal, or accepted risk" value="' + escText(p.a) + '">' + sfRowBtns() + "</div>"; }).join("") + "</div>";
  `,
  collect: `
  document.querySelectorAll(".sfff").forEach(function (t) {
    const row = t.parentElement;
    const a = row ? row.querySelector(".sffa") : null;
    const av = a ? a.value.trim() : "";
    if (t.value.trim() !== "" || av !== "") push(t.dataset.field, "- " + t.value.trim() + " => " + av);
  });
  `,
};
