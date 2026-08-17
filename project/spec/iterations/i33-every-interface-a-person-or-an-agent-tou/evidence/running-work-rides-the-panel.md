---
form: running-work-rides-the-panel
by: agent
signed_off: 2026-08-17T12:20:14.607Z
authors: agent
files:
---

# Evidence form / running-work-rides-the-panel

## current_situation

The last build chunk, and the tree is now FULLY GREEN: 1397 tests, 1397 pass, 0 fail, with biome, preflight and the corpus sweep green beside it.

EVERY CASE AUTHORED AT author-tests IS NOW SATISFIED. Four were red on purpose, one was green from birth and was made honest mid-build, and all six pass against the built behaviour.

## built

FOUR LEGS OF ONE WIRE, because ux.md says fixing one leg and shipping is the failure this project repeats most.

THE ENGINE STATE — project/deliverable/engine/run.ts. A new `runningJob()` beside `anyJobRunning()`. The existing one answers whether the machine may sleep, which is a boolean and cannot be shown. This one answers what to TELL somebody watching a still surface, and returns the job's command and how long it has been running.

THE PAYLOAD — project/deliverable/engine/mirror.ts. The /widget/controls values gain `running: runningJob()`, supplied where every other panel value is supplied. Absent when nothing runs, which is the ordinary case and draws nothing.

THE RENDER — project/deliverable/engine/params.ts. `PanelValues` gains the field and `renderRunning` draws it as a SIBLING of the control rows, after the closing span rather than inside it. That is not cosmetic: a signal nested inside would replace the panel's markup as a substring, and the test that guards non-intrusiveness asserts the quiet panel survives whole inside the busy one.

THE DOM — project/deliverable/vscode/src/extension.ts. A `.running` rule, muted and small, from the host's own theme variables. Findable without competing with the control beside it, which is what non-intrusive means here.

WHAT IT DELIBERATELY DOES NOT DO. It shows no completion estimate. A faithful percentage is the known way to fail req-a-slowness-signal-never-shortens-the-wait, and the wording is the owner's through raid-risk-an-accurate-progress-signal-can-drive-abandonment. This chunk settles WHERE the signal lives and that it does not take the surface over.

## follow_up

THE BUILD IS COMPLETE AND THE TREE IS GREEN. Verification is next.

ONE THING IS OWED AND IS DECLARED RATHER THAN QUIETLY LEFT. ux.md's seam rule says two green halves are not a green wire, and asks for a seam test per wire: assert the payload carries the field, and assert the surface acts on it.

- THE SURFACE HALF IS TESTED. Both cases of tsp-work-past-its-bound-signals drive renderPanel with a running value and assert what it emits.
- THE PAYLOAD HALF IS NOT. That mirror.ts hands `running` into the values is true by inspection of one line, and no test asserts it. A test that would is a booted server reading /widget/controls with a job in flight.

I DID NOT WRITE A CHEAP ONE INSTEAD. Asserting that `runningJob()` returns undefined when nothing runs would pass trivially and prove nothing — which is the green-from-birth failure this very iteration found and fixed in its own test file an hour ago. Writing a second one knowingly would be worse than leaving the gap named.

SO IT GOES TO VERIFICATION as a named hole rather than a silent one, and the fresh-eyes pass can rule on whether it is worth the booted server.

AND THE PHASE-SPLIT READING IS STILL OWED, from chunk one. Its instrument is built and the numbers arrive on the first render after the next reload.

## anything_else

