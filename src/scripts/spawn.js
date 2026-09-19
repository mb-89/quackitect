// The prompts the pull hands a reader where it takes no step itself: one for a
// hand of its own, and one for a step only a person answers. They are text and
// nothing else, so the pull stays the place that decides and this stays the
// place that words it.
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

// The box hands a person's question out and lands the rest, so no branch waits on a desk. [[spec/design_output/work#a-person-step-leaves]]
export function unblockPrompt(ticket, leaf) {
  return [
    `${ticket} stands at ${leaf.path}, and only a person answers it. Hand it out of this branch, and land the rest.`,
    "",
    "1. Pick a name of five words at most for the question it asks.",
    "2. Run `./RUNME.sh mint ticket spec/tickets/<name>.md --process=question`, and write that question into its ask.",
    "3. Run `./RUNME.sh ticket open <name>`, so a hand can pull it.",
    `4. Run \`./RUNME.sh branch unblock ${ticket} <name>\`. It closes ${ticket} became that ticket, which stands outside this group.`,
    "5. Work every step this group has left, then run `./RUNME.sh branch done`.",
    "",
    "Stop for no person. The question waits on its own ticket, and holds up nothing behind it.",
  ].join("\n");
}
