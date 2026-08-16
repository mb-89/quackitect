---
form: an-unbound-rule-is-named
by: agent
signed_off: 2026-08-16T17:23:29.594Z
authors: agent
files:
---

# Evidence form / an-unbound-rule-is-named

## current_situation

THE SWEEP NOW SEPARATES THREE THINGS a green used to hide. A rule that fired and found nothing, a rule that can never fire, and a rule that never armed at all.

THE RUN IS OWED, like chunk six's. The engine still holds pre-reload code, so `boundrules.test.ts` has not executed. It runs at verification at the latest, where the battery is the engine's own.

## built

### The code

- `project/deliverable/engine/sweep.ts` — `ruleFindings(root, rel, fm)`, its own function so `sweepCorpus` stays inside the complexity budget. Two new finding kinds join the two that were there.

### What a green used to mean, and what it means now

BEFORE: a rule that passed and a rule that never ran were the same bytes.

NOW THE SWEEP SAYS WHICH, in three cases.

- `unfinished-rule` — the rule never armed. No key, no allows, or no declared way forward. `rulesOf` returns these as problems rather than skipping them, because a rule the engine silently could not read passes forever without ever running.
- `unbound-rule`, prefix unknown — it binds to an id whose prefix matches no item template, so the corpus has no folder that could ever hold it.
- `unbound-rule`, node missing — the prefix resolves and the file is not there. The report names the path it expected.

A RULE THAT ARMED, BOUND AND FOUND NOTHING produces no finding at all, which is the only one of the four that should be silent.

### Why two unbound kinds rather than one

THEY HAVE DIFFERENT FIXES. A missing node is a broken reference — write the node, or correct the id. An unknown prefix is a rule aimed at a subject the corpus has no shape for, which is a bigger question and usually means the rule is wrong.

COLLAPSING THEM WOULD SEND BOTH READERS TO THE SAME WRONG PLACE.

### Where it runs

IN THE SWEEP, NEVER AT THE WRITE. Whether a rule is bound depends on what else exists, and that changes with the next write — a corpus-wide condition, which `req-a-standing-break-reports-and-lands` rules out refusing on.

IT WOULD ALSO BE CIRCULAR. A rule binding to a node somebody is about to write would refuse the write that fixes it, which is exactly the trap `req-a-check-names-its-way-forward` exists to prevent.

## follow_up

CHUNK EIGHT IS NEXT — `a-check-names-its-escape`. Its demand is already half built: `rulesOf` refuses to arm a rule with no `on_break`, and the guard throws on it at the write.

WHAT CHUNK EIGHT STILL OWES is the case that proves it, which is the last red in `writeguard.test.ts`.

TWO RUNS ARE OWED IN TOTAL, chunks six and seven, both waiting on the same reload.

NOTHING IS BLOCKED.

## anything_else

### The complexity budget caught a real thing

THE FIRST WRITE PUT THE RULE CHECKS INLINE and biome refused at 26 against a max of 25.

IT WAS RIGHT. `sweepCorpus` was doing four jobs in one loop: walk the tree, parse, check vocabulary, check rules. Splitting `ruleFindings` out made each readable on its own.

A LINT THAT REFUSES RATHER THAN WARNS is this iteration's own thesis applied to code. It cost one edit, at the moment the code was under my hands, which is the cheapest that fix ever gets.

### What the sweep still does not check

THE REGISTER AGAINST ITS FOLDER, which note-8355729c239a names and the scope carries. It belongs to the sweep and is not built.

STORIES AGAINST THEIR PROVING RUNS, note-4ffaba22ce7f, likewise — owed at the story-evidence state.

NEITHER IS THIS CHUNK'S and both are named so the sweep's coverage is not read as complete.
