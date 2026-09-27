// The prompt the pull hands a reader where it takes no step itself, for a hand
// of its own. It is text and nothing else, so the pull stays the place that
// decides and this stays the place that words it.
// [[spec/design_output/pull#a-hand-of-its-own]]

export const SPAWN = "spawn";
export const HELPER = "helper";

// [[spec/design_output/pull#a-hand-of-its-own]]
export function spawnPrompt(ticket, leaf, helper) {
  const verdict = leaf.evidence.some((field) => field.form === "verdict");
  const back = verdict
    ? `./RUNME.sh ticket pull ${ticket} --as ${helper}`
    : `./RUNME.sh ticket pull ${ticket} --as ${helper} --pass, or --fail "why"`;
  return [
    `You are a hand of your own on this box, named ${helper}, and you work one step of one ticket.`,
    "",
    `1. Run \`./RUNME.sh ticket pull --as ${helper}\` from the root. It hands you ${ticket} at ${leaf.path}, with its fields and its guidance.`,
    "2. Write the fields into the ticket where the answer says, under the headings it names, and change nothing else.",
    `3. Run \`${back}\`. It checks the hand-back and answers done, or refused with what to fix.`,
    "4. Answer with what the last pull said, word for word.",
  ].join("\n");
}
