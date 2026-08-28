---
form: write-requirements
by: agent
signed_off: 2026-08-24T16:05:28.067Z
authors: agent
files: null
---

# Evidence form / write-requirements

## current_situation

Three use cases stand for the delta, and one standing use case gained an extension rather than a new case being minted.

Six requirement rows are written. Each names its kind, its verify method, its measure and what breaks without it.

The resident register is extended and never forked. No standing row is rewritten.

## register

- req-the-engine-holds-what-it-launched-and-asks-whether-it-exists
- req-a-run-closes-its-own-entry-when-its-process-exits
- req-settling-an-entry-is-idempotent-and-the-first-outcome-stands
- req-every-wait-declares-a-bound-and-expiry-acts
- req-one-instance-holds-a-folder-and-its-port
- req-registering-a-spawned-hand-is-accepted-wherever-the-walk-stands

## set_criteria

- complete: every step and extension of the three new use cases has a covering row, and the registration goal is covered by extension 6e of uc-let-the-machine-name-the-driver. What has NO row: how long a completed task's file is kept. That is a decision rather than a demand, and it is recorded at M5 record-adrs.
- consistent: no two rows conflict. One term was pinned deliberately to keep it that way. SETTLE means to mark an entry finished with an outcome, and it is used in that one sense by all three closing rows. CLOSE was avoided because it also names what a person does to a record.
- affordable: buildable and verifiable together. Five of the six rows are engine-local and verify by test against the job table. The sixth needs a real port bind, which the suite already does elsewhere.
- bounded: every row answers to a source and nothing is gold-plated. The one place a wider row was tempting is the widening: it is written per argument rather than per verb, which is narrower than the goal's own wording and deliberately so.
- comprehensible: a reader from any involved discipline can say what the system must do from the set alone. Each row's Detail carries a table rather than prose, and the two systems the design was compared against are named in the row that borrows from them.
- no_tbd: the sweep ran over spec/trace/**/*.md for TBD, TBC, TBR and three question marks. Zero found, and that is a count rather than a claim.
- behaviour_modelled: NONE HERE WANTED ONE, and each row says so in its own last line. The candidate was the two-closer race in req-settling-an-entry-is-idempotent-and-the-first-outcome-stands. It was rejected because the model would have two participants and one write, which the row's table already states completely. There is no missing transition and no participant nobody creates.
- quality_groups_swept: functional suitability — covered, all six rows; performance efficiency — touched, the interval costs one ask per held handle per period and the row names it; compatibility — touched, the existence question differs by platform and that is the open assumption; interaction capability — not touched, no surface changes; reliability — covered, this whole set is a reliability change and the fault tolerance is the two-closer design; security — not touched, nothing changes what may be launched or by whom; maintainability — touched, one term pinned and one verb narrowed rather than widened; flexibility — not touched, no new host or configuration surface; safety — touched, ending a live process is the harm and the existence-not-responsiveness ruling is the mitigation.

## follow_up

The next states derive the function structure and sweep the requirements for what they lean on.

One assumption is already standing and will be swept there: raid-asm-a-launched-process-can-be-asked-whether-it-still-exists. Its probe is written and its POSIX half has never run on any machine that has run this engine.

One thing the requirements deliberately do not decide is how long each bound should be. That is a measurement, and naming it here would be a value with no source.

## anything_else

