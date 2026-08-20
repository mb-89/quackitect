---
form: gate-inputs
authors: agent
files:
---

# Evidence form / gate-inputs

## current_situation

M2 is walked: draw-context, map-stakeholders, write-stories and generalize-use-cases, all signed.

ROUND 0 RAN BEFORE THIS FORM WAS FILLED AND FOUND TWO OF ITS OWN ERRORS, which is the change from the last gate. Both were fixed and the states re-signed rather than the gate failing on them: a story count off by one, and a value-prop sweep that covered three of ten and read as complete.

Five nodes were minted across the milestone: one neighbour, one stakeholder, two stories, two use cases, and one register entry — and the neighbour is minted EMPTY on purpose.

## picture_judged

ARE THESE THE RIGHT JOURNEYS? Two, and they are the two halves of one loop rather than two features.

FORWARD: the machine names the hands before the work. BACKWARD: the record says which hands did what, after. The second is what makes the first correctable, and a design with only the first can never learn a rating was wrong.

IS ANY ONE OF THEM WRONG? One is INCOMPLETE RATHER THAN WRONG, and it is worth stating as a judgment the counts cannot make.

uc-let-the-machine-name-the-driver ends at "the receiver reads the name". On an unattended box there is no receiver. The pass is written correctly and terminates in a room with nobody in it, which means the journey as drawn is real for a person at a laptop and unreal for the host this iteration was written for.

I JUDGE THAT THE RIGHT WAY TO DRAW IT. The alternative was to write the receiver into the machine, which is the line the lane does not cross, or to leave the last step vague enough to look satisfied. Drawing it as an empty neighbour makes the hole a shape somebody can fill.

WHAT IS MISSING FROM THE PICTURE, and this is the judgment rather than the count: there is no journey for MAINTAINING the list. Somebody opens it, sees a model retired, and brings it current. That pass is the one the whole fixed-list design rests on, and it has no actor with a node — so it could not be written without writing it against the wrong actor and hiding the gap. Registered, not drawn.

## unspecified_capability

EVERY LANE TOOL AND EVERY OFFERED DOOR, AGAINST THE USE CASES — an uncovered capability that is IN SCOPE fails this gate.

WHAT THIS CHANGE ADDS, and whether a case covers it:

- READING A COMPLEXITY OFF A MATRIX ROW → uc-let-the-machine-name-the-driver, step 2. Covered.
- TAKING THE MAXIMUM OVER A SUBMACHINE'S ROWS → same case, step 3, with extension 3a for the spread. Covered.
- LOOKING A RUNG UP IN THE FIXED LIST → step 4, with 4a for a missing entry and 4b for a name that resolves differently per host. Covered.
- PUBLISHING THE NAME ON THE PULL → step 5. Covered.
- STAMPING THE ANSWERING MODEL ON A CALL → uc-attribute-a-finished-walk, step 3, with 3a and 3b for the self-report problem. Covered.
- STAMPING THE STATE ON A CALL → same case, step 2, with 2a for its absence today. Covered.
- QUERYING THE LOG BY STATE AND BY MODEL → same case, steps 2 to 4. Covered.

NOTHING IN SCOPE IS UNCOVERED. The scope has six items and every one lands in one of the two cases above.

WHAT IS UNCOVERED AND IS DELIBERATELY OUT OF SCOPE, listed so the gate is not passing on silence: the reconciliation report, deriving a rung from a declared checker, making a rung a (model, effort) pair, and the maintenance pass. The first three are non-goals with reasons on the record. The fourth is the hole above.

ONE CAPABILITY I CHECKED AND FOUND ALREADY COVERED ELSEWHERE: setting the autonomy dial has uc-set-the-autonomy standing from an earlier record, and this change does not touch it. The two axes stay separate in the corpus as well as in the design.

## passes_concrete

IS EVERY PASS WRITTEN CONCRETELY ENOUGH TO SCRIPT AT M6?

THE FORWARD CASE, YES. Its seven steps name what is read, what is computed, where the value is looked up and where it is put. A script can walk it: rate two rows, take the max, look it up, assert the pull carries the name.

THE BACKWARD CASE, PARTLY, AND THE PART THAT IS NOT IS NAMED. Steps 1 to 4 script cleanly — write calls with a model and a state, group them, assert the grouping separates. Step 5, that the engineer TRUSTS the answer because it says what served the call, cannot be scripted at all today, because nothing but the agent knows what served it. That step is a claim with an assumption under it and its slide says so.

THE STORY SLIDES ARE THE FORMULATED STAGE AND THEY CARRY THEIR PROOF. Every slide in both new decks has a claim and a proof beside it, and the two slides that do not fill say so in capitals rather than reading as satisfied — the driver with nobody listening, and the trust that rests on self-report.

WHAT WOULD MAKE A SCRIPT LIE, and it is worth naming at M2 rather than at M6: a demo that stamps a model the harness was ASKED for rather than the one that ANSWERED would pass every assertion in the backward case and prove nothing. The distinction is the whole point of that case, so the M6 script must take the value from outside the agent or record that it could not.

## round_0_verify

- evidence vs claims: ROUND 0 OPENED THE EVIDENCE THIS TIME AND FOUND TWO ERRORS BEFORE THE VERDICT, which is the change from the motivation gate. (a) write-stories said FORTY-FIVE STORIES STAND; forty-six did. The number was read off a printed listing by eye rather than counted by a program, and a listing read by eye is not a measurement. (b) map-stakeholders' coverage field swept THREE value props and read as a sweep; ten stand. The conclusion held — not one audience resolves to nothing — and nine of ten name stk-engineer-driving-agents while vp-vendoring names stk-vehicle-owner, which the sample had hidden. BOTH STATES WERE REOPENED AND RE-SIGNED rather than the gate failing on them. WHAT WAS CHECKED AND HELD: fifty use cases stood before this record; five stakeholder nodes now stand covering agent, user, newcomer, assessor and acquirer; and a NEGATIVE CONTROL was run on the claim that communicator and project-owner resolve to nothing — searching the whole trace for those words returns three hits and all three are inside this iteration's own register entry about their absence.
- types: not run here — this gate's tools carry no se_test and no se_run. M2 wrote no code: every artifact is a corpus node or an evidence form. There is nothing to typecheck that this milestone produced.
- lint: the corpus half IS checked and it is checked on every write. SE-C-138 refuses a node whose frontmatter the engine's reader cannot load, before anything lands. Seven nodes were written across M2 and none was refused, so seven parse. The prose guard also fired once during M1 and was fixed, so the wall rule is live rather than theoretical.
- tests: STILL NOT RUN ON THIS BOX, unchanged and still a real gap. No test verdict stands in this session's log. The battery is the engine's own and fires at verification. M2 wrote no code, so nothing it produced could have been tested — but the baseline this iteration will measure against is still the repository's and not one taken here.

## round_1_validate

- exercised against the goal: YES FOR WHAT M2 IS FOR — the passes, not the mechanism. Both halves of the delta now have a journey, an actor and a guarantee. The forward journey scripts cleanly; the backward one scripts to step 4 and its fifth step cannot be scripted at all until the answering model comes from outside the agent. NOT EXERCISED as code, correctly: no milestone before M7 builds anything.
- missing: THE MAINTENANCE PASS, and it is missing for a reason rather than by oversight. Somebody opens the model list and brings it current; that pass is what the whole fixed-list design rests on and it has no actor with a node. Writing it against stk-engineer-driving-agents would have hidden the gap. Registered as raid-iss-two-always-on-roles-have-no-node-and-one-now-carries-a-duty. ALSO MISSING, unchanged from M1: any error signal that could ever say a rating was wrong.
- wrong: TWO THINGS WERE WRONG IN THIS MILESTONE'S OWN EVIDENCE and both were found by its gate's round 0 rather than by a reviewer — the story count and the value-prop sweep. Both are corrected and both states re-signed. Nothing else in M2 was found wrong at the time of filling. An adversarial pass with no shared context was commissioned against the whole milestone and had not reported when this field was written; whatever it raises that is not answered here folds into the register.
- out of scope: The reconciliation report, deriving a rung from a declared checker, and the (model, effort) pair — all three are non-goals with reasons on the record, and all three are candidates M3 must weigh rather than inherit. The maintenance pass is out of scope because its actor does not exist. The engine leads from this run's retro stay in the field report.
- prior art: THE SCAN WAS MADE AT THE KICKOFF AND M2 ADDS ONE THING TO IT, so this is not a re-citation. The scan established that shipped routers compute difficulty at runtime and are corrected by outcomes, that agent frameworks declare statically and derive their declaration from nothing, and that every scheduler which has run declared resource classes learned that over-declaration fails silently. WHAT M2 ADDS: the two-axis split has direct prior art in how CI systems separate runner selection from human approval — runner labels in one place, environment protection rules in another, configured independently. That is the same shape as complexity picking the hands and autonomy picking the eyes, and it is why the grid was rightly dropped. NOT ESTABLISHED and named rather than left blank: three questions the kickoff scan could not close remain open, and M2 did not reopen them because nothing in M2 depends on them.

## goals_served

- Every state in the rigor matrix carries a complexity rating on a five-rung ladder (C0 derive, C1 transcribe-or-rule, C2 apply, C3 author, C4 frame), each rated with evidence rather than asserted.: nothing yet — M3 owns it. M2 produced the JOURNEY the ratings serve: uc-let-the-machine-name-the-driver reads them live at a milestone boundary and takes the maximum, so the ratings now have a consumer with a written guarantee rather than only a home.
- ONE fixed model list lives in the repo, identical on every host, mapping each rung to a model name.: nothing yet. M2 produced two constraints on it that did not exist before. uc-let-the-machine-name-the-driver extension 4a: a missing entry must name the unmatched rung and publish NO driver, never fall back silently, because a silent fallback is indistinguishable from a working lookup. Extension 4b carries the per-host alias problem into the pass itself.
- Each milestone names the driver it needs before it is walked, computed live from the matrix and never pinned into a record's demands.: nothing built, and M2 produced the sharpest thing said about it yet — nbr-the-driver-that-performs-the-spawn, minted EMPTY. The pass terminates in a receiver that does not exist on an unattended box. sty-the-machine-picks-the-hands carries it as a slide that does not fill.
- Every call in the lane records which model actually answered it, so a walk can be attributed after the fact.: nothing yet — M7 owns the field. M2 produced uc-attribute-a-finished-walk with the guarantee that matters: either one query answers it, or the record says WHICH coordinate is missing, never a partial answer that reads as complete. And it named what would make an M6 demo lie — stamping the model asked for rather than the one that answered.
- A submachine takes the MAXIMUM complexity over its items, so one walker strong enough for the hardest item walks all of them and a fan-out never becomes a fleet.: nothing built. M2 wrote the rule into the pass as step 3 with extension 3a, and carried forward M1's condition that the per-item values are surfaced rather than merely consumed. That condition is now in a use case rather than only in a risk entry.

## bound_breaches

- if-agent-harness-to-entrypoint: BREACHED, re-measured at this gate over 400 records. Bound is one second; 26 calls exceeded it. SIX ARE FAR OUT — between 15.2 and 18.4 seconds, every one an se_pull, and they are the reopen cascades: re-signing a state recomputes the demand ledger for the whole column and the claim guard walks the downstream cone. The rest sit between 1 and 4 seconds and are ordinary state transitions and form submits. NO READ, SEARCH, WRITE OR QUERY CAME NEAR THE BOUND. DISPOSITION: not i38's to fix and not waved through. The 15-to-18-second class is NEW INFORMATION rather than the standing shape — i33 measured 1834 slow calls in 8424 without anything like it — and it is worth the owning milestone knowing that a reopen is roughly five times more expensive than a transition. Recorded in the field report.

## round_2_red_team

- STEELMAN, THE STRONGEST CASE THAT M2 PRODUCED NOTHING: two stories and two use cases that restate the goals in a different grammar, one stakeholder whose only evidence is that this very session used subagents, and one neighbour minted deliberately empty. Every artifact is a description of something not built. A sceptic would say the milestone's real output is four files that will be read once, at the next gate, by the agent that wrote them => THE CHARGE IS FAIR ABOUT THE FORM AND WRONG ABOUT THE CONTENT. Three things in M2 are not restatements and did not exist before it: the empty neighbour, which turns an unexamined assumption that somebody is listening into a hole with a shape; extension 4a, which forbids a silent fallback and is a refusal clause in waiting; and the observation that an M6 demo stamping the requested model rather than the answering one would pass every assertion and prove nothing. None of those is in the goals, the scope, or M1.
- THE ASSESSOR ROLE WAS MINTED ON EVIDENCE THIS SESSION GENERATED ABOUT ITSELF, which is close to writing your own reference => TRUE, AND THE EVIDENCE IS STILL CHECKABLE BY SOMEBODY ELSE. The claim is that three reviewing agents found five things the walker did not, and every one of the five is named in signed evidence with a file and line behind it. WHAT WOULD MAKE IT SELF-SERVING is if the mint had rested on the reviewers being GOOD; it rests on them being SEPARATE, and the same evidence records one of the nine claims a reviewer made being wrong. A role justified partly by its own reviewer's error is not flattery.
- ROUND 0 FOUND TWO ERRORS AND YOU ARE PRESENTING THAT AS AN IMPROVEMENT, when the honest reading is that this milestone made two more of exactly the mistakes the last gate cost five reopens to fix => BOTH READINGS ARE TRUE AND THE SECOND IS THE MORE USEFUL ONE. The error RATE did not obviously fall; what changed is where they were caught. The story count was eyeballed off a listing the same way the rung count was recalled off a page one milestone earlier, with the lesson already written down. AN AGENT THAT HAS JUST BEEN BURNED BY UNCOUNTED NUMBERS STILL WROTE AN UNCOUNTED NUMBER, and that is the finding worth carrying rather than the recovery.
- THE VALUE-PROP SWEEP FAILURE IS THE SAME SHAPE AS THE REGISTER SWEEP FAILURE ONE MILESTONE EARLIER, twice in two milestones => YES, AND NAMING THE SHAPE IS WORTH MORE THAN NAMING EITHER INSTANCE. Both times a SUBSET was checked and written in the voice of a sweep. Both times the conclusion happened to hold, so nothing downstream broke and nothing signalled. A subset stated as a sweep is indistinguishable in the text from a sweep, and it is only caught by somebody re-running the whole set. That is a mechanical check, not a discipline problem, which is precisely the argument for binding a claim to a re-executable query.
- YOUR OWN NARRATION IS THE WORST-BEHAVED THING IN THE LOG: over 400 records, 36 failed, and 25 of those are narration clauses — SE-C-121 fourteen times and SE-C-133 eleven => CONFIRMED BY MEASUREMENT AND IT IS THE WALKER'S FAULT, NOT THE ENGINE'S. The 121s are node ids guessed from the order I had planned items in, when every result hands the open node map back. The 133s are a checklist that stopped closing while the reopen cascades ran. Neither cost the work anything and both made the log a worse witness, which on an unattended box is the only witness there is.
- THE SIX PULLS BETWEEN FIFTEEN AND EIGHTEEN SECONDS ARE A NEW COST NOBODY HAS PRICED => TRUE AND WORTH THE OWNING MILESTONE KNOWING. They are reopen cascades — re-signing recomputes the demand ledger for the whole column and walks the downstream cone. i33's measurement of the standing shape has nothing like them, so a reopen is roughly five times a transition. This iteration made nine of them and would have made none if its evidence had been right the first time.
- KILL-CRITERION FOR THIS GATE, NAMED AND LOOKED FOR: the inputs are wrong if the journeys describe a system nobody asked for — that is, if the actors would not recognise the passes as things they want to do => NOT MET, WITH ONE QUALIFICATION. stk-engineer-driving-agents wants both passes and nine of ten value props already point at that role, so the forward and backward journeys land where the product already builds. THE QUALIFICATION: the pass that the design most depends on — somebody keeping the list current — belongs to an actor with no node, so its want is asserted by nobody. That is registered rather than resolved, and it is the one place the picture is incomplete rather than wrong.
- SO WHAT SURVIVES: the journeys are right, one of them terminates in an empty room, and the milestone's own evidence needed correcting twice before this form could be filled => PASS WITH OVERRIDES, and the overrides are the empty receiver, the actorless maintenance pass, and an error rate in the evidence that a mechanical check would remove and discipline has now twice failed to.

## raid_additions

- raid-iss-two-always-on-roles-have-no-node-and-one-now-carries-a-duty
- raid-risk-naming-a-driver-per-milestone-moves-the-step-shapes-and-reopens-standing-claims
- raid-asm-the-answering-model-can-be-recorded-when-only-the-agent-knows-it

## verdict

pass with overrides — the journeys are the right two and one of them terminates in a room with nobody in it: the receiver is drawn empty, the maintenance pass has no actor to want it, and this milestone's own evidence needed two corrections before the form could be filled.

## follow_up

- M3 INHERITS THE CANDIDATE THAT COULD REPLACE THE CENTRAL MECHANISM: derive a rung from what a state declares will judge its output. It is not a footnote — if it works, the fixed table is a worse version of a better thing, and this design has to beat it there.

- EXTENSION 4a IS A REFUSAL CLAUSE IN WAITING and the requirements should take it as one: a missing list entry must name the unmatched rung and publish NO driver. A silent fallback to the session's current model is indistinguishable from a working lookup, which is the failure the whole mechanism exists to avoid.

- THE M6 DEMO HAS A WAY TO LIE and it is written down now rather than discovered then: stamping the model that was ASKED for rather than the one that ANSWERED passes every assertion in the backward case and proves nothing.

- THE MAINTENANCE PASS WAITS ON A PRODUCT-LEVEL STAKEHOLDER NODE. Until then the honest answer to "who keeps the list current" is nobody, on the record.

- ONE THING FOR A RETRO RATHER THAN FOR THIS ITERATION, and the measurement is above: twice in two milestones a SUBSET was checked and written in the voice of a sweep, and both times the conclusion happened to hold so nothing signalled. Discipline has now failed at it twice with the lesson already written down. That is an argument for a mechanical check — a claim bound to a query the engine re-runs — rather than for trying harder.

## anything_else

WHAT THIS ITERATION HAS MINTED SO FAR, counted by searching the trace for the
record stamp rather than by remembering.

NINETEEN NODES across six kinds: eleven register entries, two value props, two
stories, two use cases, one stakeholder, one neighbour.

THE REGISTER IS THE BULK OF IT and that is the shape of this iteration rather
than an accident. Four risks, two assumptions, four issues, one dependency.

- Four RISKS about the mechanism failing quietly: the milestone seam moving
  step shapes, the rung drifting upward unnoticed, the submachine maximum
  dragging easy items along, and the weaker-model asymmetry having nothing
  enforcing it.
- Two ASSUMPTIONS, both with their probes written at identification: one list
  serving every host, and the answering model being recordable when only the
  agent knows it.
- Four ISSUES, present tense: the engine does spawn an agent while the seed
  denies it; the seed counts a matrix that has moved; a call cannot be
  attributed to its state; and two always-on roles have no node while one now
  carries a duty.
- One DEPENDENCY, and it is the one that decides whether any of this pays: the
  payoff waits on a weak model being able to boot at all.

TWO OF THE ELEVEN ARE ABOUT THE ITERATION'S OWN SEED being wrong, which is
unusual enough to say out loud. They cannot be closed by any state below,
because correcting a record's rulings is not a walking milestone's act.

A NOTE ON HOW THIS FIGURE WAS ARRIVED AT, given the milestone's history: it was
produced by a search over the record stamp and counted by program. The two
numbers this milestone got wrong were both produced by reading a listing with
my eyes.
