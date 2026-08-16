---
form: author-tests
amended: "2026-08-16T06:46:17.496Z by agent — The stored table still listed tsp-claim-lane, tsp-claim-guardrails and tsp-two-machines-run, which were deleted after this form signed. It now carries only the…"
by: agent
signed_off: 2026-08-16T06:29:05.979Z
authors: agent
files:
---

# Evidence form / author-tests

## current_situation

i34 stands at author-tests, the first build state. The rule the owner set for this iteration binds here: write the tests for the new behaviour, throw the old out, write the new.

FOUR REQUIREMENTS NEED EXECUTABLE CHECKS, and none needs a new test-spec. Each belongs to a spec that already covers its subject, so the register gains four entries in `verifies` rather than four new nodes.

THE METHOD MUST MATCH, which is what decides the placement. Three of the four are verified by test; one is inspection, because the demand is the ABSENCE of a tree-chooser and only reading the code shows an absence.

THIS IS ALSO THE FIRST REAL EXERCISE OF THE FIX made earlier this milestone: the table is sent as the four rows that MOVED rather than all forty-nine, and the write half skips anything unchanged.

## checks

| test-spec | method | verifies |
| --- | --- | --- |
| [[tsp-archive]] | test | req-archive-lists-every-closed-record · req-archive-opens-to-a-person-only · req-archive-read-only · req-archive-releases-worktrees · req-archive-shows-it-as-it-closed · req-a-closed-records-folder-stays-on-trunk |
| [[tsp-read-back-inspection]] | inspection | req-a-resolution-is-proven-by-read-back · req-every-record-path-resolves-in-one-tree |
| [[tsp-record-lifecycle]] | test | req-container-offers-its-records · req-survey-counts-only-open-records · req-record-opens-on-word · req-record-status-comes-from-the-record · req-walk-opens-at-retro · req-unshipped-dependency-refused · req-landing-needs-no-close · req-size-choice-is-the-bless · req-size-escalation-readjudicated · req-size-proposal-names-strikes · req-bless-outputs-ride-the-bless · req-blessed-column-compiles-pinned · req-a-shipped-record-is-never-reclaimed · req-a-records-dependency-is-declared · req-a-records-own-status-decides-whether-it-is-open |
| [[tsp-walk-discipline]] | test | req-a-clear-jump-is-one-call · req-answer-pages-never-overflows · req-autonomy-gates-every-hop · req-autonomy-change-applies-forward · req-controls-never-advance-walk · req-gate-needs-a-persons-verdict · req-pull-answers-from-record · req-walk-resumes-from-repo · req-state-opens-only-when-earned · req-state-needs-all-its-inputs · req-a-reopen-stands-where-it-can-work · req-land-target-routes-to-gate · req-instruction-names-its-source · req-a-pull-carrying-no-choice-enters-no-iteration |

## follow_up

- FOUR SPECS GAIN A REQUIREMENT and no new spec is minted. tsp-archive takes the archive-on-disk demand, tsp-record-lifecycle takes status-as-the-open-flag, tsp-walk-discipline takes the selection state, and tsp-read-back-inspection takes the one-tree resolution.
- WHY tsp-read-back-inspection AND NOT tsp-bound-resolution, which looks closer: the bound-resolution spec verifies by TEST, and req-every-record-path-resolves-in-one-tree verifies by INSPECTION. A test can show one path resolving correctly; only reading the code shows that nothing anywhere chooses a tree. The method match is a law here, not a preference.
- THREE SPECS WERE DELETED AFTER THIS FORM WAS SIGNED, on the owner's ruling that the claim system goes everywhere it ripples: tsp-claim-lane, tsp-claim-guardrails and tsp-two-machines-run. They verified requirements and a story that no longer exist, so they had nothing left to verify. The register is 46 specs, not 49.
- NEXT IS observe-red, which is where the new checks must FAIL before anything is built. Three of the four can fail today: the archive still retires a record directory, the open flag is still a directory, and the container still enters on a bare pull.
- THE FOURTH CANNOT FAIL BY TEST, because it is an inspection. Its red is a reading of the seam that names the choosers still standing — storeFor's branch, machineRootOf, fansOut, methodFilesIn.

## anything_else

THE TABLE WAS SENT AS FOUR ROWS RATHER THAN FORTY-NINE, and that is the point rather than a shortcut.

Earlier this milestone the same field could not be submitted at all, because sending every row meant resending values a writer then truncated at 200 characters. The cut is removed and the write half now skips unchanged cells, so a state can send what it changed and nothing else.

IF THIS SUBMISSION IS REFUSED FOR MISSING ROWS, that is the check half still reading the submission rather than the nodes, and it is the one engine debt this iteration opened and has not closed.
