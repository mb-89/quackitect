---
form: write-requirements
by: agent
signed_off: 2026-08-17T16:50:30.606Z
reopened: "2026-08-17T16:49:48.634Z — generalize-use-cases re-signed above it. This state also owes a new row: the owner ruled on 2026-08-17 that an amendment does not re-grey and a reopen does, and asked for it in the requirements."
amended: 2026-08-17T14:38:13.854Z by agent — the use-case state re-signed above it; the seven rows stand
authors: agent
files: null
---

# Evidence form / write-requirements

## current_situation

EIGHT ROWS. Five were written for the delta, three were added as the walk found what the register was missing.

RE-READ FOUR TIMES SINCE, and a latency reading moves none of them: they say what the system must do, not how fast it currently does it.

THE FIRST FIVE SERVED THE HONESTY HALF ALONE. Nothing was wrong with them: they cover their use cases exactly, and every coverage check passed. They served one goal of five because no check in this system looks up at the goal. goals_served at every gate is what now does.

THE SIXTH CAME FROM THE REDO against the kickoff's five goals (2026-08-17).

THE SEVENTH CAME FROM THE GATE BELOW asking what this milestone produced for each goal. Goal three, instrument every interface, had NOTHING in the register — and the kickoff's own red team had already written down that a milestone three ending with no state reading the instrument means the iteration repeated i12. req-a-breached-bound-is-put-in-front-of-a-reviewer is that reader, written while design input could still be changed.

THE EIGHTH IS AN OWNER RULING OF 2026-08-17, and it serves goal five rather than the three latency use cases. An amendment does not re-grey the claims below it; a reopen does. It is in the register because the ruling was given twice, the second time to overturn what the engine had just been built to do, and a rule given twice belongs somewhere a check can read it rather than in a comment.

THE RESIDENT REGISTER IS EXTENDED, NEVER FORKED. req-call-answers-in-one-second stands untouched, and one of the new rows says in as many words that it is not a relaxation of it — a product satisfying the new row while failing the old one has only stopped hiding.

THE FAN-OUT WAS COUNTED. The new use case is refined by three rows and performance-efficiency by two new ones beside what already stood. Both sit under the five-row clustering threshold, so no folding was needed and none was done.

THREE STATEMENTS WERE REWRITTEN AT SUBMIT. The register's own lint refused the word `would` as a weasel that checks nothing, in all three places it appeared. It was right each time.

## register

- req-a-refused-act-says-why-and-what-next
- req-a-surface-shows-the-state-an-act-produced
- req-a-control-that-undoes-on-a-second-press-says-so-first
- req-work-past-its-bound-says-it-is-working
- req-a-slowness-signal-never-shortens-the-wait
- req-one-operation-reads-its-input-once
- req-a-breached-bound-is-put-in-front-of-a-reviewer
- req-an-amend-leaves-the-tree-standing

## set_criteria

- complete: every step and extension of the THREE delta use cases has a covering row. req-a-breached-bound-is-put-in-front-of-a-reviewer covers extension 5a, the act that is slow only sometimes, by obliging a reviewer to be shown the breaches rather than leaving the pattern for somebody to notice. uc-drive-the-machine-at-the-pace-of-thought is covered by req-one-operation-reads-its-input-once on extension 2a, and by the standing req-call-answers-in-one-second and req-surface-answers-in-one-second on its main scenario. Extension 3b is NOT covered by a row of its own and is named here rather than left blank: telling an unbounded operation from a genuinely large one needs the boundary model that milestone one has not built yet, so the row that checks it cannot be written before it. The eighth row refines a RESIDENT use case, uc-take-a-step, rather than one of the delta's three — it serves goal five and is named here so its odd parentage is visible rather than looking like a miscount
- complete, the first two use cases: every step and extension of the two use cases has a covering row. uc-act steps 2 to 6 and extensions 2a, 2b, 3a, 5a and 6a are covered by the three functional rows, with 2b, 5a and 6a carried in the Detail of the refusal row rather than as rows of their own. The two new extensions on performance-efficiency are covered by the two quality rows. Nothing is left without a covering row
- consistent: no two rows conflict, and the one pair that LOOKS like it does is settled in writing. req-work-past-its-bound-says-it-is-working could read as relaxing req-call-answers-in-one-second, and its Detail states that it does not
- affordable: three of the first five are verified by cheap tests — a reason is rendered, a rendered value matches the stored one, a destructive-on-repeat control carries its warning. The fourth is a test on a timing path the engine already instruments. The fifth is the expensive one, needs people watched side by side, and is graded should for exactly that reason. The sixth and eighth are each one test and both are already written and green
- bounded: every row answers to a use-case step and a story, and names both in source_refs. The eighth answers to an owner ruling instead, given twice on 2026-08-17, and that is its source_ref. The only row reaching past a reported failure is the slowness-signal one, and it exists because the motivation gate's own scan argued against us
- comprehensible: every row states an observable act rather than a mechanism, so a reader from any discipline can say what the system must do from the set alone. No row names a queue, a poller, a component or a file
- no_tbd: swept and ZERO. se_file_search across project/spec/trace/requirement for the literal markers TBD, TBC, TBR and ??? returned 0 matches over the whole register, run at this state rather than assumed
- behaviour_modelled: the look was taken on all eight and one earned a model. req-a-refused-act-says-why-and-what-next carries a four-line state model, because its defect is a MISSING TRANSITION — a decline today loops from offered back to offered emitting nothing, which no observer can tell from the control never having been pressed. The eighth carries a three-line Behaviour block for the same reason in reverse: the two acts differ only in what they do to the tree, so showing the tree under each is the only way to state it. The rest say in one line why a model is noise there

## follow_up

M3 CONTINUES. identify-assumptions sweeps what these rows lean on, and probe-assumptions checks every standing one — including the four already minted, of which raid-asm-the-slow-phase-is-the-green-derivation-repeated carries the probe that decides milestones three and four.

WHAT THE ROWS LEAN ON, named here so the sweep starts from something:

- That a bound exists and is named per operation. req-work-past-its-bound-says-it-is-working says "the bound named for it", and today the register names one bound for calls and one for surfaces, not one per interface. Milestone one is what makes that true.
- That a surface can know the state an act produced before the actor acts again. The use case's own extension says a host drawing its own values is how this drifted before, so the assumption covers every host and not only the mirror.
- That the destructive-on-repeat family is knowable. The rung banks are named; whether anything else behaves that way has never been swept.

ONE ROW ALREADY WAITS ON THE OWNER. req-a-slowness-signal-never-shortens-the-wait is verified by demonstration with people watched side by side, and nobody has scheduled that.

AND THE LINT EARNED ITS PLACE HERE. It caught `would` three times in statements I had written carefully, which is the write-time refusal this product keeps arguing for working exactly as designed.

## anything_else

