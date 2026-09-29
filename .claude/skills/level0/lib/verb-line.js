// The line the Bash description carries: the verbs, or the index tools where
// the index lists them, and the refusals the shell door makes.
// [[spec/design_output/bash#the-description-names-verbs]]

export const VERBS = ["check", "branch", "tui", "doctor"];

// The verbs whose tools the line recommends: a verb that holds a terminal or never returns stays off, since a tool answers with no terminal. [[spec/tickets/verbline-spares-blocking-verbs]]
const TOOL_VERBS = ["check", "branch", "doctor"];

// The tool standing for a verb: its own under the verb topic, or its topic's where the verb names one. [[spec/tickets/agents-call-quack-directly]]
function toolOf(verb, names) {
  if (names.has(`index_verb_${verb}`)) return `mcp__level0__index_verb_${verb}`;
  if ([...names].some((one) => one.startsWith(`index_${verb}_`)))
    return `mcp__level0__index_${verb}_<verb>`;
  return "";
}

// [[spec/design_output/bash#the-description-names-verbs]]
export function verbLine(tools = []) {
  const names = new Set(tools.map((one) => one?.name));
  const named = TOOL_VERBS.map((one) => toolOf(one, names)).filter(Boolean);
  const verbs = named.length
    ? named.join(", ")
    : VERBS.map((one) => `./RUNME.sh ${one}`).join(", ");
  return [
    named.length
      ? `This tree answers its verbs as tools, and each one runs the checks that belong to it: ${verbs}.`
      : `This tree owns its own verbs, and each one runs the checks that belong to it: ${verbs}.`,
    named.length
      ? "Reach for the tool before the shell."
      : "Reach for the verb before the raw command.",
    "Level zero refuses a shell write to a file the rules reach, a commit carrying",
    "no message, a branch name past five words, a test run naming no file, a commit",
    "whose delta carries something private, a revert or a reset over a pull commit,",
    "and every git command that writes the repository, naming the verb standing for it.",
  ].join(" ");
}
