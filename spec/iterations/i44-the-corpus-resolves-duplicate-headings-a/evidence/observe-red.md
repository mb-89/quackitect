---
form: observe-red
judgment: passed at 2026-08-28T11:02:25.079Z
by: agent
signed_off: 2026-08-28T11:00:29.660Z
authors: agent
files: null
---

# Evidence form / observe-red

## current_situation

One test-spec stands for this record, tsp-the-corpus-sweeps, with method test. Its ten cases are written and none of them can pass yet.

The red has two named causes, both from the typechecker: `deliverable/engine/corpus-sweeps.ts` does not exist, and `REFERENCE_KEYS` is declared in guard.ts without being exported.

No demonstration, inspection or analysis spec was minted, so this checklist has nothing a person must observe by hand.

## red_observed

- none owed by hand. The only spec this record minted is method test, so the red is the engine's to observe at this submit rather than the agent's to claim.

## follow_up

Build the module and export the key list, then run the checks until all ten are green.

After the build, repair each class before its lint is wired into the corpus sweep. That order is the crippling risk's mitigation.

## anything_else

THE RED IS A COMPILE RED RATHER THAN AN ASSERTION RED, and that is worth naming rather than glossing. The cases cannot reach their assertions, because the module they import is not written.

THAT STILL SATISFIES WHAT THIS STATE ASKS. The three failures it names are a check passing from birth, a file that does not exist, and a run with no cases. The file exists, the run has cases, and none of them is green.

IT WOULD BE WEAKER EVIDENCE IF THE MODULE EXISTED AND THE ASSERTIONS PASSED. That is the shape this state is built to catch, and it is not this one.
