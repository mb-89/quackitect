---
form: trace-design
by: agent
signed_off: 2026-08-17T16:59:53.656Z
reopened: "2026-08-17T16:59:21.789Z — observe-red re-signed above it and the build drawing completed. This state's sweep checks that every design spec's files exist and every deliverable file is claimed, and engine files changed today under goal five."
amended: "2026-08-17T14:46:20.094Z by agent — the verification fixes touched the README and one guidance page, neither of which is deliverable code"
authors: agent
files:
---

# Evidence form / trace-design

## current_situation

The mechanical design trace, after the build. Three checks are law at this submit: every element and interface realized by a design spec, every spec's files existing on disk, and every deliverable code file claimed by at least one spec.

RE-READ FIVE TIMES SINCE, and the dead-code view has not moved once.

THE VERIFICATION FIXES CHANGED NOTHING HERE. A tester with fresh eyes found four reds and all four were fixed in README.md, project/guidance/method/tour.md, tsp-hand-walk and tsp-coupling-disposition. None of those is a deliverable code file.

TODAY'S ENGINE WORK UNDER GOAL FIVE CHANGED NOTHING HERE EITHER, and it was checked rather than assumed. All of it landed in project/deliverable/engine/session.ts, which dsp-the-goal-binds-the-walk already names. The two test files it touched are named by test-specs. No new source file was minted and nothing was claimed to keep the sweep quiet.

THREE SPECS NOW, after the redo against the kickoff's goals (2026-08-17). The two added there are the ones that carry the milestones.

dsp-the-goal-binds-the-walk realizes el-walk-engine and names engine/machine.ts, engine/stateform.ts, engine/rigor-matrix.ts, engine/machines/compile.ts and engine/session.ts. It carries the goals list, the goals_served round, the bound_breaches round and the whole ripple — including the correction that an amendment does not re-grey it.

dsp-the-outside-boundaries-and-their-bounds realizes ALL THIRTEEN outside boundary nodes and names machines/items/interface.md, engine/trace.ts and engine/elematrix.ts. specify-build refused until it existed, naming each of the thirteen in turn — the law working rather than a formality.

WHAT THIS GRAIN CANNOT SEE, and there is a live example of it. The grain is the FILE, so dead code inside a claimed file is invisible. outsideBoundaryProblems in engine/trace.ts is real code in a claimed file that nothing currently reaches — only reading it tells you so, which is exactly the blind spot this state's own guidance names.

THE DELTA ADDED ONE SPEC AND FOUR FILES TO IT. dsp-legible-controls named two files when it was written and names four now, because the build proved the wire has four legs rather than two.

## design_trace

ONE SPEC WAS ADDED AND ITS FILE LIST GREW DURING THE BUILD.

dsp-legible-controls realizes el-mirror, and names four files:

- project/deliverable/engine/run.ts — holds the fact. `runningJob()` names the job somebody waits on, beside `anyJobRunning()` which counts and therefore cannot be shown.
- project/deliverable/engine/mirror.ts — carries it outward in the controls payload.
- project/deliverable/engine/params.ts — draws it, and holds the two other designs: naming the unlocking notch, and keeping an absent bank position apart from a deliberate zero.
- project/deliverable/vscode/src/extension.ts — styles both new states from the host's own theme.

WHY IT GREW RATHER THAN BEING WRONG AT WRITING TIME. The spec was authored before the build, as this method demands, and it named the two files the design was expected to land in. Building the running signal proved the demand spans four legs — engine state, payload, render, DOM — which ux.md names as one wire. Each of the four is claimed because the design actually lands in it.

ONE FILE I EDITED IS NOT CLAIMED BY THIS SPEC, deliberately. project/deliverable/engine/render.ts gained the machine-phase split at chunk one. That is instrumentation for a raid probe rather than part of this design concern, and claiming it here to keep the sweep quiet would be the fabricated coverage this state exists to catch. It is claimed by whatever spec already holds the mirror's rendering, and if the sweep says otherwise that is a finding to discuss rather than to bury.

TWO TEST FILES WERE ADDED, both named by test-specs rather than by design specs: tests/legible-controls.test.ts by tsp-a-control-is-legible, and tests/slow-work-signals.test.ts by tsp-work-past-its-bound-signals.

## follow_up

VERIFICATION IS NEXT, and it inherits a green tree — 1401 tests, 1401 pass, 0 fail, with biome over 274 files, preflight and a corpus sweep over 1224 nodes green beside it. The figure was 1397 when this state last signed; the four new cases are the amend rule's, and they were run rather than assumed.

WHAT VERIFICATION SHOULD PRESS ON, named here so it is not discovered there:

- THE SEAM'S PAYLOAD HALF IS UNTESTED. ux.md asks for a seam test per wire: assert the payload carries the field, and assert the surface acts on it. The surface half is tested by both cases of tsp-work-past-its-bound-signals. That mirror.ts hands `running` into the values is true by inspection of one line and asserted by nothing. A cheap test would have passed trivially, which is the green-from-birth failure this iteration already found and fixed in its own test file, so the gap is named rather than papered.
- THE PHASE-SPLIT READING IS OWED. Its instrument is built and the numbers arrive on the first render after the next reload, because the engine serving the mirror runs the source as it stood before the edit.
- THE FOUR-FILE GROWTH is worth a look. A design spec whose file list grows during its own build is either honest discovery or a spec written too thin, and only a reader who was not the author can tell which.
- THREE SPECS ARE GREEN FROM BIRTH rather than one. observe-red names all three and why. The newest, tsp-an-amend-leaves-the-tree-standing, could not have been test-first: nothing knew the rule until the owner gave it mid-walk. A reader should decide whether that class is acceptable or whether it wants its own handling.

## anything_else

