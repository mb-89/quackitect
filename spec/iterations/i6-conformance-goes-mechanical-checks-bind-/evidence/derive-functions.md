---
form: derive-functions
by: agent
signed_off: 2026-08-16T16:20:13.967Z
authors: agent
files: null
---

# Evidence form / derive-functions

## current_situation

ONE NEW FUNCTION, FIVE EXTENDED. The structure was not re-derived, and nothing escalated.

fn-run-a-governed-walk.guard-a-write is new, under the existing cluster the-walk. It carries the four write-path rows.

THREE STANDING FUNCTIONS ABSORB THE OTHER FOUR NEW ROWS. hold-the-method takes the two binding rows. judge-a-claim takes the coverage row, beside req-coverage-checked-both-ways which it already carried. route-the-work takes the seed row, beside req-a-records-dependency-is-declared which it already carried.

TWO MORE WERE EXTENDED FOR A DIFFERENT REASON. The coverage check found two STANDING requirements that no function served at all. See anything_else.

NO NEW FLOW WAS MINTED. The new function's five ports are all standing flows.

## functions

- fn-run-a-governed-walk.guard-a-write
- fn-run-a-governed-walk.hold-the-method
- fn-run-a-governed-walk.judge-a-claim
- fn-run-a-governed-walk.route-the-work
- fn-run-a-governed-walk.serve-a-step
- fn-run-a-governed-walk.stand-up-a-product
- fn-run-a-governed-walk.answer-with-tests
- fn-run-a-governed-walk.catch-the-system-up
- fn-run-a-governed-walk.close-a-record
- fn-run-a-governed-walk.diverge-before-deciding
- fn-run-a-governed-walk.help-find-a-capability
- fn-run-a-governed-walk.hold-a-stray
- fn-run-a-governed-walk.hold-the-work
- fn-run-a-governed-walk.keep-the-archive
- fn-run-a-governed-walk.keep-the-record
- fn-run-a-governed-walk.land-the-work
- fn-run-a-governed-walk.resolve-a-path
- fn-run-a-governed-walk.show-where-it-stands
- fn-run-a-governed-walk.teach-the-newcomer
- fn-run-a-governed-walk.work-the-register

## flows

- flow-archive-listing
- flow-bare-computer
- flow-battery-verdict
- flow-call-log
- flow-choice
- flow-closed-record
- flow-compiled-machine
- flow-dispatched-call
- flow-divergence-report
- flow-entry-document
- flow-evidence-form
- flow-field-feedback
- flow-filled-claim
- flow-filter
- flow-findings-report
- flow-help-query
- flow-help-result
- flow-instruction
- flow-intent
- flow-method-sources
- flow-note-inbox
- flow-open-record
- flow-option-sketch
- flow-outside-result
- flow-overlay
- flow-position
- flow-problem-statement
- flow-product-template
- flow-recommendation
- flow-reference-corpus
- flow-refusal
- flow-repository
- flow-resolved-target
- flow-scaffolded-product
- flow-stamped-claim
- flow-stray
- flow-surface
- flow-sweep-result
- flow-test-question
- flow-test-timings
- flow-toolchain
- flow-tour
- flow-trace-graph
- flow-trunk
- flow-worktree

## neutrality

ONE FUNCTION WAS DERIVED HERE, so one function was tested. The standing ones were not re-derived and are not re-judged.

### fn-run-a-governed-walk.guard-a-write — passed, on the second wording

THE QUESTION: could two honestly different designs both do this?

AT LEAST FOUR COULD, and they differ in ways that matter rather than cosmetically.

- A checker called inside each write verb.
- A pre-write hook the verbs share.
- A staging area where content is validated before it is committed.
- A content-addressed validator the write consults before storing.

THE FIRST WORDING FAILED THE TEST AND WAS CHANGED. It read "run the bound checks inside se_file_write and se_file_patch before the bytes land". That names two verbs, which is where the code goes rather than what the system must do, and it collapses the four candidates above to the first.

THE STATEMENT NOW SAYS check, refuse, land. No verb, no file, no mechanism.

### What the wording deliberately does NOT decide

WHERE THE CHECK RUNS. Inside the verb, beside it, or before it.

WHETHER THE RULES ARE READ PER WRITE OR CACHED. That is a cost question, and the cost is unmeasured — raid-asm-a-bound-check-runs-inside-the-write-budget.

WHETHER REFUSAL AND REPORT SHARE ONE PASS. They share one DECISION, which is why they are one function. Whether they share one traversal is a design matter.

ALL THREE ARE M4'S IF THEY ARE ANYBODY'S, and at minor M4 is struck, so they are settled in the build with the measurement in hand rather than argued in advance.

### The one place neutrality was hard to keep

THE TIME BUDGET SITS AS A CONTROL, not in the statement. A control is what the function is bound by; the statement is what it does.

Writing "check quickly" into the statement would have smuggled a performance design into a solution-neutral node, and "quickly" is a weasel word besides.

WHAT THE FUNCTION OWES BECAUSE OF THE BUDGET is a placement decision, and that sits in satisfies as req-a-check-too-slow-for-the-write-moves-to-the-sweep.

## follow_up

M3 CONTINUES at identify-assumptions, then probe-assumptions.

WHAT THIS STATE HANDS FORWARD.

- ONE NEW FUNCTION with four rows under it, and its own rationale for why the three nearest standing functions each declined them. Each was read in full before the gap was called real.
- THE ESCALATION CHECK WAS RUN AND CAME BACK NEGATIVE. A new function fitting no existing CLUSTER is the tell for a major. guard-a-write sits in the-walk, where serve-a-step, judge-a-claim, hold-the-method, resolve-a-path and catch-the-system-up already live. The architecture did not move.
- TWO STANDING REQUIREMENTS WERE RESCUED FROM ORPHANHOOD, and neither was this delta's. See anything_else.
- ONE CORPUS DEFECT GOES TO sweep-consistency. req-product-is-a-folder carries the heading "## Detail" twice, both times empty.
- TWO THINGS ARE OWED AT probe-assumptions, the only state left on this walk with web access.

NOTHING IS BLOCKED.

## anything_else

### Two standing requirements were served by no function

THE SUBMIT REFUSED, naming req-a-wrong-act-never-passes-silently and req-product-is-a-folder. Both are STANDING rows this delta does not touch. Both had a hole under them and nobody had noticed.

UNDER CONTRACT RULE 5 THAT IS NOT A FINDING TO RECORD AND WALK PAST. It is a hole in the thing under my hands, so it was fixed.

### req-a-wrong-act-never-passes-silently, minted at i27

It says a call violating a rule the engine holds is prevented, corrected and named, or refused with a remedy — and that zero violating calls complete reporting success.

IT WENT TO serve-a-step, whose statement is to hand the driver one instruction carrying everything that step needs. Naming a correction in the answer and refusing with a remedy are both what that instruction carries.

IT IS ALSO guard-a-write'S PARENT IN SPIRIT, and that is worth saying rather than hiding. The new function is this rule's write-shaped instance. Placing the general row on guard-a-write would have narrowed a requirement about every call to one about writes.

### req-product-is-a-folder, minted at i1

It says every artifact a product owns stays inside that product's root folder.

IT WENT TO stand-up-a-product, which already carries req-second-product-reuses-install and req-fresh-machine-runs. Its own breaks_if_removed says a second product bleeds into the first, which is that neighbour's exact subject.

### Why this check is the good kind

IT READ BOTH SIDES FROM DISK. Every function's satisfies list, and every standing requirement. Nothing was asked of me and nothing could be satisfied by naming something.

SO IT FOUND A HOLE NOBODY WAS LOOKING FOR, in rows minted at i1 and i27, surviving every milestone since.

THAT IS THE CONTRAST WITH THE THREE COVERAGE CHECKS BEFORE IT, which read one side from disk and one from my message, and which I satisfied three times by typing names. The difference is not rigour or intent. It is where the check reads its inputs.

req-a-coverage-check-computes-both-sides exists because of the first three. This state is the argument for it, made by the machine rather than by me.

### One corpus defect, not fixed here

req-product-is-a-folder carries "## Detail" twice, both empty. Fixing it is an unasked refactor under contract rule 2, so it goes to sweep-consistency, which is the state that owns exactly this.
