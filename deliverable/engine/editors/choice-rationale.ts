// A DROPDOWN AND ITS REASON, stored as one line: `<option> — <rationale>`.
//
// The options are the FIELD's argument. `passing` names which let the form
// stand; `rationale_for` names which owe an explanation. They are separate
// questions — a skip can be entirely legitimate and still owe its reason.
import type { EditorKind } from "./kinds.ts";

export const CHOICE_RATIONALE_EDITOR: EditorKind = {
  id: "choice-rationale",
  render: `
    const first = ((fl.content || "").split("\\n")[0] || "").trim();
    const sep = first.indexOf(" — ");
    const chosen = sep < 0 ? first : first.slice(0, sep).trim();
    const rat = sep < 0 ? "" : first.slice(sep + 3).trim();
    // THE PLACEHOLDER SAYS WHO OWES ONE. A field where only some options owe
    // a reason should not demand one from every reader in its prompt.
    const owed = (args.rationale_for || []);
    const why = owed.length === 0 ? "rationale — why this option" : "rationale — required for " + owed.join(", ");
    return '<div class="sfrows"><div class="sfrow"><select class="sfsel" data-field="' + name + '"><option value=""></option>' + (args.options || []).map(function (o) { return "<option" + (o === chosen ? " selected" : "") + ">" + escText(o) + "</option>"; }).join("") + '</select><input class="sfrat" data-field="' + name + '" placeholder="' + escText(why) + '" value="' + escText(rat) + '"></div></div>';
  `,
  collect: `
  document.querySelectorAll(".sfsel").forEach(function (s) {
    const r = document.querySelector('.sfrat[data-field="' + s.dataset.field + '"]');
    const rv = r ? r.value.trim() : "";
    fields[s.dataset.field] = (s.value + (rv !== "" ? " — " + rv : "")).trim();
  });
  `,
};
