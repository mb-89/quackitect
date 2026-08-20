// A LIST — one row per line, growing by a trailing blank.
//
// A REFERENCE IS AN ADDRESS, so it opens. Reading a reference list meant
// reading ids and then going to find the files they name by hand, which is
// exactly the work the reference was supposed to save.
import type { EditorKind } from "./kinds.ts";

export const LIST_EDITOR: EditorKind = {
  id: "list",
  render: `
    // The SAME reduction the engine does: a path, a file name, an id or a
    // wiki link all name one node, so all four get their open link.
    const refId = function (v) {
      const bare = String(v || "").trim().replace(/^\\[\\[/, "").replace(/\\]\\]$/, "").trim();
      const target = (bare.split("|")[0] || "").trim();
      const last = target.replace(/\\\\/g, "/").split("/").filter(Boolean).pop() || "";
      return last.replace(/\\.md$/i, "").trim();
    };
    const link = function (v) {
      const p = tm.resolves === "artifact" && paths ? paths[refId(v)] : null;
      return p ? '<a class="reflink" data-path="' + escText(p) + '" title="open ' + escText(p) + ' in the editor">open</a>' : "";
    };
    return '<div class="sfrows">' + sfDash(fl.content).concat([""]).map(function (v) { return '<div class="sfrow"><input class="sfli" data-field="' + name + '" placeholder="' + ph + '" value="' + escText(v) + '">' + link(v) + sfRowBtns() + "</div>"; }).join("") + "</div>";
  `,
  collect: `
  document.querySelectorAll(".sfli").forEach(function (t) { if (t.value.trim() !== "") push(t.dataset.field, "- " + t.value.trim()); });
  `,
};
