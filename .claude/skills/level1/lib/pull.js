// The pull tool's pure half. The spec the tool registers, and the question
// the judge asks over a hand-back, so a test reads both with no harness
// standing. The CLI reads the tool's input into an argv, in pull-tool.js.
// [[spec/design_output/pull#the-checks]]

export const PULL_TOOL = "pull";
export const PULL_CALL = `mcp__level1__${PULL_TOOL}`;
export const LABELS = ["follows", "breaks"];
export const BREAKS = "breaks";

export function pullSpec() {
  return {
    name: PULL_TOOL,
    description: [
      "Pulls the next leaf of a ticket, or hands the leaf in hand back with a",
      "verdict. Call it with nothing to take a leaf: the answer says work, refused",
      "or wait, and a work answer names the ticket, the step, the fields to write",
      "and the guidance. Write the fields into the ticket, then call it again",
      "naming the ticket and the verdict. The judge reads the evidence against the",
      "guidance before the shell checks it.",
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        ticket: { type: "string", description: "the ticket in hand, on a hand-back" },
        verdict: {
          type: "string",
          enum: ["pass", "fail", "became"],
          description: "pass, fail with a reason, or became with the successor",
        },
        reason: {
          type: "string",
          description: "the reason on a fail, or the successor on a became",
        },
        fields: {
          type: "object",
          description:
            "the text of each field of the leaf in hand, keyed by field name, which the engine writes into the ticket before it checks",
        },
      },
    },
  };
}

// [[spec/design_output/pull#the-checks]]
export function judgeAsk(evidence, rules) {
  const listed = (rules ?? []).map((one, i) => `${i + 1}. ${one}`).join("\n");
  return [
    "A hand wrote this evidence at one step of a ticket, and the step reads the",
    "guidance below. Answer follows where the evidence keeps every rule, and",
    "breaks where one line of it breaks a rule.",
    "",
    "Guidance:",
    listed,
    "",
    "Evidence:",
    String(evidence ?? "").trim(),
  ].join("\n");
}

// [[spec/design_output/pull#a-hand-of-its-own]]
export function spawnPromptIn(answer) {
  const rows = String(answer ?? "").split("\n");
  if (rows[0]?.trim() !== "spawn") return "";
  const blank = rows.indexOf("");
  return blank < 0
    ? ""
    : rows
        .slice(blank + 1)
        .join("\n")
        .trim();
}

// [[spec/design_output/pull#the-hand-and-the-hold]]
export function sessionOf(e) {
  return {
    id: String(e?.session?.id ?? e?.sessionId ?? "").trim(),
    harness: String(e?.harness ?? e?.client ?? "").trim(),
  };
}

export function judgeRefusal(said) {
  return [
    "refused",
    "  the judge reads the evidence against the step's guidance, and it breaks a rule.",
    `  ${String(said ?? "").trim()}`,
    "",
    "  Fix it, and the ticket stays in hand.",
  ].join("\n");
}
