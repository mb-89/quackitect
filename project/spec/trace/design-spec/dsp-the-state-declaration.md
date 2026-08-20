---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: dsp-the-state-declaration
type: "[[design-spec]]"
statement: One declaration says what the machine-state folder is called and which files inside it have a structured door, and every consumer is generated from it rather than written beside it.
realizes:
  - el-state-declaration
files:
  - project/deliverable/engine/statedecl.ts
  - project/deliverable/engine/paths.ts
  - project/deliverable/engine/produce.ts
  - project/deliverable/engine/search.ts
  - project/deliverable/engine/tables.ts
  - project/deliverable/engine/vault.ts
---

## Responsibility

TWO FACTS AND NOTHING ELSE. What the folder is called, and which files inside
it are served by a structured verb of their own.

THE SECOND FACT IS THE NEW ONE. The old rule hid a directory, which is a proxy
for "these files have a door" that catches everything else in the folder as
collateral. Naming the files makes the split expressible at all.

WHAT IT DOES NOT DO. It does not decide where the folder SITS. That is the root
question, and it belongs to the entry point.

## Interface

ONE MODULE ANSWERS BOTH FACTS, and every caller asks rather than knowing.

- The folder's name.
- The set of files that have a door, each with the verb that serves it.

THE VERB TRAVELS WITH THE FILE. A refusal that only says no teaches that the
folder is closed, which is the belief the requirement exists to remove. The
declaration is what lets the refusal name the door.

## Behavior and constraints

FIVE CONSUMERS ARE GENERATED FROM IT, and they are the ones a probe found
carrying their own copy today.

- The path resolver's exclusion set.
- The producing acts' exclusion set.
- The search tool's ignore glob.
- The table sweep's skip set.
- The editor's own hide rule.

THE COUNT MATTERS MORE THAN THE LIST. A spike counted forty-seven places in the
engine that build a path from this folder. Four are resolvers, three of them
scripts re-implementing the one real one. Seventeen are consumers that ask, and
are safe. Twenty-six are hard-codes that never ask anything, and they are the
work: no rename reaches them.

ONE RESOLVER IS WRONG IN A WAY THE MOVE DOES NOT FIX. A script resolves the
folder relative to the working directory rather than the root, so it already
answers differently depending on where it is invoked from.

THE STALENESS CHECK IS THE GUARD AND IT IS NOT OPTIONAL. Generating consumers
means a check that each is current. That check is now load-bearing under a
FATAL requirement, because the root check runs the same content test the host
ran and both are generated from here. A drift between two generated consumers
breaks the root check silently.

## Rationale

ONE CANONICAL ANSWER WITH GENERATED CONSUMERS is a named pattern outside this
project, and the reported failure mode without it is exactly ours: several
tool-specific files kept in step by hand, drifting within a week. The same
source names the check as the part that earns its keep.

WHAT THAT SOURCE DOES BETTER. It runs the check where a merge is blocked, and
we have no such place, so generated consumers can be stale locally for as long
as nobody looks.

WHY NOT A MARKER FILE. Recognising a tree from inside a clone is a non-goal of
this iteration on the owner's ruling. The folder open in the editor is the
project, so nothing needs recognising.

THE DECISION IS raid-dec-the-machine-state-sits-inside-the-opened-folder-and-one-declaration-names-it.
