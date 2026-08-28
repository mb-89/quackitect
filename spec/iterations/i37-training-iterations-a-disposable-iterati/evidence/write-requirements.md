---
form: write-requirements
by: agent
signed_off: 2026-08-20T07:19:53.491Z
authors: agent
files: null
---

# Evidence form / write-requirements

## current_situation

i37 stands at write-requirements, the first work state of M3. M2 is complete and gate-inputs is blessed.

Six requirements are minted here from the two use cases. Two are graded fatal, one crippling-plus, one corrosive.

The register still carries a fatal assumption that is half probed, and probe-assumptions is four states away.

## register

- [[req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point]]
- [[req-a-ceiling-that-cannot-prove-ancestry-refuses]]
- [[req-a-benchmark-report-carries-the-conditions-of-its-run]]
- [[req-a-run-that-stopped-early-says-where-it-stopped]]
- [[req-the-benchmark-history-is-unreadable-while-a-run-is-bound]]
- [[req-a-benchmark-run-modifies-no-record-and-appears-in-no-survey]]

## set_criteria

- complete: Every step and extension of both use cases maps to a requirement, with two deliberate absences. The choice-and-cycle steps (ext 1a, 1b) carry no requirement because a wrong draw is visible in the report and costs a re-run, not a defect. The honesty assumption carries none because it constrains nobody — it is a limit on what the number claims, and it lives on the register and in the report's standing text.
- consistent: No two requirements demand opposite things. The nearest pair is the concealment requirement, which hides the reports folder from a bound run, and the report requirement, which demands the run WRITE one. They meet at the same folder and do not conflict: concealment binds reads during the run, and the write happens as the run ends. That seam is real and is where a defect would live, so it is named here rather than discovered.
- affordable: Five of six are cheap because they are checks on existing mechanism: an ancestry test, a submit-time field check, and two absence claims. The sixth is not — the concealment requires one visibility rule honoured by read, search, glob and list, and today three lists disagree and the reading verb consults none. That is this iteration's only expensive requirement and it carries a work token.
- bounded: Every response measure is a count with a target of zero. Nothing asks for a judgment. The one graded by inspection says so in its own body, and says why: it demands the absence of a write, which a test can never establish.
- comprehensible: Each statement names one subject and one demand. The two ceiling requirements were deliberately split rather than joined — one says what resolves, the other says what happens when the check itself cannot answer. Joined, the fail-closed rule reads as a footnote on the happy path, and it is the half that fails silently.
- no_tbd: No TBD, TBC, TBR or open placeholder in any of the six. Every source_ref points at a use-case step, an extension, a register entry or a measurement dated 2026-08-19.
- behaviour_modelled: Behaviour is modelled as six scenarios in the source-stimulus-artifact-environment-response-measure shape. Two of the six are constraints on the machine rather than behaviour under load, and both state their environment explicitly so the absence of a stimulus rate is a choice rather than an omission.
- quality_groups_swept: Swept, and the sweep is recorded rather than asserted. PERFORMANCE: the guard sits under every resolution of a bound run, which is why if-benchmark-binding-to-guard carries a bound at all; the structural ceiling removed the per-call cost entirely. RELIABILITY: the fatal requirement is that a wrong read never resolves, and the run proves its own guard with one forbidden request per run. SECURITY: nothing here crosses a trust boundary — a benchmark run reads its own repository and writes one report. USABILITY: one verb opens and closes a run, and the report names where it stopped. MAINTAINABILITY: the concealment is the one place this iteration adds a rule four verbs must honour, and that is exactly why it is the expensive requirement. PORTABILITY: the conditions a report carries exist because the harness is not constant, which is i36's finding applied here. TWO GROUPS YIELDED NOTHING and say so: there is no scalability question because a run is one walk at a time, and no compatibility question because nothing outside this repository consumes a benchmark report.

## follow_up

- derive-functions is next and turns these six into the functions that satisfy them.
- probe-assumptions is the state that decides whether any of this stands. The rewind assumption is graded fatal and is half probed.
- The concealment requirement is the only expensive one and it carries wt-three-separate-lists-decide-which-paths-a-lane-verb-may-see-. If that token is not taken by M7, this iteration builds the narrow version for one folder and says so rather than widening.
- The seam named under `consistent` — concealment during the run against the write at the end — wants a case of its own at author-tests.

## anything_else

TWO REQUIREMENTS COVER ONE MECHANISM AND THE SPLIT IS DELIBERATE.

One says which commits resolve. The other says what happens when the ancestry check cannot answer at all.

JOINED, THE SECOND BECOMES A CLAUSE ON THE FIRST and reads as an edge case. It is not an edge case. It is the half that fails silently, and SE-C-143 already carries the same rule for the same reason in its own words: a guard going quiet looks exactly like a guard passing.

ONE THING THIS STATE DID NOT DO. It wrote no requirement for how a benchmark run is offered — at the desk, as a lane verb, or neither. gate-inputs named that as the one uncovered door and it is still uncovered. It is a shape question rather than a demand, so it belongs to the design milestones rather than here.
