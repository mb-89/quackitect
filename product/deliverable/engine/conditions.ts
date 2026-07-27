// Condition TYPES. A type is two things, and both must exist:
//   - a NOTE in machines/conditions/<type>.md — the human/agent-facing
//     definition (what the condition wants, how to satisfy it)
//   - an ENGINE evaluator — listed here
// The compiler refuses a condition key missing either one. The note's path
// is served with every refusal and rendered as the key's link in the
// mirror, so "what does this condition want" is always one click away.
import { join } from "node:path";

export const CONDITION_TYPES: ReadonlySet<string> = new Set(["read", "script", "evidence_form"]);

export function conditionNotePath(type: string): string {
  return ["product", "deliverable", "machines", "conditions", `${type}.md`].join("/");
}

export function conditionNoteAbs(root: string, type: string): string {
  return join(root, "product", "deliverable", "machines", "conditions", `${type}.md`);
}
