---
form: observe-red
by: agent
signed_off: 2026-08-16T19:27:59.050Z
reopened: "2026-08-16T19:27:27.131Z — the only drawn way back into build-steps, where a chunk I reopened for its write verbs is owed a re-submit"
authors: agent
files:
---

# Evidence form / observe-red

## current_situation

NINETEEN CASES ACROSS FOUR FILES, none of them run by me. The engine fires red-observed at this submit, reads every test-spec minted in this record, runs the files they name, and refuses unless at least one case FAILS.

ALL FOUR OF THIS DELTA'S SPECS ARE method: test, so none of them appears on the checklist below. The twelve listed are standing non-test specs from earlier iterations.

THE PREDICTION, RECORDED BEFORE THE RUN so it can be wrong on the record: all nineteen red, most of them assertion-red, and two specs possibly crash-red because they drive shapes that do not exist yet.

## red_observed

- [x] tsp-autonomy-tiers
- [x] tsp-bound-surface
- [x] tsp-derivation-analysis
- [x] tsp-desk-and-gates
- [x] tsp-first-run
- [x] tsp-panel-walkthrough
- [x] tsp-prose-inspection
- [x] tsp-read-back-inspection
- [x] tsp-record-inspection
- [x] tsp-tour-run
- [x] tsp-two-machines
- [x] tsp-unattended-start

## follow_up

THE BUILD OPENS, in the order the chunk machine makes binding.

WHAT THE ENGINE'S OWN RUN DECIDES AT THIS SUBMIT.

- ALL NINETEEN RED: the state signs and the build starts.
- ANY CASE GREEN BEFORE THE BUILD: the submit refuses, and green from birth proves nothing. That case is wrong and gets fixed.
- A FILE MISSING OR NO TAP SUMMARY: the submit refuses. An instrument failure must never read as a red.

TWO SPECS ARE FLAGGED FOR run-demos rather than for here. tsp-two-machines and tsp-unattended-start both demonstrate se-start.ts, and the chunk the-cloud-start-reads-trunk repairs it. Neither can go red before the build; both must be re-demonstrated after it.

NOTHING IS BLOCKED.

## anything_else

### Every checked box means the same thing here, and it is the second of the two the guidance allows

RED IS IMPOSSIBLE FOR A SPEC COVERING STANDING BEHAVIOUR, AND THAT IS ACCEPTED.

Not one of the twelve verifies any of this delta's nine requirements. They are demonstration, inspection and analysis specs from earlier iterations, and nothing this iteration adds can make them fail today.

THE ITEM LINES CARRY NO PROSE because the checklist matches on exact item equality. The reasoning lives here instead, which is where it can be read.

- tsp-autonomy-tiers — inspects that the autonomy scale is categorical rather than numeric. Untouched.
- tsp-bound-surface — a surface resolving to what it shows. No chunk changes a surface.
- tsp-derivation-analysis — the trace view derives from files, and reachable capability is traced. This delta ADDS nodes rather than changing how either derives.
- tsp-desk-and-gates — eight standing demonstration rows about the desk and the gate surfaces.
- tsp-first-run — the install and first-run demonstrations.
- tsp-panel-walkthrough — the panel demonstrations.
- tsp-prose-inspection — the voice inspections.
- tsp-read-back-inspection — path resolution in one tree.
- tsp-record-inspection — twelve standing rows about what a record carries.
- tsp-tour-run — the tour demonstrations.

### Two are checked with a flag, and the flag matters

tsp-two-machines AND tsp-unattended-start both demonstrate req-one-command-starts-an-unattended-machine, and both run through se-start.ts.

THE CHUNK the-cloud-start-reads-trunk CHANGES THAT FILE. It replaces the origin/it/<id> branch check with a record-folder check on trunk, so the branches the owner wants to delete can go.

SO THE REQUIREMENT DOES NOT MOVE AND ITS MECHANISM DOES. Neither can go red BEFORE the build, which is why they are checked. Both must be re-demonstrated at run-demos rather than assumed, which is why they are flagged.

A DEMONSTRATION THAT PASSED BEFORE A CHANGE AND WAS NEVER RE-RUN AFTER IT is exactly how a regression hides.

### Why none of this delta's specs is on this checklist

ALL NINE NEW REQUIREMENTS CARRY verify_method: test, so the engine observes their reds itself at this submit.

THE CHOICE COSTS SOMETHING AND IT IS WORTH NAMING. A test can show one path behaving; it cannot show that nothing anywhere does the wrong thing. req-a-coverage-check-computes-both-sides' first case runs into that directly — it asserts an ABSENCE and can only see the phrasings it knows to look for.

AN INSPECTION WOULD HAVE BEEN HONEST THERE. It was not chosen because an inspection cannot refuse at a submit, and this iteration's thesis is that a rule wanting enforcement gets a check rather than a reader. The absence case is paired with two positive ones for exactly that reason.

### Reopened once, and not because the observation moved

THE OBSERVATION IS UNCHANGED. Every box above means what it meant when it was first signed, and the engine's own red-observed run is a historical fact this state recorded at its birth.

WHY IT WAS REOPENED: a build chunk inside build-steps had been reopened to reach a write verb, and observe-red is the ONLY drawn way back into that sub-machine. Nothing else in the drawing enters it.

THAT IS A TRAP WORTH NAMING. Reopening a state inside a sub-machine leaves no short way back to it: the parent is grey until the child re-signs, and the child cannot be reached until the parent's successors complete. Getting back cost reopening a second, unrelated state. It is noted for the retro rather than fixed here.
