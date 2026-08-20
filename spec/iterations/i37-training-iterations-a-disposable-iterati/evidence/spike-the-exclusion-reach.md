---
form: spike-the-exclusion-reach
by: agent
signed_off: 2026-08-19T20:17:25.653Z
reopened: "2026-08-19T20:17:04.960Z — rank-unknowns re-signed above the sub-machine, so its completion has to be re-stamped"
authors: agent
files:
---

# Evidence form / spike-the-exclusion-reach

## current_situation

spike-the-exclusion-reach, re-signed after rank-unknowns re-signed above the sub-machine.

The measurement is unchanged and so is the verdict. What changed is what happens next: the owner has ruled the visibility rule into this iteration's scope, so this spike's finding is build work rather than a dependency.

## built

- [[exp-how-far-does-each-of-the-lanes-exclusion-lists-actually-reach]]

## follow_up

- M7 BUILDS THE RULE. One predicate over a path and the current binding, honoured by read, search, glob and list alike. Four call sites across three files.
- THE MEASURED SHAPE IS THE SPECIFICATION. paths.ts holds five names and binds list and glob. search.ts holds two of its own. produce.ts holds eleven and binds packaging alone. se_file_read holds none.
- ONE BEHAVIOUR MUST NOT SURVIVE THE REWRITE. Today the exclusion governs the WALK rather than the TARGET: listing the root hides .se, and listing project/.obsidian directly returns its seven entries. A concealment with that property is not a concealment.

## anything_else

THE VERDICT STAYS `falls` AND ITS CONSEQUENCE CHANGED.

When this spike ran, the finding was a blocker: the concealment could not be built because there was nothing coherent to attach it to, and the fix belonged to a work token nobody was assigned.

THE OWNER RULED IT INTO SCOPE. So the same measurement is now a specification: four lists to collapse into one predicate, four call sites to route through it, and one behaviour — walk-scoped rather than target-scoped exclusion — to remove while doing it.

A SPIKE WHOSE VERDICT IS `falls` AND WHOSE OUTPUT IS A BUILD PLAN is the best case for this state. It found the wall before anything was built against it, and the wall turned out to be four call sites thick.
