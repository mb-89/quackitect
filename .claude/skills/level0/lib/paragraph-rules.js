// The rules the paragraph schema projects, over a sentence and over a table.
// The schema hands the values in, and each rule file carries its head alone.
// [[spec/design_output/projection#a-layer-writes-two-files]]

import { scripted } from "./snippets.js";

// [[spec/design_output/projection#a-layer-writes-two-files]]
export function codeSpans(layer) {
  const most = Number(layer.codeSpans);
  return scripted(`A sentence holds ${most} code spans.`);
}

// A paragraph beside a table says again what a cell of it holds, and the two drift apart. [[spec/design_output/lsp#a-second-copy-draws]]
export function restatedTable() {
  return scripted("A paragraph says again what a cell of the table beside it holds.");
}
