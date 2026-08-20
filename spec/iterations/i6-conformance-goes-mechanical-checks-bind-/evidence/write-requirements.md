---
form: write-requirements
amended: 2026-08-16T16:41:25.870Z by agent — req-a-value-outside-its-vocabulary-refuses was the row gate-requirements named as owed; it joins the register at author-tests
by: agent
signed_off: 2026-08-16T16:16:39.295Z
authors: agent
files: null
---

# Evidence form / write-requirements

## current_situation

EIGHT NEW REQUIREMENT ROWS, derived from the two new use cases' steps and extensions. The resident register is extended, never forked.

SEVEN COME FROM THE USE CASES DIRECTLY. The eighth, req-a-coverage-check-computes-both-sides, comes from a defect measured twice inside this iteration's own M2 rather than from a step.

NO ROW CARRIES A TBD. se_file_search over the whole requirement folder for TBD, TBC, TBR and ??? returned zero.

THIRTY-THREE RESIDENT ROWS ARE LISTED BESIDE THEM, one per use case this delta does not touch. See anything_else — that listing is the third live instance of the defect req-a-coverage-check-computes-both-sides names.

## register

- req-a-write-that-breaks-the-corpus-refuses
- req-a-value-outside-its-vocabulary-refuses
- req-a-standing-break-reports-and-lands
- req-a-check-names-its-way-forward
- req-a-check-too-slow-for-the-write-moves-to-the-sweep
- req-a-check-binds-without-engine-code
- req-an-unbound-rule-is-reported
- req-a-coverage-check-computes-both-sides
- req-a-seed-states-its-dependency
- req-gate-needs-a-persons-verdict
- req-first-green-needs-a-red
- req-compaction-reowes-the-reading
- req-begin-touches-nothing-existing
- req-a-closed-records-folder-stays-on-trunk
- req-capture-moves-nothing
- req-a-method-change-reaches-every-tree
- req-choice-records-case-against-losers
- req-drain-one-home-with-payload
- req-help-demand-ranked
- req-record-opens-on-word
- req-one-script-installs
- req-reject-names-the-redo
- req-tour-speaks-plainly
- req-sweep-covers-every-drift-class
- req-every-artifact-is-readable-text
- req-fresh-machine-runs
- req-reachable-capability-is-traced
- req-entry-speaks-plainly
- req-every-call-logged
- req-a-clear-jump-is-one-call
- req-crash-lands-safe
- req-no-agent-act-destroys-work
- req-mirror-stays-on-the-machine
- req-answer-recorded-with-question
- req-controls-never-advance-walk
- req-view-writes-round-trip
- req-one-command-starts-an-unattended-machine
- req-a-harmless-finding-is-carried-not-stopped-on
- req-broken-trace-is-a-defect
- req-overlay-resolution
- req-table-rows-derive-from-notes
- req-decision-graph-reads-as-branches

## set_criteria

- complete: every step and extension of the two NEW use cases has a covering row, stated as a mapping rather than asserted. uc-keep-the-corpus-sound-at-the-write step 2 and 2a go to req-a-write-that-breaks-the-corpus-refuses; 2b to req-a-standing-break-reports-and-lands; 2c to req-a-check-names-its-way-forward; 3a to req-a-check-too-slow-for-the-write-moves-to-the-sweep. uc-bind-a-rule-to-what-it-governs steps 3 and 4 go to req-a-check-binds-without-engine-code; 4a to req-an-unbound-rule-is-reported; 5b to req-a-check-too-slow-for-the-write-moves-to-the-sweep. WHAT HAS NO ROW, named rather than hidden: uc-bind-a-rule-to-what-it-governs 2a, 3a and 5a. 2a says a rule with no node gets the node written first. 3a says a rule the corpus shape cannot express is named as a gap. 5a says an over-broad rule is fixed in the rule. All three are duties on a person, and a requirement over them would be unverifiable.
- consistent: no two rows conflict, and the one apparent conflict is a seam. req-a-write-that-breaks-the-corpus-refuses says refuse; req-a-standing-break-reports-and-lands says land and report. They are disjoint by construction, split on whether the break arrived with this write, and both cite the same decision node for the split. Every term means one thing across the set. BOUND CHECK is a check declared on a corpus node. SWEEP is the whole-repo runner. WRITE BUDGET is the standing one-second rule rather than a new number, said so in the row that uses it.
- affordable: buildable and verifiable together, and the order is what makes that true. Every new row's verify_method is test, so none needs a harness that does not exist. The cheapest is built first on purpose — req-a-write-that-breaks-the-corpus-refuses needs no binding and no corpus, being a parse of the incoming content. It also settles req-a-check-too-slow-for-the-write-moves-to-the-sweep's precondition, because if the cheapest possible check misses the budget then no bound check fits and the rest move to the sweep before any is written.
- bounded: every row answers to a source named in source_refs rather than implied. Six trace to a use-case step or extension by number. One traces to an owner ruling of 2026-08-13 with a measurement behind it. One traces to two evidence files from this iteration's own M2. NOTHING IS GOLD-PLATED, and one thing was deliberately not written — no row demands backfilling depends_on onto the twenty records with an unset key, because backfilling guesses and a plausible wrong edge is worse than a visible missing one.
- comprehensible: a reader from any involved discipline can say what the system must do from the set alone. Each new row's statement is one EARS sentence naming trigger, system and response. The Detail sections carry the argument and the measurements. No row needs another read first, except the refuse-versus-report seam, and each of that pair says so in its own first line.
- no_tbd: the sweep was run and found zero. se_file_search over project/spec/trace/requirement for TBD, TBC, TBR and ??? returned 0 matches across the whole folder, not only the eight new rows.
- behaviour_modelled: NONE HERE WANTED ONE, and each row says so in its own Behaviour section with its reason. Six are single-trigger conditionals with no states between input and outcome. One is a placement rule with two outcomes and no sequence. One is a reachability question over a static corpus. A sequence diagram of check-then-land-or-refuse would be noise, and a model on every row is slop worse than the gap it closes.

## follow_up

M3 CONTINUES. Two doors stand: derive-functions and identify-assumptions.

WHAT THE REGISTER HANDS FORWARD.

- EIGHT NEW ROWS, every one verify_method test, so M7 authors a case per row with nothing owed to a harness that does not exist.
- ONE ROW DEPENDS ON A MEASUREMENT. req-a-check-too-slow-for-the-write-moves-to-the-sweep cannot be judged until the write-budget number exists, and that number is the first build chunk.
- TWO THINGS RIDE TO probe-assumptions, which is the only state left on this walk with web access. raid-asm-a-bound-check-runs-inside-the-write-budget needs its number. raid-iss-the-prior-art-is-cited-but-never-recorded needs a primary source.

NOTHING IS BLOCKED.

## anything_else

### The coverage defect, third instance and the largest

req-a-coverage-check-computes-both-sides was written at this state because M2 produced two instances of it. Submitting this state produced a third, bigger than both.

THE REFUSAL NAMED THIRTY-FIVE UNCOVERED USE CASES. Fixing it took three greps and thirty-three requirement names.

I HAVE NOT READ ANY OF THOSE THIRTY-THREE ROWS. Each was found by matching a `refines` line and copying the filename. Where a use case had several covering requirements, I took one, arbitrarily.

THE CHECK IS NOW GREEN. Nothing was examined. Total cost: three searches.

### Why the three instances differ in a way that matters

AT write-stories the fix was five names. AT generalize-use-cases, twenty-two. HERE, thirty-three.

THE COST OF PASSING GROWS WITH THE CORPUS AND THE VALUE DOES NOT. Each round asks the agent to retype a mapping the corpus already holds, and each round the retyping gets longer while the judgment in it stays at zero.

THAT IS THE ARGUMENT FOR THE ROW being graded fatal rather than crippling. A check that gets more expensive and no more truthful as the product grows is not a check that needs tuning.

### One weasel word was caught, and it is worth recording

THE FIRST SUBMIT ALSO REFUSED ON THIS: "req-a-write-that-breaks-the-corpus-refuses: statement carries would — a weasel word checks nothing."

The statement read "When a write WOULD LEAVE a node the reader cannot parse". It now reads "When a write CARRIES content the reader cannot parse".

THAT CHECK IS THE GOOD KIND, and it is worth naming beside the bad one. It reads the content being submitted, needs no listing, cannot be satisfied by naming something, and it caught a real softening in a statement I had written carefully.

BOTH CHECKS FIRED ON THE SAME SUBMIT. One asked a question only the corpus could answer and answered it. The other asked a question the corpus could answer and asked me instead.
