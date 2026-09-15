// The report tool. A text between calls reaches no hook until the turn ends,
// so the agent answers an ask or a mid-turn prompt by calling this with the
// text, which lands in the log as the reply at once.
// [[spec/design_output/extension#the-ask-is-a-line]]

import { pays } from "./answer.js";

export const REPORT = "report";
export const REPORT_CALL = `mcp__level0__${REPORT}`;

export const SPECS = () => [reportSpec()];
export const TOOLS = { [REPORT_CALL]: reports };

function reportSpec() {
  return {
    name: REPORT,
    description: [
      "Answers the owner between calls: a prompt sent mid-turn, or an ask from the sidebar.",
      "The text lands in the log as your reply at once, and the work goes on.",
      "A short ask takes a line or two. A full ask takes four chapters as headings,",
      "each with text under it: Done, Now, Open, ETA.",
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The reply, as you would write it in the chat.",
        },
      },
      required: ["text"],
    },
  };
}

function reports(e, box) {
  const text = String(e?.text ?? "").trim();
  if (!text) return { result: { result: `${REPORT} takes the text of the reply.` } };
  return { result: { result: pays(box, text) } };
}
