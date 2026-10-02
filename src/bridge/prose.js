// The prose reader. Every veto over Vale's findings enters here, so each door
// reading prose calls this one function.
// [[spec/design_output/level0#the-tense-reader]]

import { answerFindings } from "../../.claude/skills/level0/lib/refuse.js";
import { ALL, answerOf, keptOf } from "../scripts/quack-topic.js";
import { proseFaults } from "./write.js";

export const PROSE = "check_prose";
export const PROSE_CALL = `mcp__level0__${PROSE}`;

export const SPECS = () => [proseSpec()];
export const TOOLS = { [PROSE_CALL]: readsDraft };

// [[spec/design_output/level0#a-note-reads-clean-first]]
function proseSpec() {
  return {
    name: PROSE,
    description: [
      "Reads a draft note through the write door's own rules and answers every",
      "finding at once. It writes nothing. Pass the whole file as the write",
      "would land it, so a table row reads with its header.",
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "where the note lands, so the rules read the kind it is",
        },
        text: {
          type: "string",
          description: "the whole file as the write would land it",
        },
      },
      required: ["path", "text"],
    },
  };
}

// The dispatch unwraps one shape, which every handler beside this one answers. [[spec/design_output/level0#a-note-reads-clean-first]]
export async function readsDraft(ask, box) {
  const where = String(ask?.path ?? "");
  const text = ask?.text;
  if (!where)
    return said("This call names no path, and the rules read the kind a path names.");
  if (typeof text !== "string") {
    return said("This call carries no text, so there is no draft to read.");
  }

  const found = await proseFaults(text, where, box);
  return said(answerFindings(where, { found, band: found.length ? "rewrite" : "" }));
}

const said = (text) => ({ result: { result: text } });

export function readsProse(box, text, found) {
  // The Go vetoes alone answer. [[spec/tickets/go-prose-checks-stand-alone]]
  return withContext(text, answerOf(keptOf(box, text, found, ALL), "prose"));
}

// Each finding with the trimmed line it stands in. [[spec/design_output/level0#the-tense-reader]]
export function withContext(text, found) {
  const lines = String(text ?? "").split("\n");
  return (found ?? []).map((one) => ({
    ...one,
    context: (lines[Number(one.line) - 1] ?? "").trim(),
  }));
}
