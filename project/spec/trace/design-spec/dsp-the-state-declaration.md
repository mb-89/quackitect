---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: dsp-the-state-declaration
type: "[[design-spec]]"
statement: One declaration says what the machine-state folder is called and which files inside it have a structured door, and every consumer is generated from it rather than written beside it.
realizes:
  - el-state-declaration
  - if-record-store-to-state-declaration
  - if-walk-engine-to-state-declaration
  - if-state-declaration-to-engine-delta
  - if-state-declaration-to-method-compiler
files:
  - project/deliverable/engine/paths.ts
  - project/deliverable/engine/produce.ts
  - project/deliverable/engine/search.ts
  - project/deliverable/engine/tables.ts
  - project/deliverable/engine/vault.ts
---

## The four crossings this design carries

CLAIMED 2026-08-20, when `specify-build` first ran its law over the whole
corpus and found ten crossings realized by no spec. These four are this
declaration's, and they are its by the sentence at the top: every consumer is
GENERATED from the declaration rather than written beside it. A generated
consumer is a crossing, and the generation is designed here.

- `if-record-store-to-state-declaration` and
  `if-walk-engine-to-state-declaration` are the inbound half. Both read the
  declaration to learn what the folder is called and which files inside it have
  a structured door. Neither carries its own copy, which is the whole point.
- `if-state-declaration-to-engine-delta` and
  `if-state-declaration-to-method-compiler` are the outbound half. Both take
  what the declaration generates rather than a path written beside it.

THE FIFTH CROSSING IS NOT HERE ON PURPOSE.
`if-state-declaration-to-account` lands on `dsp-call-log`, which already
carries every `*-to-account` crossing and describes what a record holds. The
convention there is the destination's, and splitting it would leave one account
crossing designed somewhere nobody looks for it.

## NOT BUILT YET — the one module this design turns on does not exist

THIS SPEC CLAIMED `engine/statedecl.ts` FROM i9 AND NOTHING EVER LANDED THERE.
Twenty-nine iterations later `trace-design` caught it, and only because i38
added four interface crossings to this spec and pulled it into the check's
scope. A planned name is legal while a spec is being written; what it may not do
is survive the record unrealised, and this one survived twenty-nine of them.

WHAT STANDS INSTEAD IS THE THING THE DESIGN EXISTS TO REMOVE.
`engine/paths.ts` carries `EXCLUDED_DIRS` as its own copy of the folder's
name — one of the five consumers this design says should be GENERATED. The claim
now names where the fact lives today rather than where the design puts it.

WHAT TO DO INSTEAD, TODAY: read `EXCLUDED_DIRS` in `paths.ts`. There is no
declaration to ask, and each consumer keeps its own copy, which is exactly the
drift this design was written to make impossible.

WHEN IT IS BUILT, one module will answer both facts and the five consumers will
be generated from it. Nothing below this line is built; it is the design, kept
because it is still the right one.

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
