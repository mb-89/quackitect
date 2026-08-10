// THE EDITOR REGISTRY. One file per editor, assembled into the client script
// here, so adding one is adding a file rather than finding a wiring.
//
// WHAT THIS REPLACED. Every editor lived inside render.ts's client-script
// template literal, and its SERIALISER lived in sfCollect four hundred lines
// away. Adding an editor meant finding a wiring that nothing pointed at — and
// `table` was simply never added, so the checker judged the field and the
// mirror abandoned it to a textarea (owner ruling 2026-08-08).
//
// THE ORDER IS THE DISPATCH ORDER. An editor whose render source returns only
// inside a guard falls through to the next branch, and finally to the plain
// textarea at the end of sfEditor. per-item relies on that.

import { CHOICE_RATIONALE_EDITOR } from "./choice-rationale.ts";
import { COMPARE_CARD_EDITOR } from "./compare-card.ts";
import { DECISION_MATRIX_EDITOR } from "./decision-matrix.ts";
import { DSM_EDITOR } from "./dsm.ts";
import { ELEMENT_MATRIX_EDITOR } from "./element-matrix.ts";
import { FINDINGS_EDITOR } from "./findings.ts";
import type { EditorKind } from "./kinds.ts";
import { LIST_EDITOR } from "./list.ts";
import { MORPH_BOX_EDITOR } from "./morph-box.ts";
import { NODE_TABLE_EDITOR } from "./node-table.ts";
import { PARETO_PLOT_EDITOR } from "./pareto-plot.ts";
import { PER_ITEM_EDITOR } from "./per-item.ts";
import { RANK_CUT_EDITOR } from "./rank-cut.ts";
import { SCENARIO_DECK_EDITOR } from "./scenario-deck.ts";
import { SENSITIVITY_EDITOR } from "./sensitivity.ts";
import { TABLE_EDITOR } from "./table.ts";

export type { EditorKind };

/** Every editor, in dispatch order. */
export const EDITORS: EditorKind[] = [
  LIST_EDITOR,
  TABLE_EDITOR,
  DSM_EDITOR,
  COMPARE_CARD_EDITOR,
  NODE_TABLE_EDITOR,
  MORPH_BOX_EDITOR,
  RANK_CUT_EDITOR,
  PARETO_PLOT_EDITOR,
  DECISION_MATRIX_EDITOR,
  SENSITIVITY_EDITOR,
  ELEMENT_MATRIX_EDITOR,
  SCENARIO_DECK_EDITOR,
  PER_ITEM_EDITOR,
  CHOICE_RATIONALE_EDITOR,
  FINDINGS_EDITOR,
];

/** The render branches, ready to interpolate into sfEditor. */
export function editorRenderBranches(): string {
  return EDITORS.map((e) => `  if (tm.editor === ${JSON.stringify(e.id)}) {${e.render}}`).join("\n");
}

/** The one-time wiring, ready to interpolate at the end of the client script.
 *
 *  MOST EDITORS HAVE NONE. A field of text boxes needs no listener of its own;
 *  the save reads the DOM when the person presses save. Only an editor a
 *  person DRAWS on needs to hear about clicks as they happen. */
export function editorBehaviourBlocks(): string {
  return EDITORS.filter((e) => (e.behaviour ?? "").trim() !== "")
    .map((e) => `// ---- ${e.id} ----\n${e.behaviour}`)
    .join("\n");
}

/** The collect branches, ready to interpolate into sfCollect.
 *
 *  NOT EVERY EDITOR HAS ONE. dsm reuses the node-table serialiser because its
 *  cells carry the same class, and compare-card posts each answer as it is
 *  clicked, so neither has anything sitting in the DOM waiting for a save. */
export function editorCollectBranches(): string {
  return EDITORS.filter((e) => e.collect.trim() !== "")
    .map((e) => e.collect)
    .join("\n");
}
