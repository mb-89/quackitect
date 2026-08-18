---
form: verification
by: agent
signed_off: 2026-08-18T11:07:18.400Z
authors: agent
files: null
---

# Evidence form / verification

## current_situation

Verification is re-entered after fix-findings. All eleven findings are fixed, the battery is green at 1475 tests in 143 suites, biome is clean over 289 files and the sweep walks 1366 nodes.

THE FIRST PASS AT THIS STATE COULD NOT BE RECORDED AT ALL, and that is the most important thing this form has to say. A tester with fresh eyes returned three blocking findings with the battery GREEN — two of them inspection findings that no test can turn red. The forward door wanted every claim green, the fallback door fires only on a red exit script, and the state grants read verbs only. There was no legal move. The walk escaped to the desk with the reason recorded.

THE OWNER RULED ON IT DIRECTLY: "You do the verification, you fail, you go to fix-findings, you go back to verification, you try again, you fail, you go back to fix-findings. It's a loop. I don't know why every agent keeps messing that up. Fix this."

THEY WERE NOT MESSING IT UP. Session.advanceSub demanded a met claim before ANY exit from a state with evidence fields, and that demand covered the fallback edge — the edge drawn for exactly this state failing. Demanding a green claim to walk it is demanding that the failure not have happened. The kernel was innocent throughout, and every kernel case in tests/fallback-outcome.test.ts passed while the loop was wedged, because they call completeState directly and never meet that gate.

IT IS FIXED AND PINNED. The gate stands aside for a hop whose target is reachable ONLY by a repair edge, and stands firm for every other hop — so the route DEMOTES a state and can never advance one. tests/fallback-outcome.test.ts asks the shipped matrix, on every column, that fix-findings is such a hop and gate-implementation is not.

AND THE CONSOLIDATION THE OWNER ASKED ABOUT WAS MEASURED RATHER THAN ASSUMED. Thirteen files seed an iteration, costing 46.5s of the battery's 229s summed — but across thirteen processes, and the runner gets about 2.5x from cross-file parallelism. Merging them into one benchmark makes a single SERIAL 46s file, a worse critical path than the 42s refs.test.ts that dominates today. The owner's own instruction settled it: "measure it, and don't change it if it doesn't improve time." It does not.

## claims

- [x] tsp-one-door-into-the-pool
- [x] tsp-prose-inspection
- [x] tsp-the-arrival-in-one-act
- [x] tsp-the-cited-refs-resolve
- [x] tsp-unattended-start
- [x] tsp-autonomy-tiers
- [x] tsp-read-back-inspection
- [x] tsp-coupling-disposition
- [x] tsp-bound-surface
- [owed] tsp-desk-and-gates — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-tour-run — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-panel-walkthrough — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-two-machines — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-first-run — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-a-slow-signal-keeps-the-wait — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-record-inspection — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine
- [owed] tsp-derivation-analysis — raid-debt-ten-checks-wait-on-a-person-or-a-second-machine

## follow_up

WHAT THE INSPECTION SPEC NOW CHECKS, and why it can be ticked. tsp-one-door-into-the-pool failed its first pass on two of five lines. Both are closed, and both are closed MECHANICALLY rather than by re-reading:

- the lane's tool surface offered se_file_write as a second door, with no mint demands at all. engine/files.ts now calls guardNoSecondDoor before any write, so a path under the pool refuses and names se_note_drain. Two cases pin it, and one of them proves the guard is about the pool and nothing else.
- the two call sites differed by an actor flag. They still do — tools.ts passes judgmentDrainAllowed() and session.ts passes true — but the MINT demands are identical on both, and the checklist line is about the demands. The person's path being lighter about DISPOSITIONS is the design; nothing about the crossing is lighter for an agent.

WHAT IS STILL OWED, and it is written here rather than left to be discovered:

- the paste check cannot catch a bare NAME. A person's name is an ordinary word of ordinary length with no separator, and lowering the opaque-token threshold far enough to catch one would flag every long word in the language. tests/pool-mint.test.ts carries a case that DEMONSTRATES the limit rather than hiding it.
- the identity sweep reads four needles and all four are THIS MACHINE's own identity. It catches the machine leaking itself; it cannot catch a note leaking somebody else, which is the case the pool exists to guard. dsp-the-options-pool overstated this and has been corrected.
- three of the four unprobed assumptions are owed to the migration, which is a non-goal of this record. They travel with it because the register is addressable.

TWO PRE-EXISTING CORPUS BREAKS WERE FIXED ON THE WAY BACK, and they are the same class as the three unclaimed engine files this record found at trace-design: flow-arrival-request and flow-repository-refs were minted at i35 without a `crosses` field, so the closure check read one as a missing function and the other as work nobody wanted. Both genuinely cross the boundary. They failed identically at origin/v3, so they have been sitting there since i35 shipped — and only an iteration walking derive-functions ever asks.

## anything_else

