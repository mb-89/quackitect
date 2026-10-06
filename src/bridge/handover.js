// The opening prompt of the conversation level zero clears at context.handoverAt.
// [[spec/design_output/stop#the-context-hands-over]]

import { READ } from "../scripts/ephemeral.js";

const AT = "context.handoverAt";

// What the next conversation reads first, as its opening prompt. [[spec/design_output/stop#the-context-hands-over]]
export const RESUME = [
  "Level zero cleared the conversation, because the context passed",
  `\`${AT}\`. Run \`./RUNME.sh ticket pull\`: \`${READ}\` stands in your hand,`,
  "and the handover block says where the work stands.",
].join(" ");
