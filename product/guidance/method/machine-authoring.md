---
id: machine-authoring
statement: The rules for drawing machines - consulted when authoring, pulled nowhere.
---

# Machine authoring — the rules

## The one-state rule (owner ruling 2026-07-28)

A machine with only one working state is a STATE, not a sub-machine.
Draw the state note directly on the parent canvas; give it its guidance,
its `legal_tools`, its entry reads, its tags. Everything a one-state
machine can do, a plain state does without the ceremony:

- A legality zone rides `legal_tools` (the retro's drain proves it).
- A required method rides `entry_read` or a tag-pulled guidance doc.
- Its own visit in the decision graph comes with being a state.

A sub-machine is earned by MORE THAN ONE working state, or by states
that are seeded dynamically (the containers). Retro and the front desk
were converted under this rule; the boot keeps its machine because it
has several states.

## Subtitles

A state may carry `subtitle:` in its frontmatter — one short line drawn
small under the node's name ("In doubt, go here."). Use it for doors
whose purpose a newcomer must see at a glance. Never restate the name.

## Door statements

A sub-canvas may carry `statement:` in its frontmatter — the door state
in the parent shows it instead of "The <id> machine.". Keep it one
sentence.

## The standing cautions

- Return edges into a shared home carry role `alternative` — normal
  edges AND-join and would hold the home hostage.
- YAML guidance scalars must not contain colon-space (the parse trap).
- Every state carries guidance and a priority; the compiler refuses
  silence.
