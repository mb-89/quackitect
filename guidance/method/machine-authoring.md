---
id: machine-authoring
statement: The rules for drawing machines - consulted when authoring, pulled nowhere.
---

# Machine authoring — the rules

## The one-state rule

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

## Statements are subtitles

ONE field: `statement:`. Authored in a state note's frontmatter (or a
sub-canvas frontmatter for its door), rendered small under the drawn
node's name, served in the packet's next lists. The rule is the voice's
anti-noise law:

- A statement exists only when it ADDS meaning the id does not
  ("In doubt, go here.", "Diverge on purpose.", a record's goal).
- Filler is struck, never generated — no "The retro machine.", no
  statement that restates the name. Empty is better than an echo.
- The owner decides what deserves one, by filling or emptying the field.

## Records are not confetti

Expeditions and iterations stay OPEN and collect related work until they
are fat enough to be worth an archive entry. Do not close a record the
moment one item lands; do not seed a new record for every small fix. An
archive reader wants a day's coherent story, not ten slivers.

## The standing cautions

- Return edges into a shared home carry role `alternative` — normal
  edges AND-join and would hold the home hostage.
- YAML guidance scalars must not contain colon-space (the parse trap).
- Every state carries guidance and a priority; the compiler refuses
  silence.
