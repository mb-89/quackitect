---
form: gate-kickoff
bless: blessed by agent
by: agent
signed_off: 2026-08-16T15:34:45.829Z
authors: agent
files: null
---

# Evidence form / gate-kickoff

## current_situation

M0 IS DONE AND THE INBOX IS AT ZERO. The onboard-retro signed at 2026-08-16, thin on purpose: a desk retro ran minutes earlier and the field-feedback question was asked and answered there.

WHAT STANDS RIGHT NOW.

- 26 iterations seeded, 0 expeditions, 0 pending notes, 72 parked backlog items.
- i11 shipped at 4.3.0, carrying nine owed items past its own close. That close defect is fixed.
- i6 has been seeded since 2026-08-11 and has never been entered until today.

THE OWNER OPENED IT WITH A STANDING INSTRUCTION, and it widens the seed: spend this iteration mechanising. Everything that can become a check rather than a rule becomes a check.

THIS GATE PRICES THAT. Nothing below it re-opens the question.

## retro_drained

- note-e300e6bff8e3: carried into i6 — se-start.ts:253 demands an origin/it/<id> branch that i34 made meaningless, and it blocks the branch cleanup the owner asked for today
- note-c29050e2356a: carried into i6 — listBranches at worktree.ts:232 is exported with zero callers and drags a seven-path ref-stamp cache behind it

## goal

Conformance goes mechanical: checks bind to the named elements and run at the write, not at a review.

CONFIRMED UNCHANGED from the seed of 2026-08-11. The owner named this iteration by number on 2026-08-16 and added one direction rather than a new goal: mechanise everything that can be mechanised.

THE THESIS IN ONE SENTENCE, taken from the record itself: wherever a check asks a question a LISTING can satisfy, it is not yet mechanical — it is a form of paperwork.

## pulled_in

- The write-path conformance engine: checks bind to el- elements and dsp- design specs, ArchUnit's shape, per the parked design in note-d7a26094f592
- Conformance fires at the WRITE rather than at a later gate, per the owner direction in note-b93ad16c18a5
- Capability coverage disagreement: the requirement and its own test spec set different bars, and the looser one closes the gap without work — note-4c9a8806b8da
- The paint rules get a test pin: three deliberate choices are guarded only by comments today — note-b4544437d0c9
- The register gets checked against its node folder, REPORTING a named difference rather than refusing, because the owner ruled an orphan is not chased — note-8355729c239a
- Stories link a proving run: zero of 24 do today, and it is owed at the story-evidence state — note-4ffaba22ce7f
- depends_on becomes REQUIRED on the seed, so omitting it refuses and an empty list is a stated decision — owner ruling 2026-08-13
- Assertion-red: observe-red demands a failure for the RIGHT reason, telling ERR_ASSERTION apart from a crash, which is readable from TAP
- The compile-time trap check: no state may declare a demand it has no legal verb to supply — the shape behind three escapes in one walk
- The submit covers the route: a blessed gate must never leave the route held, per the owner ruling that a held route after a bless is illegal
- shipped lands at the front desk instead of stopping the walk where it stands
- The engine decides the test scope: the engine knows what files were touched and picks what re-runs, and the agent only calls the verb
- The cloud start checks the record folder on trunk instead of an it/* branch — carried note-e300e6bff8e3
- listBranches and its ref-stamp cache are deleted as dead code — carried note-c29050e2356a

## left_out

- The freshness half of the coverage checks — WAITS ON i18, which computes the impact set over the trace graph and has not shipped. Named in the seed, deliberately not attempted here.
- The cross-coupling check at the requirements gate — WAITS ON i18 AND i15. Neither has shipped, and the check needs both the impact set and the retrieval candidates.
- Mutation testing — the other half of assertion-red. Telling a real failure from a crash is mechanical. Proving a case CAN fail at all is not, and it wants its own iteration rather than a corner of this one.
- Deleting the it/* and claims branches — the owner's act, not the engine's. This iteration removes the code that blocks it and stops there.
- The three files still citing the dead i27 long id — deferred to this iteration's own sweep-consistency, where the cleanup states live.

## change_size

minor — the owner's ruling, 2026-08-16: "Go ahead with minor."

THE AGENT PROPOSED MAJOR AND THE OWNER CHOSE MINOR. The proposal and its counting stand above unchanged; this records the choice rather than rewriting the case for it.

WHAT MINOR STRIKES, counted row by row: 23 of 52. The whole of M4 and M5 go — the morphological chart, the seven finders, the parallel candidates, the Pugh convergence, the architecture evaluation. M6 goes with them, spikes included. So do gate-inputs, gate-candidates, gate-architecture, gate-prototype and run-demos. 29 rows walk.

WHY THE CHOICE IS SOUND, taken from the red team's own steelman. The design is already chosen: ArchUnit's shape, the fitness-function literature, and the owner's own write-path direction. Opening a design space over a decided design sends seven finders after an answer already on the page.

THE ONE THING MINOR GIVES UP, named so it is not lost. run-spikes is struck, and its own note says needing a spike is the tell for major. So the write-budget measurement does not get a spike state.

IT STILL HAPPENS, and earlier. raid-asm-a-bound-check-runs-inside-the-write-budget already places its probe at the FIRST build chunk rather than at a gate, on the reasoning that it cannot run before a check exists and must not wait until every check exists. Minor does not move it; it removes the ceremony around it.

IF THE NUMBER COMES BACK BAD, the walk escalates visibly rather than silently — that is what the column is for. The fallback is already named: the checks move to a batched runner and the write REPORTS the break instead of refusing it.

ONE ITERATION, NOT TWO. The owner took the whole scope as one with the same word. The fourteen pulled-in items stay together.

STRIKES NAMED: the 23 rows above, all of them M2 through M6 design-space and prototype rows, plus M8's run-demos.

## round_0_verify

- evidence vs claims: PASS with one correction already made. The onboard-retro's claims were checked against the corpus rather than asserted. One node had been closed on a false reading of the two i27 folders; it was re-opened as a fork, checked against disk, and corrected in the retro's own anything_else. Its five call-log counts come from se_log_query, not from memory.
- types: NOT RUN, and nothing here changes code. M0 produced one new file, a raid node, which carries no types. The standing type baseline is i11's verification at 4.3.0.
- lint: NOT RUN, same reason. The one new file is markdown with frontmatter, and its shape was copied from a standing raid node rather than invented.
- tests: NOT RUN, deliberately. The test discipline says a run answers a question; M0 changed no behaviour, so there is no question. A battery here would reassure rather than answer, and the battery is earned.

## round_1_validate

- exercised against the goal: YES, and the scope was cut to fit it. Every one of the fourteen pulled-in items is a rule today that becomes a check. The three left-out items are the ones that cannot become checks yet because the machinery they bind to has not shipped.
- missing: ONE THING, and it is named rather than absorbed. The record carries no answer for what happens when a bound check FAILS on a write the agent must make to fix the very rule it breaks. That is the self-hosting case and it bit this project before, at observe-red blocking its own iteration. It belongs to M3's requirements, not to this gate.
- wrong: NOTHING FOUND in the seed's own scope. The seed's two waiting parts were checked against the container: i18 and i15 are both still seeded and unshipped, so the waits are real and current rather than stale.
- out of scope: THE BRANCH DELETION ITSELF. The owner asked today whether the it/* and claims branches can go. This iteration removes the code that blocks it — se-start.ts:253 — and does not delete anything. Deleting is the owner's act.
- prior art: MADE FOR THE SIZING, NOT YET FOR THE SUBJECT, and the difference is stated rather than blurred. For sizing, Semantic Versioning 2.0.0 (semver.org) is the comparison: it does better on being universally understood and needing no local table, and it is what put depends_on at major. What ours sheds is that semver sizes a RELEASE and stops there — it has no concept of how much engineering rigor a change earns, and the rigor matrix binds the size to a walk of 52 states or 29. For the SUBJECT — fitness functions and ArchUnit's shape — no comparison has been made and it is a finding, not a blank. The record cites Ford, Parsons and Kua and a Thoughtworks article, recorded 2026-08-11. Nobody here has run ArchUnit or any comparable tool, so no claim about what it does better may be made yet. That comparison is owed to M4's prior-art finder, where it is that state's whole job.

## round_2_red_team

- STEELMAN FOR MINOR, argued at its strongest => The design is already chosen. The record names ArchUnit's shape and the fitness-function literature, and the owner directed the write path himself. Opening a morphological chart over a decided design produces seven finders searching for an answer already on the page, and M5 then converges a Pugh matrix over candidates nobody intends to build. That is 23 states of ceremony, and the owner's standing complaint is that too much agent time goes to unproductive work. Under this reading major is not rigor, it is the exact failure the complaint names.
- THE ANSWER TO THE STEELMAN => It is right about the checks and wrong about the seam. WHERE the checks live is decided. WHETHER they can live inside a write is not, and that is an architecture question with a measurable answer nobody has taken. If the measurement comes back over a second, the whole write-path premise falls and the fallback is a batched runner — a different architecture, reached after the code is written, which is the expensive order.
- THE KILL-CRITERION, named as the gate demands => Major is the wrong call if the write-budget probe can be taken CHEAPLY and EARLY without opening M4 and M5. If one armed check can be timed in an afternoon, the unknown collapses, and with it the only argument that survives the steelman.
- LOOKING FOR IT, honestly => It is partly true. The probe as written needs one bound check and two timings, which is small. What it does not answer is what to do if the number is bad, and that is where a design space genuinely opens: batched runner, sampled checking, incremental corpus index, or checks at the commit rather than the write. Those are four candidates and choosing between them is M4's job.
- SO THE PROPOSAL IS CONDITIONAL, and the gate should know it => Major is right if the owner wants the fallback designed before it is needed. Minor is right if the owner accepts taking the measurement first and re-opening the size only if it comes back bad. The machine supports the second: the walk escalates visibly when work outgrows its column.
- A SECOND ATTACK, on scope rather than size => Fourteen pulled-in items is a lot, and they are two different things. Items one through seven are the conformance system. Items eight through fourteen are unrelated mechanisation fixes with no shared design. A reader could fairly call this two iterations wearing one name, and whether it is one or two is the owner's call under the record rule, not the agent's.

## raid_additions

- raid-asm-a-bound-check-runs-inside-the-write-budget

## verdict

pass — the scope is settled, the size is chosen by the owner, and the one assumption it rests on is on the register with a probe.

THE TWO QUESTIONS THIS BRIEF CARRIED TO THE BLESS ARE BOTH ANSWERED, by the owner on 2026-08-16.

- MAJOR OR MINOR: minor. The agent proposed major and the case for it stands above; the choice is the owner's and this is it.
- ONE ITERATION OR TWO: one. The whole fourteen-item scope was taken with the same word.

WHAT THIS VERDICT CLAIMS. That the scope hides nothing, that both columns were counted row by row rather than estimated, and that the disagreement between the proposal and the choice is recorded rather than smoothed over.

WHAT IT DOES NOT CLAIM. That minor is certainly right. The agent's case for major is preserved above at full strength, and the escalation path exists precisely because a column is a prediction.

THE ONE CARRIED RESERVATION, stated once and then dropped: under minor there is no spike state, so the write-budget number gets taken inside the first build chunk with no ceremony around it. If it comes back over a second, four candidate architectures open with no M4 to choose between them, and the walk escalates.

## follow_up

M1 OPENS. The blessed minor column compiles into i6's state machine and pins to the record.

THE OWNER'S EXECUTION DIRECTION, 2026-08-16: do as much as possible unattended, no progress reports, stop only when blocked. That is the standing mode for the rest of this walk.

WHAT IS QUEUED BELOW.

- The write-budget probe, at the first build chunk. It is the one measurement that can re-open the column.
- The three files citing the dead i27 long id, deferred to sweep-consistency.
- The prior-art comparison for fitness functions and ArchUnit, still owed and explicitly not made here. Under minor its usual home at M4 is struck, so it lands at M3's requirements instead — a requirement bound to a shape nobody has compared is the same defect one milestone later.

NOTHING IS BLOCKED BY ANYTHING OUTSIDE THIS ITERATION.

## anything_else

ON THE OWNER'S PACE COMPLAINT, because this brief proposes the expensive column and the complaint is standing.

The complaint was that too much agent time goes to unproductive work. This gate's answer is that the unproductive time in the last walk was not spent in M4 or M5 — those were struck. It was spent re-deriving standing claims, closing nodes nobody opened deliberately, and answering questions no verb reports on.

That is this iteration's own subject. A rigor column is not where that cost lives.

Stated here rather than in the size rationale, because it argues for the iteration and not for the column, and mixing the two would dress a preference as a measurement.
