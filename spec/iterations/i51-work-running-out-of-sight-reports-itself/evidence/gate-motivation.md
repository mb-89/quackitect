---
form: gate-motivation
bless: blessed by agent
by: agent
signed_off: 2026-08-21T08:53:55.954Z
authors: agent
files: null
---

# Evidence form / gate-motivation

## current_situation

Milestone one is drafted. Five states stand signed: the retro row, the kickoff gate, the vision, the register, the actual, the delta, the scope and the pressure test.

This gate argues whether the frame is worth having. Past it the vision is axiom.

The change size is `major`, so this row applies in full. A major re-argues its worth rather than inheriting it.

## vision_scope_stated

THE PACKET IS COMPLETE, and each part was opened rather than trusted.

- The vision inherits `vp-the-engine` and states its delta. It does not rewrite a goal, and it says why: the drawing's three consequences do not move.
- The goal system names five goals and rules three conflicts, each with the losing side stated.
- The Moore pitch fills all five slots, and adds what is given up.
- The actual carries fourteen claims, each with a file and a line or a recorded measurement.
- The delta carries a two-part gap claim and a why-now that does not lean on an uncounted number.
- The scope names four things in and seven out, each exclusion with its reason.
- The pressure test runs eleven hostile questions and folds three findings.

WHAT THE PACKET AMENDS. One value proposition gains one success criterion. `vp-rigor-without-toil` now carries the agent's half of the slow-interface rule i33 wrote for a person at a screen.

THAT AMENDMENT IS WHAT THIS GATE ADJUDICATES, per the row's own major note. It is judged below under `goals_served`.

WHAT IS NOT COMPLETE, said rather than left blank. The packet has no answer for what a time remaining means for a plain shell command. The pressure test found it and the scope's follow-up carries it. It is a design question and this gate does not need it answered to rule the frame worth having.

## problem_agreed

THE DELTA IS REAL, AND IT WAS MEASURED TWICE.

ONCE BEFORE THIS ITERATION. A step held the agent's only verb for sixty-eight seconds. Two calls timed out at the tool boundary, and one of them had partly landed, so the caller was told the work failed while it had in fact moved. Recorded in `wt-a-step-whose-leaving-condition-runs-a-long-program-should-no`.

AND AGAIN DURING THIS SESSION, WITHOUT ANYONE LOOKING FOR IT. Six `mirror_slow` records stand in the call log for this session alone. Five are on the `/mcp` POST path, which is the lane itself, at 1105 ms, 1161 ms, 1589 ms, 1639 ms and 2275 ms. The sixth is a `/` GET at 1306 ms.

WHY THAT SECOND MEASUREMENT MATTERS MORE THAN THE FIRST. It is not the exit script. It is the ordinary lane call, breaching the one-second criterion `vp-rigor-without-toil` has carried since i12, six times in a walk that was only writing forms.

THE GOAL IS WORTH HAVING BECAUSE OF WHERE IT BITES. On a laptop a person sees a stuck walk and interrupts it. On an unattended box the only witness is the call log, and a frozen verb produces a run that ends without finishing and without anyone noticing.

WHAT ARGUES AGAINST, stated because it is real. Every piece except the third goal is a convenience. An agent that polls gets the truth, and a report that estimates can mislead.

WHY THAT DOES NOT WIN. The third goal is not a convenience, and it does not depend on the other three. A step that hands the walk back is the difference between a run that finishes and one that does not.

## prior_art_positioned

THE COMPARISON IS INHERITED FROM THE KICKOFF, where the web tools were legal. It is not repeated here, and its limits travel with it.

WHAT THE OTHER SIDE DOES BETTER, first. Jenkins carries this shape and has for years. `hudson.model.Run` declares an estimated duration and a running build is presented against it. Its estimate derives from prior builds of the same job, at a scale this product will never reach.

WHAT WAS ACTUALLY SEEN. The declaration itself, in Jenkins core. The derivation rule behind it was NOT read. That limit was recorded at the kickoff and is carried rather than quietly upgraded into a claim.

WHAT FAILED THE CHECK. GitHub Actions was the first comparison reached for and it did not survive. Its own monitoring documentation publishes job execution time after the fact, not a time remaining for a running job. The dropped comparison is recorded because a comparison that failed is evidence about the space.

OUR POSITION, in one line: every alternative reports to a person watching, and none answers the caller that started the work.

WHAT WE SHED that they carry: no daemon, no dashboard, no broker. The job tables already live in the lane process, so the report is one more answer on a call the agent already makes.

WHAT WE CANNOT CLAIM: accuracy. They have the history and we do not, which is exactly why every figure here has to name its basis.

AND ON THE SECOND HALF OF THE GAP THERE IS NO PRIOR ART AT ALL. No build server runs its long job inside the step-completion path, so none of them has the freeze. That is not a gap in the market. It is a defect of ours, and saying so is more honest than dressing it as an unmet need.

## success_measurable

THREE NEW METRICS LAND ON `vp-rigor-without-toil`, all zero-targets, all countable today.

- Lane calls that block longer than a second on work the caller could have been told about instead. Target: zero. TODAY'S COUNT IS AT LEAST SIX, from this session's own `mirror_slow` records.
- Pieces of background work a single call cannot report. Target: zero. TODAY'S COUNT IS AT LEAST TWO, because `jobList` and `testVerdicts` are separate tables and no verb reads both.
- A reported time remaining that does not name the basis it was computed from. Target: zero. TODAY'S COUNT IS THE WHOLE OF IT, because no time remaining is reported at all.

EACH ONE HAS A DENOMINATOR THAT EXISTS. The first counts against lane calls, which the log holds. The second counts against a list of job kinds, which the code holds. The third counts against the report's own entries.

WHAT MAKES THESE PASS LINES RATHER THAN HOPES. All three are failable on the day the work lands, without a new instrument. That is the test the row asks for: a criterion nothing will ever check is not a criterion.

THE AUDIENCE'S OUTCOME IS UNCHANGED and already measurable. `vp-rigor-without-toil` promises that the person's time goes to judging rather than watching. This iteration's criterion says the same thing about the agent's time.

WHAT IS NOT MEASURABLE AND SAYS SO. How often an agent polls a running job is not counted anywhere, and no criterion here depends on it.

## risks_logged

FIVE ENTRIES STAND, each a node with an owner and a trigger.

- `raid-risk-a-time-remaining-is-believed-more-than-it-deserves`. Corrosive, expected. Triggers on the first caller that waits the reported time and finds the job still running.
- `raid-risk-a-hop-that-finishes-later-makes-green-ambiguous`. Crippling, expected. Triggers on the first walk that leaves a state with a pending verdict and then reads green downstream.
- `raid-risk-a-narrower-test-scope-misses-a-break`. Corrosive, plausible. Triggers on the first verification battery that fails on something a scoped run for the same diff had passed.
- `raid-asm-a-first-run-has-timings-to-estimate-from`. Corrosive, expected. Triggers the first time a job is asked for a time remaining on a machine that has never run it. Carries a written probe.
- `raid-asm-battery-timings-measure-work`. Predates this iteration, cited rather than restated.

EVERY TRIGGER NAMES AN EVENT, never a date. Two of the three new triggers fire inside this iteration, which is what makes them watchable rather than filed.

THE SECOND ONE IS THE GATE'S REAL CONCERN. It is the only `crippling` grade in the set, and it is the architectural move itself. The design owes an answer for what green means before anything is built.

ONE CORRECTION LANDED ON AN EXISTING ENTRY. The first-run assumption carried `how_likely: likely`, which is not one of the scale's three words. It now reads `expected`, because a fresh container has no recorded timings and that condition already holds.

## round_0_verify

- evidence vs claims: checked by opening the sources rather than trusting the packet. Every claim in the actual was read at a named line: session.ts:3686 carries the inline await, sessionscript.ts:87 carries the 600,000 ms timer, tools-run.ts:44, :144, :152, :483 and :542 were each read, and discipline.ts:455 and :463 carry the two battery fallbacks. Both value-prop references were followed to their files and both resolve. Both name stk-engineer-driving-agents, and that stakeholder file exists. Every success criterion in both carries a Metric and a Target, including the three added here. Two props, two distinct ids, no substantive duplication.
- types: not run, and owed. No typecheck verb is legal at this gate, and nothing in milestone one touched code.
- lint: not run, and owed. Carried forward from the kickoff gate, which also owed it. It moves to the implementation gate.
- tests: not run, and owed. The battery belongs to verification. The two engine edits made entering this record still carry no test, and writing one is build work inside this iteration.

## round_1_validate

- exercised against the goal: partly, and further than the kickoff could reach. The frame's own premise was tested against the live system rather than argued. The six mirror_slow records were not decoration: the call log was queried for a bound breach and they were already there, written by a detector with no stake in this argument.
- missing: what a time remaining means for a plain shell command. The vision's arithmetic assumes a job that knows its own case count, which a battery does and an arbitrary command does not. The pressure test found it and folded it to the scope's follow-up. It is the design's second open question after the green one.
- wrong: nothing found wrong in the packet on this pass. One thing was corrected before it could become wrong, the likelihood word on the first-run assumption, which read likely where the scale has only expected, plausible and conceivable.
- out of scope: nothing pulled in that the goals do not carry. The value-prop amendment sits inside a standing proposition rather than widening the four goals, and this gate reviewed it as an amendment because the row's major note says that is what it adjudicates.
- prior art: inherited from the kickoff with its limits intact and not re-derived, because no web tool is legal at this gate. Jenkins declares an estimated duration in hudson.model.Run and derives it from prior builds at a scale we do not have; the declaration was seen and the derivation rule was not. GitHub Actions was checked and dropped: it publishes execution time after the fact, never a time remaining.

## goals_served

- One lane call reports every piece of work running out of sight, each entry saying how much longer it needs.: served, and measurable on day one. Two job tables exist today, jobList for shell work and testVerdicts for tests, and no verb reads both. The new metric counts pieces of background work a single call cannot report, and today's count is at least two.
- A step whose leaving condition runs a long program answers at once and hands its verdict back on a later call.: served, and it is the load-bearing goal. It is the only one that moves the hop-completion contract, which is why the column is major. The measured sixty-eight-second freeze and the six one-second breaches in this session both point at it.
- The engine picks which tests answer for a change, so a documents-only edit stops firing the whole battery.: served, and the weakest of the four on evidence. It rests on a count from one session, ten batteries fired mostly by markdown edits. Its risk entry says so and is graded plausible rather than expected.
- Engine improvements, the standing goal, holding the two defects found entering this record.: served, and it took one more entry here. The corrupted matrix rows and the unpinned-record frame freeze were patched entering the kickoff. A register entry carrying a likelihood word the scale does not have was corrected at log-risks, and two more like it elsewhere were captured as a note rather than chased.

## bound_breaches

- if-agent-harness-to-entrypoint: none breached. Nothing in this window was recorded against that interface. Six breaches DO stand in the window on a different surface and are named here rather than dropped, because a breach nobody reports is this iteration's own thesis: call-1861bdac02be GET / at 1306 ms, and five on POST /mcp, which is the lane itself, at 1105, 1161, 1589, 1639 and 2275 ms. They breach the one-second criterion vp-rigor-without-toil has carried since i12. WHAT THEY DO NOT PROVE: that the cause is the mechanism this iteration fixes. None of the six is a blocked exit script, and attributing them would be fabrication. No register entry is minted, because an entry with no owner for the cause is the graveyard the register method warns about; the follow-up says which state should mint it.

## round_2_red_team

- The frame is a maintenance frame dressed as a vision delta: nothing here changes what the product IS. It makes an internal loop less annoying for the agents that build the product itself, and the audience is the maintainer rather than a customer. A gate that exists to ask whether an idea is interesting should fail a frame whose honest summary is that our own tooling wastes our own time. => The audience objection is correct and does not decide it. stk-engineer-driving-agents is a declared stakeholder and vp-rigor-without-toil has served it since i1. But the frame does not rest on annoyance. It rests on a measured failure where a caller was told its work failed while the work had moved, on a machine nobody watches. That is a correctness failure in the walk, and whether a walk that reports false failures is worth fixing is not a close question.
- The column may be too heavy: every surface change is additive, the handoff shape already exists twice, and nothing is being replaced. => The kickoff looked for the kill criterion and did not find it. The exit script is awaited inline at session.ts:3686, so the hop-completion contract genuinely moves. Additive at the surface is not additive underneath, and a state that can be left with work outstanding changes what green means for every gate below it.
- The gate is judging work it also authored: the whole of milestone one and this review are one pass by one hand. => True, unchanged from the kickoff, and the weakest structural fact about this round. It cannot be fixed from inside. What partly offsets it, and only partly: the strongest evidence here was not authored by the packet. Six breach records were already in the log before the argument existed.
- No second hand read this packet: on an attended machine the person is that hand, and here there is none. => Stated rather than solved. The verification state's fresh eyes are the first structural second hand this iteration gets, and that is four milestones away.
- The residual risk is unnamed: a gate that passes should say how it expects to be wrong. => If this frame is wrong it is wrong about SCOPE rather than about worth. The three goals beyond the frozen exit are each defensible alone and none is load-bearing, so an over-broad iteration is the likely failure rather than a pointless one.

## raid_additions

- [[raid-risk-a-time-remaining-is-believed-more-than-it-deserves]]
- [[raid-risk-a-hop-that-finishes-later-makes-green-ambiguous]]
- [[raid-risk-a-narrower-test-scope-misses-a-break]]
- [[raid-asm-a-first-run-has-timings-to-estimate-from]]

## verdict

pass — the delta is measured twice, the architectural cost is named and located at a line, and the register carries it

WHAT THE PASS RESTS ON. Two independent measurements of the same problem. The sixty-eight-second freeze recorded in the work token, and six one-second breaches found in this session's own log by querying for them rather than by remembering them. The second was written by a detector that had no stake in this argument.

WHAT IT DOES NOT CLAIM. Lint, types and tests are all owed and all said so in round zero rather than left blank. The two engine edits made entering this record still carry no test.

WHAT IT DOES NOT CLAIM, SECOND. That the six breaches were caused by the mechanism this iteration fixes. None of them is a blocked exit script, and no cause was established.

THE AMENDMENT IS BLESSED WITH THE FRAME. `vp-rigor-without-toil` gains one criterion, which is the agent's half of one it already carried in words. Zero new propositions.

THE DISSENT WORTH RECORDING. This gate reviewed a packet it wrote in the same pass, and the strongest counter-argument — that a frame serving the product's own maintainers is a maintenance frame — is answered rather than dismissed. A second hand would be worth more than the answer.

PAST THIS GATE THE VISION IS AXIOM and is not re-litigated downstream.

## follow_up

Milestone two comes next: the context boundary, the stakeholders and the stories.

Three things are parked with their owners rather than left loose.

- What a time remaining means for a plain shell command has no answer in the packet. It belongs to the design, and it is named in the pressure test and in the scope's follow-up.
- The lint and test debt from round zero belongs to the implementation gate, carried now from two gates rather than one.
- The six one-second breaches are a standing fact with no established cause. Whichever state can look for the cause should mint the register entry then.

## anything_else

THE SIX BREACH RECORDS ARE WORTH ONE MORE SENTENCE, because of how they were found.

The engine writes a `mirror_slow` record whenever a request crosses a second. Nobody reads them. This gate queried the log for a bound breach because the form asked, and six were sitting there from the past twenty minutes.

THAT IS THE ITERATION'S OWN THESIS ARRIVING EARLY. A measurement nothing reports is a measurement nobody acts on, which is the same shape as a job that runs out of sight and says nothing.
