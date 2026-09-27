// The pull tool's pure half: the spec the tool registers, the spawn prompt
// and the session, so a test reads them with no harness standing. The CLI
// reads the tool's input into an argv, in pull-tool.js.
// [[spec/design_output/pull#the-hand-out]]

export const PULL_TOOL = "pull";
// The plugin registers the tool, so the call carries the prefix every level zero tool carries. [[spec/design_output/pull#the-checks]]
export const PULL_CALL = `mcp__level0__${PULL_TOOL}`;
// The hand's session file, which the hook beside this library writes. folders.js owns the name, and a plugin imports nothing past its own folder, so level one spells it here and the hook imports it. [[spec/design_output/pull#the-hand-and-the-hold]]
export const SESSION = ".se/.runtime/session.json";

export function pullSpec() {
  return {
    name: PULL_TOOL,
    description: [
      "Pulls the next leaf of a ticket, or hands the leaf in hand back with a",
      "verdict. Call it with nothing to take a leaf: the answer says work, refused",
      "or wait, and a work answer names the ticket, the step, the fields to write",
      "and the guidance. Write the fields into the ticket, then call it again",
      "naming the ticket and the verdict.",
    ].join(" "),
    inputSchema: {
      type: "object",
      properties: {
        ticket: { type: "string", description: "the ticket in hand, on a hand-back" },
        verdict: {
          type: "string",
          enum: ["pass", "fail", "became", "answered"],
          description:
            "pass, fail with a reason, became with the successor, or answered with the ticket answering the ask",
        },
        reason: {
          type: "string",
          description:
            "the reason on a fail, the successor on a became, or the answering ticket on an answered",
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

// Every spelling of the id this tree meets, the copilot library's `session_id` among them. [[spec/design_output/pull#the-hand-and-the-hold]]
export function sessionOf(e) {
  return {
    id: String(e?.session?.id ?? e?.sessionId ?? e?.session_id ?? "").trim(),
    harness: String(e?.harness ?? e?.client ?? "").trim(),
  };
}
