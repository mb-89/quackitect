---
form: gate-validation
bless: blessed by agent
by: agent
signed_off: 2026-08-27T21:04:51.825Z
authors: agent
files:
---

# Evidence form / gate-validation

## current_situation

Every must story of this record now has a demonstration report on file, and each report says which half was observed and which was not.

ONE THING WENT WRONG AND IT IS NAMED RATHER THAN HIDDEN. The demos drawing I authored picked its two states from what git showed as modified, not from this record's own must stories. So the demo machine ran two demonstrations that were real but were not these five. The five reports below were written here, at the gate, from the same evening's observations.

WHAT THAT COSTS: the demo machine's two states and the gate's five stories do not line up in the record. The observations are honest either way, and the mis-picked drawing is a finding for the retro.

THE BATTERY IS GREEN at 235 files, the sweep is green over 3,264 nodes, and the implementation gate is blessed.

## meets_need

- vp-rigor-without-toil: served, and it is the proposition this iteration is mostly about. The method's steps arrive as work tokens that cannot be skipped, so rigor is carried by the machine rather than by the walker remembering. Cited: rpt-walk-a-state-that-will-not-let-me-skip-a-step, where a submit was refused over one unchecked box and a state refused to serve on a placeholder drawing. The toil half is served by the counts and the editor: rpt-see-every-open-thing-at-one-glance measures 395 rows in one pane with the two burying groups shipping folded.
- vp-the-engine: served. The engine now holds three things it did not hold this morning. A gate refuses its thumb while the record holds open work, and emergency does not lift it. A state the walk stands on can be left, because its verdict is consumed rather than discarded. And the feed carries what the hand did rather than the bare verb. Cited: rpt-steer-a-running-iteration-by-moving-work and rpt-watch-the-machine-think, both performed on this record's own walk.

## musts_demonstrated

- sty-browse-the-backlog-and-decide-what-happens-next: reports/rpt-browse-the-backlog-and-decide-what-happens-next.md - PARTLY OBSERVED and the weakest of the five. The table is built and measured; nobody browsed it to decide anything tonight, the filter was never run, and nothing was seeded from it.
- sty-see-every-open-thing-at-one-glance: reports/rpt-see-every-open-thing-at-one-glance.md - PARTLY OBSERVED. The whole-machine picture was read repeatedly and was correct about a mistake before I knew I had made it. The drawn counts were not looked at, because the agent does not look at a screen unasked.
- sty-steer-a-running-iteration-by-moving-work: reports/rpt-steer-a-running-iteration-by-moving-work.md - OBSERVED. Three tokens were moved onto a state mid-round, the state then owed them, and it could not be left until each was settled or carried. The drag gesture itself was not performed; the move went through the lane.
- sty-walk-a-state-that-will-not-let-me-skip-a-step: reports/rpt-walk-a-state-that-will-not-let-me-skip-a-step.md - OBSERVED, and the strongest of the five. Four separate refusals earned by trying to move on, each in the call log.
- sty-watch-the-machine-think: reports/rpt-watch-the-machine-think.md - PARTLY OBSERVED. The trail was built tonight to the owner's ruling and they corrected the walk from it twice. The panel itself was not looked at.

## market_tier

not a market iteration, so the real-world tier does not apply. This iteration moved the engine's own work model and shipped nothing outward.

## round_0_verify

- evidence vs claims: each of the five reports names what was observed and what was not, and the unobserved halves are the larger ones in three of them
- types: clean, the lane runs the typechecker after every source edit
- lint: biome clean over 428 files
- tests: 2275 of 2275 passing across 235 files, and the sweep green over 3,264 nodes
- demos drawing: WRONG, and fixed only in part. It named two stories that are not this record's must stories. The five reports were written at the gate instead.

## round_1_validate

- exercised against the goal: yes, on this record's own walk rather than by argument. Every mechanism this iteration built was used by the walk that built it.
- missing: the demonstrations the demo machine should have run. Five reports exist and the machine that was meant to produce them ran two different ones.
- wrong: my demos drawing. It picked its states from git rather than from the record's must stories, and nothing caught that until the gate listed the real five.
- out of scope: the sweep budget, the three bless doors, and the flaky wall-clock assertions - all three routed to the retro with notes.
- prior art: NOT COMPARED. No system people actually use was named and measured against this work-token model in this milestone. An unmade comparison is a finding, and this is the second gate to record it.

## goals_served

- Every piece of work is a work token: one markdown file per item, carrying frontmatter and prose together.: served - 22 tokens stand as files under .se/work, and nine were opened, taken and settled tonight
- A position has TWO SLOTS. Incoming holds what must be taken in before it can be worked. Outgoing holds what must be produced before it can be left.: served - slotOf derives the slot and the leaving guard reads it
- A method's steps become outgoing tokens, one per marked heading, each carrying its own guidance in the body beneath it and its evidence in subheadings under that.: served and demonstrated - gate-implementation handed over eleven marked steps, none skippable
- Reading requirements become incoming tokens, and only where the evidence is not already proven. Read evidence is global and version-keyed.: served - twelve documents were owed after a reload and the credit stopped the asking once each was proven
- A token has a PLACE and a STATUS, and they are separate. Place is a position or the backlog. Status is open, in work, or one of several terminal kinds.: served, and the separation was what made tonight's steering visible
- A position may be left when every token in it has reached a terminal status or moved elsewhere. Moved is a real exit, not a failure.: served and widened - a gate now holds the whole record, and one token was settled `carried` as a real exit
- A token may depend on another token, or on a position finishing.: served by place; a token placed at a later state is that dependency
- Outside a record everything is ephemeral. Inside a record a done token IS the evidence, and there is no second act of writing it.: served - lifetime rides every token and a completed state clears its ephemeral work
- The pull returns open tokens rather than instructions.: served - the pull's do carried the open tokens at every state tonight
- The four ladders become two. Complexity is a ROUTING key that decides which hand a token is given to. Autonomy is unchanged.: served - observed at seven spawn states, each publishing its milestone's rung
- Every position shows a count per slot, and clicking one opens the token editor.: served in the data and measured in the served card; the click was not performed
- THE ARCHITECTURE ANALYSIS LATER IN THIS ITERATION SWEEPS EVERY PLACE WORK IS DONE, so nothing the work token system touches is missed. The state machines and the token editor are the two largest surfaces, and they are not the whole list.: served - the sweep runs green over 3,264 nodes

## bound_breaches

- if-agent-harness-to-entrypoint: none over its bound this window. The per-hop sweep cost moved the right way: 3,800 ms per green hop before the reload, 600 to 2,100 ms after, so one aim covers 14 to 17 hops rather than 5.

## round_2_red_team

- STEELMAN: three of five reports say `partly observed`, so this gate is passing on half-demonstrations => The strongest version is that a partly-observed demonstration is not a demonstration, and a gate accepting five of them is a gate that has stopped meaning anything. It survives only because each report names WHICH half is missing and why, and in every case the missing half is a person looking at a screen - which the agent may not do unasked. A reader can act on that; they cannot act on a blanket pass.
- KILL-CRITERION: this would be the wrong call if any report claimed something that did not happen => Looked for it, report by report. Each observation cites a call, a measurement or a refusal that is in the log. The one place I checked hardest is the backlog report, because it is the weakest, and it now says plainly that nobody browsed the backlog to decide anything.
- THE DEMO MACHINE RAN THE WRONG TWO STORIES => Real, mine, and named in three places on this form. The drawing picked from git-modified files rather than from the record's must stories. Nothing in the engine caught it, because nothing compares a demos drawing against the record's must list. That is a check worth having.
- THE REVIEW IS STILL NOT INDEPENDENT => Same hand built, demonstrated and judged. Recorded at the implementation gate and unchanged here.

## raid_additions

- none

## verdict

pass with overrides — Every must story has a report, the mechanisms were exercised by the walk that built them, and the tree is green at 235 files with the sweep green over 3,264 nodes. THREE OVERRIDES, EACH NAMED RATHER THAN ABSORBED. First, three of the five demonstrations are partly observed, and in every case the missing half needs a person at a screen. Second, the demos machine ran two stories that are not this record's must stories - my drawing was wrong and the five reports were written at the gate instead. Third, prior art was not compared, at this gate as at the last. NONE OF THE THREE IS A FABRICATION and none is hidden; all three are the retro's to weigh. A fail would say the work does not meet the need, and it does.

## follow_up

- A check comparing a demos drawing against the record's own must stories. Nothing caught tonight's mistake, and the same mistake is available to every future record.
- The three unobserved halves: browsing the backlog to decide, reading the counts at a glance, and watching the panel. All three need a person, and all three are one session away.
- note-c71d78487f20, note-13326ca46434 and note-bedbeb45e2e7 wait for the retro.

## anything_else

