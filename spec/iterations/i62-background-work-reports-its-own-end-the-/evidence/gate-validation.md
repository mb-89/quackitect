---
form: gate-validation
bless: blessed by agent
by: agent
signed_off: 2026-08-24T17:29:58.975Z
authors: agent
files:
---

# Evidence form / gate-validation

## current_situation

The implementation gate is signed and blessed. The consistency sweep is signed. The tree is green at rest: 1,816 cases, 157 suites, no failures.

This gate asks a different question from the last one. Not whether the code is right, but whether it meets the need it was opened for.

A reviewer with no shared context is reading the delta against that question while this form is filled. Its findings land in the red-team field.

The decks of all three stories this record minted are filled with the report of their real runs. Two of them are must stories.

## meets_need

- vp-autonomy-range: served, and it is the one this record was opened for. Both must stories refine it, and it gained two success criteria that i62 then met. "No walk is held by a record of work that has already finished" — two closers now stand where none did. "Every wait an unattended walk enters carries a duration, and expiry acts" — every entry declares a bound and expiry produces an outcome naming it. Its first criterion, an unattended walk stopping at gates and nowhere else, is what the whole record serves: the measured fault was a walk held by an entry whose process was already gone.
- vp-the-engine: untouched, and the record's own delta says so. Nothing here changes what a drawn machine means, who blesses, or what evidence is owed. What changed is that the engine stops lying about work it launched, which is a correctness claim about an existing promise rather than a new one.
- vp-rigor-without-toil: untouched, and fine. Its nearest criterion targets sub-second answers, and the sweep rides the answering loop, so it COULD have breached that. It does not, and the measurement is on record: twenty handles in 78 microseconds, a hundred in 147. Not harming a promise is not serving one.
- vp-the-ledger: untouched as a promise, fed as a practice. Ten register entries were minted or re-read, including one risk this record added against its own design. That is the ledger being used rather than the proposition changing.
- vp-systematic-engineering: untouched as a promise, honoured as a process. Its criterion that every mechanized test is observed failing before it first passes was met — each case carries the note saying what it was red about. That is the machine working on i62, not i62 working for the proposition.
- vp-qualities: untouched by claim, touched in fact at one criterion, and this line is the reviewer's observation rather than the record's. Its recovery criterion targets one turn from a typed refusal to an accepted call. The registration exemption removed a refusal that had NO accepted call in the state where it fired, which was the fault measured on this record's own first milestone.

## musts_demonstrated

- sty-the-run-that-died-while-nobody-was-holding-it: demonstrated, and its five decks carry the run. Its own sentence asks that the engine notice within one interval and close the entry, so the walk is never held by a record of something that no longer exists. A real process was killed and its entry read settled on the next account read. A real process left alive and silent was left running, because silence is not evidence of death. A run that exited normally closed its own entry before any sweep ran, proven by forcing a sweep first and finding nothing left for it to close.
- sty-the-wait-that-says-how-long-it-will-wait: demonstrated, and its four decks carry the run. Its own sentence asks that a wait carry a duration and do something when it expires, so a walk on a machine nobody watches can never sit for ever. An entry came back from the account carrying its bound and the word saying where the figure came from. A one-millisecond bound expired and the outcome read `bound reached after 1 ms, measured`. The process was not touched. What the run also showed is the half the first build got wrong: after the expiry the work reported for real, and the entry came back carrying `passed` instead.

## market_tier

Not a market iteration, so the expensive real-world tier does not apply.

This record's audience is the agent and the engineer driving it, and everything it changed is internal to the engine. Nothing reaches a market surface.

## round_0_verify

- evidence vs claims: every claim in this form is quoted from the node it is about or from a run on this machine. Three stale claims were found and fixed while filling it: two stories citing line numbers that had moved, and a design note asserting nothing reachable could throw.
- types: clean. The typechecker runs after every edit and its last answer carried no error.
- lint: clean, with no suppression added.
- tests: green. 1,816 cases, 157 suites, 0 failures, 111 seconds. A scoped run over the two changed test files is green beside it.

## round_1_validate

- exercised against the goal: yes, and by running rather than reading. Three assumptions were probed with a real script and one changed a design choice. The story decks carry the runs.
- missing: two things, both found and both closed. The retention ruling the scope had promised and nobody had written — seven days after settling, now in the work-account design spec. And the leaving judgment, absent from the design spec although it is the entry class the record was opened about.
- wrong: the requirement said the handle is asked at a fixed interval and no interval was built. The words were stale rather than the build: riding the read runs before any answer reaches a reader, which is sooner than an interval and costs nothing when nobody is asking. The statement and the measure now say that, with the honest limit named.
- out of scope: nothing widened. Three stories belonging to OTHER records also have unfilled decks and were left alone deliberately, because this gate is scoped to the delta.
- prior art: the engine already closed what a previous engine left behind, at startup only. This record covers what dies while the engine is still running.

## goals_served

- The engine holds the live end of every process it launched and asks it, on a fixed interval, whether it is still there.: served. The registry keeps the handle and the number, and asks on the reads that compose the account.
- Silence past that interval ends the process and closes its entry.: served differently, and deliberately. The sweep asks whether the process EXISTS, never whether it answered, and it never ends the process. Only existence can be asked of an arbitrary child, and this engine launches shells and test runners that were never written to reply. The reasoning stands in raid-risk-the-heartbeat-ends-a-process-that-is-alive-but-quiet.
- A test run closes its own entry when the process behind it exits, so the heartbeat is a backstop and not the only guard.: served, for every kind of run rather than only a test run. The story's fourth deck carries the discriminator that proves the exit did it rather than the sweep.
- No wait is silent. A wait carries a duration, and expiry does something rather than nothing.: served. Every entry carries a bound with its provenance, and expiry ends the wait without ending the work.
- How long a completed task's file is kept is decided first, and only then is the clearing built.: served as a RULING only. Seven days after settling, in dsp-the-work-account.md, with its reasoning and with who chose it. The sweep that acts on it is a named non-goal.
- One engine holds a given folder and its network port, and a second one that cannot bind says so instead of running on half-alive.: served, and demonstrated across two real processes rather than one. The story's decks carry the run and the crash-restart probe.
- Registering a spawned hand works from wherever the walk stands.: served, and the verb that carries it now teaches it. This record's own M0 was where the fault was measured.

## bound_breaches

- if-agent-harness-to-entrypoint: no breach. Nothing this record changed alters what crosses that boundary. The entrypoint gained one blocking call before it serves, which is inside it rather than across it.

## round_2_red_team

- The requirement says the handle is asked AT A FIXED INTERVAL, and the build has no interval — the sweep rides the reads that compose the account, so the measure "gone for longer than one interval" has no referent => Fixed, and the words were corrected rather than the mechanism. Riding the read is SOONER than an interval, not later: no answer can report a process that was already gone when the answer was composed, which is what the measure now says. An interval would also ask on an idle machine where nothing reads the result. The statement, the measure and a new section naming the choice and its honest limit are in the requirement.
- The design spec never mentions the leaving judgment, which is the entry class the record's own opening measurement was about, and which has neither handle nor number => Fixed. The spec now names it beside a registered hand as a clock-only entry, and says why that is not a gap: the judgment settles its own entry when it resolves, exactly as a run does on exit, so the bound only matters where that never happens.
- The bound is absent from the account's declared type and reaches a reader only through an untyped spread, and the one case for it asserts on the job listing through a cast => Fixed. The account entry declares both fields, and a new case asserts them on the ACCOUNT, which is what a pulling agent actually reads. That is where the wait story's first step had to be pinned.
- The floor between two asks is exercised by no case; every case that needs a sweep at an exact moment forces one => Accepted and named in the design spec with its reason. Observing it means proving an ask did NOT happen inside a window of milliseconds, on a box running 180 test files at once, so every shape of that case is decided by scheduling rather than by the code. Being wrong costs 78 microseconds per twenty handles. A flaky case is the worse trade. The production path IS pinned: a case kills a real process and reads the account without forcing anything.
- The three story decks still read EMPTY UNTIL M8 => Stale by the time it was written. All three were filled with the report of their real runs while the review was in flight, and the corpus sweep is green over them. The reviewer read them before the fill and could not have known.
- The retention number was chosen by the agent alone and the owner may want it back => Agreed, unchanged, and raised again here rather than buried. It is the single item most worth the owner's eye. Nothing acts on it yet, so moving it costs nothing.
- vp-qualities' recovery criterion was touched without the record claiming it => Accepted as the reviewer's observation and now recorded in meets_need. The registration exemption removed a refusal that had no accepted call in the state where it fired.
- No case runs on Windows => Accepted risk, unchanged and not introduced here. It is the standing condition of this tree.

## raid_additions

- spec/trace/raid/raid-risk-one-blanket-bound-is-given-to-work-nobody-measured.md
- spec/trace/raid/raid-iss-a-finished-run-keeps-reporting-itself-as-running.md
- spec/trace/raid/raid-risk-the-heartbeat-ends-a-process-that-is-alive-but-quiet.md
- spec/trace/raid/raid-risk-two-closers-reach-one-entry-and-disagree.md
- spec/trace/raid/raid-risk-two-engines-run-one-folder-and-neither-says-so.md
- spec/trace/raid/raid-risk-the-one-engine-guard-locks-out-a-restart-after-a-crash.md
- spec/trace/raid/raid-risk-widening-a-verb-s-legality-weakens-the-state-gate.md
- spec/trace/raid/raid-asm-a-launched-process-can-be-asked-whether-it-still-exists.md
- spec/trace/raid/raid-asm-asking-every-held-handle-on-an-interval-costs-nothing-measurable.md
- spec/trace/raid/raid-asm-a-crash-releases-whatever-carries-the-workspace-hold.md

## verdict

pass — both must stories happen end to end and carry the report of their real runs, and the one shortfall a fresh reader found was a stale requirement rather than a missing behaviour.

What argues against it, first. A reviewer with no shared context found that the requirement demanded a fixed interval the build does not have, and that the implementation gate had called that goal served without noticing. I resolved it by correcting the requirement, which is the right call on the merits and is still an author grading his own paper. If the interval was genuinely wanted, this verdict is wrong and the requirement now hides that.

The second argument against. The retention number that this record's scope promised was chosen by me, alone, at the previous gate. It governs deletion. The reviewer agrees it is the item most worth the owner's eye, and I agree with the reviewer.

The third. The floor between two asks has no case, and I chose to name it rather than cover it. That is a judgment about flakiness, not a proof.

What carries the pass. Every criterion this record added to its value prop is met and pinned. Both must stories were judged against their own sentences, and the decks now carry runs on this machine rather than arguments. Every one of the reviewer's four fixable findings is closed, and the two it raised as accepted risks are recorded with what being wrong would cost.

## follow_up

- BUILD THE SWEEP THAT CLEARS THE COMPLETED-TASK PILE. The number it needs is decided: seven days after settling, in dsp-the-work-account.md. Ready when a record is opened for it.
- MEASURE A BOUND PER KIND OF WORK. Everything carries the same default today. Ready when a week of settled entries has been counted.
- FILL THE DECKS OF THE THREE STORIES BELONGING TO OTHER RECORDS. sty-the-step-that-hands-the-walk-back, sty-ask-once-what-is-still-running and sty-a-documents-edit-does-not-fire-the-whole-battery all still say EMPTY UNTIL M8. Ready when each of those records reaches its own validation gate.
- PIN THE GATE'S ORDER AROUND THE REGISTRATION EXEMPTION. Captured as a note. Ready when the state gate is next opened.

## anything_else

