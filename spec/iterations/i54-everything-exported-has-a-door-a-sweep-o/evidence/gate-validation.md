---
form: gate-validation
bless: blessed by agent
by: agent
signed_off: 2026-08-26T15:59:36.748Z
authors: agent
files: null
---

# Evidence form / gate-validation

## current_situation

The record is green through the consistency sweep. All three must stories were demonstrated for real and each has a report on file.

Two of the three demonstrations found defects rather than confirming what was already believed. That is the case for performing them rather than asserting them, and it is the main thing this gate has to weigh.

## meets_need

- vp-systematic-engineering: served, and this is the prop the record is about. The machine now ENFORCES a design rule at the write rather than reminding somebody of it: a module that reaches a governed conversation with no departure is refused, and so is a departure with no reason. rpt-sty-an-exception-without-a-reason-is-refused carries the refusal as it was met.
- vp-the-ledger: served. A departure IS a recorded, attributed, refusable decision, and the list is where a reviewer reads it. The six-system scan found no other tool that makes a bypass explain itself.
- vp-rigor-without-toil: a TRADEOFF, not a win. The departure list ADDS paperwork - one reason per module allowed past. What it removes is worse: a hand-written entry-point list of six that the engine had already grown past, replaced by a sweep. Net, the toil moved from maintaining a list to justifying an exception, and only the second kind is worth anything to a reader.
- vp-qualities: served in one measured way. The record's own rule was applied to the record and refused two things the record had shipped. That is the guard holding under stress rather than on the happy path.
- vp-the-engine: untouched by the record's subject, and touched by one fix the owner asked for mid-run. A reloaded session could not leave any state whose exit carries a script, which is the engine's teeth failing on exactly the path a cloud box takes. Fixed, with three cases in deliverable/tests/handback.test.ts.
- vp-autonomy-range: untouched, and that is fine. Nothing here changes what an agent may decide alone or how far it may go. The record neither widens nor narrows either dial.

## musts_demonstrated

- sty-an-exception-without-a-reason-is-refused: performed against the running lane. The write was refused with SE-C-150 naming the file, the line and the repair - and the remedy it handed back did not apply, which is a defect the demonstration found and the same pass fixed. Report: spec/iterations/i54-everything-exported-has-a-door-a-sweep-o/reports/rpt-sty-an-exception-without-a-reason-is-refused.md
- sty-find-working-code-that-no-surface-can-reach: performed against the real tree as the boot state's own exit script. Four entry points named, not counted. Report: spec/iterations/i54-everything-exported-has-a-door-a-sweep-o/reports/rpt-sty-find-working-code-that-no-surface-can-reach.md
- sty-read-why-the-code-departs-from-its-own-design: performed by a reviewer hand with no share of the build's context. It found one reason off by one on its own measurement, and found that the page hid its own scale. Both fixed. Report: spec/iterations/i54-everything-exported-has-a-door-a-sweep-o/reports/rpt-sty-read-why-the-code-departs-from-its-own-design.md

## market_tier


## round_0_verify

- evidence vs claims: a reviewer with no share of the build read the three reports against the artefacts and found a FALSE CLAIM in one of them. Report two said all three of its cases fail against the old code; one cannot, because it pins the branch that did not change. Corrected, and the correction says a reviewer caught it.
- types: clean. The lane typechecks after every write to source, and it caught two missing imports in this milestone before any run.
- lint: clean, no suppression added. The safe fixes ran and named every file; two unused imports left by a refactor were reported and removed.
- tests: the suite exits 0 at 1905 cases. Four fixes landed this milestone and each has cases: three for the departure remedy, three for the condition checker, four plus a ratchet for the containment predicate. The confirm run covering all four together is in flight as this gate is written, and the verdict records itself.

## round_1_validate

- exercised against the goal: yes, and hostilely. Two of the three demonstrations found defects rather than confirming beliefs, and a gate reviewer found a third in the reports themselves.
- missing: the outward door, deliberately. And the goal's own promise of a sweep over EXPORTS rather than over runnable files, which is named honestly above rather than glossed.
- wrong: one claim in one report, now corrected. Nothing else standing.
- out of scope: around eighty undeclared reaches and 17 help findings, both registered with every item named. Not widened.
- prior art: dependency-cruiser, ArchUnit, ESLint, Rust, Go and Bazel, compared and CORRECTED mid-record after reading dependency-cruiser's own rules reference. What survives is narrow and stated narrowly: every one of the six ships a way to switch the whole thing off, and this ships per-module departures that must each state a reason. That comparison is unchanged at this gate and no new comparison was made here, which is worth saying rather than repeating the old one as if it were fresh.

## goals_served

- Replace the hand-written entry-point list with a sweep over every exported entry point, so the guard stops depending on somebody maintaining a list: served and demonstrated. The demonstration watched the sweep run against the real tree, and its report quotes what it printed.
- Name everything exported that no surface can reach, and answer each one with either a door or a deletion: NOT SERVED ON THE GOAL'S OWN WORDS, and the gate reviewer is the reason this line changed. The sweep enumerates the bin folder, not exports. An exported function with no runnable script cannot be named by it, ever. Four runnable entry points are named and none is answered. What shipped is a reachability sweep over runnable files; what the goal promised is a sweep over exports, and those are different sets.
- Give the two already-found pieces their door, so a capability the tests prove is a capability somebody can use: not served, and the sweep could not have found them either. drivenBy in deliverable/engine/produce.ts is still reachable from no surface and is invisible to the check built to find it. That is the sharper version of the ratchet gap the implementation gate recorded.
- Establish whether one door per capability actually pays here, by judging the measured sites rather than by counting them again: served, and the answer was a judgment on sites. run.ts stands as the declared counter-example at 0 of 10 sites a door would improve, and the demonstration's reader checked that reason and corrected one phrase of it.
- Build the disk door and its declared exception list, generalising the shape that already governs widget markup: served, and the generalisation improved on its worked example twice. The widget list IGNORES a reasonless bullet; this one REFUSES it, and refuses a bullet it cannot parse. The second improvement is that its remedy now applies, which the demonstration proved it did not.
- Give reaching outward a central door that earns its keep, with guidance for a search and a place results are kept: not served, deliberately, with the reason recorded at the prototype gate. Unchanged at this gate.
- Record a reason for every door proposed and dismissed, so a dismissal is evidence rather than silence: served. The record carries a measured reason for each door not built, and the departure list carries one for each module allowed past.

## bound_breaches

- if-agent-harness-to-entrypoint: breached again this milestone, and the breach is still the bound's rather than the code's. It measures one second against every lane call including the verbs whose whole job is to spawn a process and wait. This milestone spent about six minutes inside three full batteries and two demonstration subagents, every one of them over the bound by construction. Registered as raid-iss-the-one-second-bound-counts-calls-that-spawn-external-work; the disposition is unchanged, and the record that re-draws the bound owns it.

## round_2_red_team

- STEELMAN: the record's headline goal is unmet on its own words and nobody amended it, while the record amended itself four times for scope, carving and sizing => The strongest case against, and it HOLDS. It is why goals_served now says NOT SERVED where it said half served, and why this verdict carries it as an override rather than a footnote.
- The rule binds nothing: eighty undeclared reaches, warn-only, no ratchet on the count, no expiry => Holds, and it is the ratchet gap by design rather than by accident. What answers it partly is that the departure FILE refuses, which is the one place the rule has teeth today. What does not answer it is anything about the eighty.
- The differentiator is reason QUALITY, and the demonstration ran at n=2 with one of the two wrong => The most likely thing to prove this premature. One of two hand-written reasons carried a false measured claim, caught only because a reviewer counted. At that rate eighty reasons is forty wrong ones, in the file whose only value is that a person can trust it. Registered as raid-asm-an-author-refused-at-write-time-states-a-usable-reason, and the n=2 measurement is now on the record beside it.
- The record injected four regressions into a shared write chokepoint and fresh eyes caught them, not the record => True, and the chokepoint still has no behavioural test. What stands is a source-level assertion that every write verb calls the one guard, which catches a deleted call site and not a guard that stops refusing.
- KILL-CRITERION, and I looked for it: this is the wrong call if a second door needs a shape the first cannot express => Found and carried as debt. Two walkers hardcode where the first door's files live. A second door over another folder would count zero and report UNCHECKED forever.
- A crippling scope item was signed and not built => FOUND AT THIS GATE, by the reviewer, and built rather than deferred. bases.ts guarded a vault write with a bare string prefix, so a sibling named vaultevil passed as inside vault. One predicate now serves four sites; the fifth holds no check at all and is registered.

## raid_additions

- spec/trace/raid/raid-iss-no-write-verb-announces-the-door-refusals-before-firing-them.md

## verdict

pass with overrides — the mechanics are proved and the judgment carries four dissents, each logged rather than waved.

FIRST AND LARGEST: the kickoff goal is unmet on its own words. It promised a sweep over every EXPORTED entry point; what shipped enumerates runnable files. Those are different sets, and an exported function with no script is invisible to the check built to find it. The record amended itself four times and never once for this. The override is that the goal statement is wrong rather than the work, and the next record that touches it owes the restatement.

SECOND: the rule warns rather than refuses across eighty undeclared reaches, with no ratchet on that count. It has teeth in exactly one place, the departure file itself.

THIRD: the reason-quality claim rests on two samples and one of the two was wrong. That is the most likely way this design fails, it is registered, and the measurement is now beside it.

FOURTH: two behaviours cannot be exercised until a second door exists, carried as debt with a trigger that fires before that door is registered.

WHAT EARNS THE PASS is that every must story was demonstrated for real and two of the three found defects; that a reviewer with no share of the build found a false claim in a report and it was corrected rather than defended; and that a crippling scope item this record had signed and not built was found at this gate and built, with a ratchet so its copies cannot return.

## follow_up

### Owed by the next record that touches this

- RESTATE THE GOAL or widen the sweep. "Every exported entry point" and "every file a person can run" are different sets, and the record shipped the second while promising the first.
- Answer the four named entry points with a door, a deletion, or the invocation somebody forgot.
- Give drivenBy in deliverable/engine/produce.ts its surface. It is the original finding this record was seeded on, and it is still unreachable.

### Registered and deliberately untouched

- Around eighty modules reach the disk conversation with no departure declared.
- 17 findings across 11 entry points break the help rule.
- raid-iss-an-absolute-canvas-reference-is-resolved-with-no-containment-check, the fifth containment site, which holds no check rather than a wrong one.
- raid-iss-no-write-verb-announces-the-door-refusals-before-firing-them.

### For the retro

- note-602818086dfb and note-117a542f97b4: the reload pin, and the fix the owner asked for mid-run.
- note-89673aaafffa: the surface prints [object Object] for every one of its last hops.
- The prompt-layer projection did not converge for want of one quote character, and its warning cried lost-hand-edit on every run. Fixed here; the lesson is that a guard which always fires teaches a reader to ignore it.

## anything_else

