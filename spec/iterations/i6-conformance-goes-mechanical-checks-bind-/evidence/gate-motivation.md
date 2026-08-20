---
form: gate-motivation
bless: blessed by agent
by: agent
signed_off: 2026-08-16T15:45:36.125Z
authors: agent
files: null
---

# Evidence form / gate-motivation

## current_situation

M1 IS COMPLETE. Four states signed: draft-vision, log-risks, frame-delta, scope-non-goals.

WHAT STANDS FOR THIS GATE TO JUDGE.

- Four goal conflicts named and ruled.
- Eight register entries, six from M1 and two from this gate.
- Two standing value props extended, each with mechanical pass lines.
- A scope of fifteen items in a binding ORDER, with seven non-goals.

THE SCOPE GREW BY ONE AT THIS GATE, and it is a correction rather than a widening. See prior_art_positioned and raid-iss-se-lint-has-no-whole-repo-sweep.

## vision_scope_stated

THE PACKET IS COMPLETE FOR A MINOR, and what a minor drops is dropped mechanically rather than answered briefly.

### What the form dropped, and why that is right

- THE BIG IDEA, THE TO-BE WORLD AND THE PITCH. A minor cannot move them. A product whose identity changed is not a minor.
- THE GAP CLAIM AND THE WHY-NOW. They stand from the resident frame, per the owner ruling of 2026-08-13.

### What was answered in full

- THE GOAL SYSTEM, with four conflicts named openly and each ruled. The one question a delta can genuinely re-open.
- THE REGISTER, opened with owners and triggers on every entry.
- THE DELTA'S NEW NEEDS, written into the two standing value props as artifacts, each with its pass lines.
- SCOPE AND NON-GOALS, at vision level, with the build order made binding.

### The escalation check the state guidance demands

A DELTA NEEDING A NEW GOAL IS ARGUING FOR A NEW VISION, and must escalate.

CHECKED DELIBERATELY. Every goal this delta serves is a standing one. It changes WHEN they are enforced and BY WHAT. It does not change what they are, and it authors zero new value props.

NO ESCALATION IS OWED.

## problem_agreed

THE DELTA IS REAL, AND THIS WALK MEASURED IT ON ITSELF RATHER THAN ARGUING IT.

### The problem in one line

A rule that can be read and still broken was never a promise kept. It was a promise stated.

### The evidence, taken live inside this iteration

TWO CHECKS FIRED ON THE SAME AUTHOR, in the same session, against the same corpus, one state apart.

THE ABSENT ONE. At log-risks, four raid nodes were written. One carried an unquoted colon inside a YAML scalar. The write returned created: true and a hash. Nothing complained.

The next pull threw whole, naming a line and a column in no particular file. Four calls to find the file, scan the other three for the same shape, and patch it.

THE PRESENT ONE. One state later, the same corpus refused a submit: SE-C-112, naming five failures across two nodes at once, each with the section it wanted and an executable remedy. One call to satisfy.

FOUR CALLS AGAINST ONE. Same person, same session, same corpus. The only difference is whether a check stood where the break was made.

### Why this is worth building rather than living with

THE RULE WAS NOT UNKNOWN. YAML scalars containing a colon must be quoted, and every writer of frontmatter knows it. Knowing it did not help.

THAT IS THE PATTERN, AND IT IS MEASURED ELSEWHERE TOO. depends_on's rule stood in the seed tool's own argument description, unmissable, and the key was still missed on three records out of twenty-seven seeded. The guidance was read and the rule was broken anyway.

A RULE BROKEN THAT WAY WANTS A REFUSAL, NOT ANOTHER SENTENCE. That sentence is the goal, and both measurements are of the same thing.

### The goal is worth having

BECAUSE THE ALTERNATIVE IS NOT NO CHECK, IT IS A LATER CHECK. Every one of these breaks is caught eventually — at a gate, at a thrown pull, by somebody reading. The question is only how far from the author.

Boehm's finding is already in this corpus at ref-boehm-cost-of-change: a defect's cost grows by orders of magnitude with each phase it survives. This delta is that finding applied one grain finer than a phase — to the individual write.

## prior_art_positioned

THE COMPARISON HAS NOT BEEN MADE, AND THAT IS THIS GATE'S FINDING RATHER THAN A BLANK.

### What is claimed, and by whom

THREE PLACES CITE THE SAME PRIOR ART: the i6 record vision, note-d7a26094f592 from 2026-07-28, and the kickoff gate.

All three trace to the note, which says: "Ford, Parsons and Kua on evolutionary architecture; the Thoughtworks fitness-function article; ArchUnit as the concrete form (architecture conformance written as ordinary unit tests)."

### What is recorded

NOTHING. project/spec/references/ holds 25 reference nodes with url, version and accessed. Searched for fitness, ArchUnit, Ford, Parsons, Kua, conformance and architecture: 20 hits, none of them an entry for any of the three.

SO THE ARCHITECTURE IS BORROWED FROM A PARENTHESIS. "Architecture conformance written as ordinary unit tests" is one clause in one note, with no URL, no version, and no primary source. Nobody here has run ArchUnit.

### What can honestly be said, and what cannot

CAN: our own record chose ArchUnit's shape as the concrete form, on 2026-07-28, with the owner's agreement. That is evidence of a CHOICE.

CANNOT: anything about what ArchUnit does better. A characterisation we wrote about a tool we have not run is not evidence about the tool.

THE AXIS IS VISIBLE EVEN SO, and it is the delta. Their shape runs conformance in a test suite. Ours runs it in a write verb.

A TEST SUITE HAS A SECOND TO SPARE AND A WRITE DOES NOT. If the borrowed characterisation is right, then this iteration's central departure and its central unprobed assumption are the same thing, which is worth knowing before building.

### Where it closes, named rather than wished

AT probe-assumptions, M3. Checked against all 52 rigor-matrix rows: four grant se_web_search, and three of those are behind us or struck at minor. probe-assumptions is the one remaining state on this walk that can reach a primary source.

raid-iss-the-prior-art-is-cited-but-never-recorded carries it, with the trigger set there.

THE ROUTING ITSELF IS A FINDING FOR THE RETRO. A milestone that positions against prior art and a milestone that can reach prior art should be the same milestone. They are not.

### One scope correction came out of the same read

Reading note-d7a26094f592 in full, rather than the record's summary of it, surfaced a second half the scope had dropped: se_lint takes one file per call and has no whole-repo sweep, though its own description promises one.

THE RETRO HAD ALREADY DRAINED THAT INTO THIS ITERATION on 2026-08-13, naming the gap explicitly. The kickoff's fourteen-item list simply missed it, because the list came from the record's vision and the vision quotes only the note's first half.

IT IS NOW ITEM FIFTEEN, on the register as raid-iss-se-lint-has-no-whole-repo-sweep. Three of the four checks the pool named are corpus-wide and have no runner without it.

A SCOPE DERIVED FROM A SUMMARY INHERITS WHAT THE SUMMARY DROPPED. That is the lesson, and it is the same shape as everything else on this page.

## success_measurable

EVERY NEW NEED CARRIES ITS PASS LINES, and they are on the artifacts rather than in this form.

### vp-rigor-without-toil

THE NEED: a broken rule costs one refusal, not a hunt.

- Metric: lane calls spent recovering from a break a write-time check could have refused. Target: zero.
- Metric: corpus-shape rules enforced by a check rather than by prose, as a share of all of them. Target: rising, retro over retro.

### vp-the-engine

THE NEED: a write refuses a break — the fourth consequence the drawing attaches, beside a state refusing tools and a gate refusing passage.

- Metric: a write that leaves the corpus unreadable by the engine's own reader. Target: none.
- Metric: engine code changed to add a new bound check. Target: none.

### Why these pass the record's own test

THE TEST: could an agent pass this while examining nothing?

- THE FIRST METRIC IS TAKEN FROM THE CALL LOG, which se_log_query already reports by outcome and clause. No listing step.
- THE SECOND COMPARES TWO ENUMERABLE SETS — the rules stated in guidance against the checks the engine registers. Both sides machine-readable, the comparison total.
- THE THIRD IS A PARSE. Either the reader reads the corpus or it throws.
- THE FOURTH MIRRORS vp-the-engine's OWN FIRST CRITERION on purpose. A drawn machine compiles with zero engine code; a check that needs engine code to exist is a check nobody will add.

NONE OF THEM CAN BE SATISFIED BY ASSERTING SOMETHING.

## risks_logged

THE REGISTER IS OPEN WITH EIGHT ENTRIES, every one carrying an owner and a trigger.

### From the kickoff gate

- raid-asm-a-bound-check-runs-inside-the-write-budget. Assumption, crippling, plausible. The load-bearing one, and the only one that can move the architecture.

### From log-risks, one per ruled goal conflict

- raid-risk-a-bound-check-refuses-the-write-that-fixes-it. Risk, crippling, likely. Distinct from the standing raid-dec-the-walk-never-reaches-a-state-it-cannot-leave, which covers a STATE rather than a check.
- raid-dec-a-check-refuses-a-wrong-write-and-reports-a-wrong-corpus. Decision, with four rejected options and its consequences.
- raid-dec-a-seed-states-its-dependency-or-refuses. Decision, with four rejected options and its consequences.
- raid-risk-the-small-fixes-crowd-out-the-conformance-system. Risk, crippling, plausible. Its mitigation is the binding build order.
- raid-iss-a-write-can-leave-the-corpus-unparseable. Issue, and it fired inside this walk rather than being predicted.

### From this gate

- raid-iss-the-prior-art-is-cited-but-never-recorded. Issue, crippling, certain. Triggered at probe-assumptions.
- raid-iss-se-lint-has-no-whole-repo-sweep. Issue, crippling, certain. Triggered at the first corpus-wide check.

### What is NOT on the register, checked deliberately

raid-dec-the-walk-never-reaches-a-state-it-cannot-leave was read and NOT duplicated. It covers a state declaring a demand it cannot supply, which the compile-time trap check enforces. A check is not a state — it fires inside a verb, against whatever file is under the hand — so that gap got its own risk instead.

## round_0_verify

- evidence vs claims: PASS, and one claim was disproved by opening what it pointed at. The record says "prior art already researched". Following it to project/spec/references/ found no entry for any of the three sources. That became raid-iss-the-prior-art-is-cited-but-never-recorded rather than a sentence saying prior art exists. Every measurement quoted in problem_agreed comes from this session's own call log and rejection payloads, not from memory.
- types: NOT RUN. M1 changed no code. Eight markdown nodes and two value-prop edits, none of which carry types.
- lint: NOT RUN as a tool, and PARTIALLY EXERCISED as a mechanism. The corpus's own submit check refused this milestone's first log-risks submit with SE-C-112, naming five missing sections across two decision nodes. That is the lint that exists, it fired, and the nodes were fixed before the state signed.
- tests: NOT RUN, deliberately. The discipline says a run answers a question. M1 changed no behaviour, so there is no question, and the battery is earned rather than free. The standing baseline is i11's verification at 4.3.0.

## round_1_validate

- exercised against the goal: YES. The goal says checks bind to named elements and run at the write. M1's output is a scope in which the first thing built is a check, the first thing measured is whether a check fits in a write, and every check declares refuse or report before it ships. Nothing in M1 defers the goal's own question.
- missing: ONE THING WAS MISSING AND IS NOW IN. The scope had fourteen items and should have had fifteen. se_lint has no whole-repo sweep, three of the four pool checks are corpus-wide, and without a sweep they have no runner. Found by reading note-d7a26094f592 in full rather than the record's summary of it. Now raid-iss-se-lint-has-no-whole-repo-sweep.
- wrong: NOTHING FOUND WRONG, and two things were checked rather than assumed. The seed's two waiting parts were checked against the container — i18 and i15 are both still seeded and unshipped, so the waits are current. The standing trap decision was read in full before this iteration declined to duplicate it.
- out of scope: THE PRIOR-ART COMPARISON ITSELF, from this state. gate-motivation grants six read verbs and no web access. That is not a reason to write a comparison from memory; it is a reason to route it, and it is routed to probe-assumptions with the register entry to carry it.
- prior art: NOT MADE. Stated in full in prior_art_positioned above rather than summarised here. The short form: three sources are cited in three places, none is recorded in the 25-node reference glossary, nobody here has run ArchUnit, and no claim about what it does better may be made until somebody does. What CAN be said is the axis — their shape runs conformance in a test suite and ours runs it in a write verb, and a test suite has a second to spare where a write does not.

## round_2_red_team

- STEELMAN AGAINST THIS WHOLE DELTA, at its strongest => Checks at the write are a well-known trap. Every team that has put a slow validator in the hot path has ended up with a flag to skip it, and the flag is always on. The correct place for corpus conformance is a sweep somebody runs, or CI — which is exactly where ArchUnit put it, and ArchUnit is the design being borrowed. Under this reading the iteration is departing from its own prior art on a hunch, and the departure is the part nobody measured.
- THE ANSWER, and it concedes half => The steelman is right that a slow check in the write path is fatal, and that is why the write-budget measurement is the FIRST thing built rather than a gate item. It is wrong that the sweep is the alternative: raid-iss-se-lint-has-no-whole-repo-sweep puts a sweep in scope as the reporting half. The two are not competing. The write refuses what this write broke; the sweep reports what the corpus has been carrying.
- IT IS ALSO RIGHT ABOUT THE FLAG, and the answer is already ruled => raid-dec-a-check-refuses-a-wrong-write-and-reports-a-wrong-corpus rejected "the author chooses" for exactly this reason. A check that can be waved through is a report with extra steps. That option was considered and killed, not overlooked.
- THE KILL-CRITERION => This delta is the wrong call if a write-time check cannot be made cheap enough to always run. Not slow-but-tolerable — cheap enough that nobody ever wants it off.
- LOOKING FOR IT, honestly => It is not settled and it is not going to be settled by argument. The number has never been taken. The probe is placed first for that reason and the fallback is named ahead of it, so the failure mode is a smaller iteration rather than a wrong architecture discovered late.
- A SECOND ATTACK, on this gate's own evidence => The four-calls-against-one measurement is a sample of ONE, taken by the agent making the case, on a mistake the agent made. That is the weakest possible evidential base and it should not be dressed as a finding.
- THE ANSWER TO THAT => Conceded, and it is why problem_agreed cites two independent things rather than one. The second is not a sample of one: depends_on's rule stood in the seed tool's own argument list and the key was still missed on three records out of twenty-seven seeded, measured 2026-08-13 by somebody else, before this iteration existed. The n=1 story illustrates; the 3-of-27 count carries.
- A THIRD ATTACK, on the scope correction => Growing the scope AT the gate that judges the scope is exactly how scope creep looks from the inside, and calling it a correction is what everybody calls it.
- THE ANSWER => Checkable, and checked. The retro drained note-d7a26094f592 into i6 on 2026-08-13, and its drain text names the se_lint gap explicitly as part of what i6 carries. The decision to include it predates this gate by three days and was somebody else's. This gate corrected a list, and the list was wrong.

## raid_additions

- raid-iss-the-prior-art-is-cited-but-never-recorded
- raid-iss-se-lint-has-no-whole-repo-sweep

## verdict

pass — the delta is real, it was measured rather than argued, and the one comparison this gate could not make is named and routed rather than fabricated.

WHAT CARRIES THE PASS.

- THE PROBLEM IS MEASURED TWICE, and only one of the two is this agent's own mistake. The 3-of-27 depends_on count was taken on 2026-08-13, before this iteration existed.
- EVERY NEED HAS A PASS LINE THAT A LISTING CANNOT SATISFY. That was checked against the record's own test, criterion by criterion.
- THE REGISTER CARRIES EIGHT ENTRIES with owners and triggers, including the one that can move the architecture.
- ONE SCOPE ITEM WAS RECOVERED, and its inclusion was somebody else's decision three days old rather than this gate's.

WHAT THE PASS DOES NOT CLAIM.

- THAT THE PRIOR ART IS POSITIONED. It is not. Three sources are cited in three places and recorded in none, nobody here has run ArchUnit, and this gate declined to write a comparison it could not support. That is a fail on one round-1 question, carried openly rather than dressed up.
- THAT THE ARCHITECTURE IS SOUND. The write-budget number has never been taken. The gate passes the MOTIVATION, which is what it is for; the architecture is answered by a measurement placed first in the build order.

WHY THAT IS A PASS RATHER THAN A FAIL. This gate's make-or-break question is whether the delta is real and worth building. Both halves are answered with evidence. An unmade comparison about HOW to build it is a finding with a named home two states ahead, and gate-motivation is not the state that owns it.

A FAIL HERE WOULD MEAN a trivial motivation. This one has a measured cost, a named mechanism, and a departure from its own borrowed design that it can state precisely.

## follow_up

M2 OPENS. Two doors stand: write-stories and write-requirements.

WHAT THIS GATE HANDS FORWARD.

- FIFTEEN SCOPE ITEMS in a binding order, the fifteenth recovered here.
- EIGHT REGISTER ENTRIES, two of them minted at this gate.
- TWO OWED THINGS WITH NAMED HOMES rather than open questions. The ArchUnit comparison goes to probe-assumptions, the only state left on this walk that can reach the web. The vp-the-engine stale line goes to sweep-consistency.
- ONE MEASUREMENT standing between the plan and the architecture, placed first in the build order on purpose.

NOTHING IS BLOCKED.

## anything_else

ONE FINDING FOR THE RETRO, recorded here because this is where it was found and it is about the machine rather than the work.

A MILESTONE THAT POSITIONS AGAINST PRIOR ART SHOULD BE ABLE TO REACH PRIOR ART.

gate-motivation's round 1 demands a comparison against systems people actually use. Its legal_tools are six read verbs over this repository. No web search, no web fetch.

Checked against all 52 rigor-matrix rows: se_web_search is granted at four states — define-actual, draft-vision, probe-assumptions and rank-unknowns. At minor, two of those are struck or tailored away and one is behind this gate. The demand and the capability are in different states.

THE EFFECT IS PREDICTABLE. An agent asked for a comparison it cannot research either writes one from memory, or does what this gate did. Only one of those is honest, and the machine currently makes the dishonest one easier.

This is the iteration's own thesis pointed at its own machine: a demand written from the demander's side without checking the demanded state can answer it.
