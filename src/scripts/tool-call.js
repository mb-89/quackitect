// A verb as the index tool standing for it, with the words it takes, so a
// hand-out names the call an agent makes next.
// [[spec/tickets/verb-outputs-name-index-tools]]

import { INDEX_TOOL, SERVED } from "../../.claude/skills/level0/lib/index-tools.js";

// The tool a topic's verb stands as, and its words as the args array the tool takes. [[spec/tickets/verb-outputs-name-index-tools]]
export function callOf(topic, verb, args = []) {
  const tool = `${SERVED}${INDEX_TOOL}${topic}_${verb}`;
  return args.length ? `${tool} with args ${JSON.stringify(args)}` : tool;
}
