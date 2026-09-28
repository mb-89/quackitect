// The cloud ask door. Nobody sits beside a cloud box, so a question in the
// chat meets nobody, and the door sends it to a question ticket instead.
// [[spec/design_output/level0#the-cloud-ask-door]]

import { cloudHere } from "../../.claude/skills/level0/lib/cloud.js";

const ASK = "AskUserQuestion";

export const ASKS_NOBODY = [
  "Nobody sits beside this cloud box, so a question in the chat meets nobody.",
  "Where you can decide, decide, and say what you weigh and assume.",
  "Where a person alone can, mint a ticket on the person route:",
  "`./RUNME.sh mint ticket spec/tickets/<name>.md --process=person`.",
  "Write every command they need into its ask, push it, and go on with the branch.",
  "Rule 7 of spec/guidance/cloud/cloud says why.",
].join(" ");

// [[spec/design_output/level0#the-cloud-ask-door]]
export function holdsCloudAsk(e, box) {
  if (String(e?.tool ?? "") !== ASK || !cloudHere(box)) return null;
  box.log.say("debug", "gate", "refused AskUserQuestion on a cloud box", { tool: ASK });
  return { result: { deny: ASKS_NOBODY } };
}
