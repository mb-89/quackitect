---
form: gate-architecture
bless: blessed by agent
by: agent
signed_off: 2026-08-20T17:40:16.994Z
authors: agent
files:
---

# Evidence form / gate-architecture

## current_situation

M5 asks to be blessed and it should be. THE FORM THAT STOOD HERE SAID THE OPPOSITE, and what changed is not the architecture.

### What this gate found, and it was right

IT RAN THE CHECK NOBODY HAD RUN. A must gates a candidate and a should scores one; `cut-criteria` said so and no state in M4 or M5 had held a must against a candidate. Run here, it returned that the declared architecture violated five of the five musts bearing on it and that every rejected candidate violated at least one.

AND IT NAMED THE CAUSE CORRECTLY: the requirements named the seed's mechanism rather than the need behind it, so a design that improved on the mechanism necessarily failed the demand encoding it. M4's whole search had been excluded a priori by M3's output.

### What it got wrong, and what was underneath

FIVE OF FIVE WAS THREE OF FIVE. Three musts named mechanisms. The fourth apparent violation rested on a sentence `cand-whoever-holds-the-hands-decides` wrote about itself — that it can never record what answered — which `req-every-call-records-the-model-that-answered-it`'s own Detail contradicts. The fifth was a `Where` clause whose antecedent cannot hold on a design holding no roster.

A FOURTH MECHANISM-NAMING MUST WAS FOUND LATER and by a different instrument. `req-the-complexity-value-is-read-live-and-never-pinned` forbade a pinned read where its own `breaks_if_removed` is entirely about the demand ledger, and it excluded two of the four lines on a clause nobody had argued for. Reading the requirements did not find it; holding them against the candidates did.

AND THE ROOT WAS TWO LAYERS ABOVE THIS GATE. `uc-let-the-machine-name-the-driver` carried the seed's design in its own steps — "It takes the MAXIMUM", "one file in the repository and the same file on every host", "It puts the model name on the pull". Every mechanism-naming must was a faithful derivation from it. The use case is restated and `gate-inputs` is re-earned with the test it was missing.

### What this gate said it could not settle, and why that was wrong

ITS OWN CLOSING LINE: "whether the repair is to amend the requirements to state needs, or to accept that the seed's mechanism was the requirement all along ... Both are legitimate and the choice is not a gate's to make."

THE CHOICE WAS ALREADY MADE, IN THE METHOD. `meth-requirement-authoring`:148 — "A named mechanism is design frozen as obligation. Name the outcome; the mechanism is M4's to choose." `items/requirement`:143 — "WHAT, NEVER HOW." A gate that finds a requirement violating a standing method rule is not choosing between two legitimate readings; it is finding a defect with a named repair.

DEFERRING IT READ AS RESTRAINT AND WAS THE SAME FAILURE THIS RECORD KEEPS CATCHING: a defect named accurately, in the right place, with the right severity, and then walked past. That is the shape contract rule 5 describes.

### Where it stands now

FOUR MUSTS RESTATED, five requirement Details corrected, the use case restated, four candidates completed against the musts and audited by five cold passes, two option nodes and four register entries amended.

THE WINNER VIOLATES NO MUSTS and dominates both eligible rivals on every axis. `cand-the-reader-beside-the-walk` violates two and is eliminated. The comparison became decisive by losing the line that made it interesting.

## round_0_verify

- evidence vs claims: THE CENTRAL CLAIM OF THIS GATE'S FIRST RUN IS WITHDRAWN AND ITS DIAGNOSIS IS KEPT. Five-of-five was three-of-five: two of the five rested on a candidate's over-statement of its own weakness and on a `Where` clause that cannot fire. The diagnosis under it — that the requirements named the seed's mechanism — was right, understated by one, and rooted one layer higher than this gate looked.
- element and interface debt: pass, re-checked. Twenty-three elements, nothing unimplemented, three interfaces owed when el-sizing landed and three declared. `reduce-a-milestone-to-one-difficulty` remains allocated and uncalled, and that now records a design choice rather than a conflict with a must.
- types: pass. Every node minted or amended in M5 resolves, the element matrix reports no missing crossing, and the three interfaces owed when el-sizing landed are declared. M5 produced no code, so nothing here is typechecked in the compiler sense.
- lint: pass at artifact shape. Every node minted here loads, and SE-C-138 refused none of the roughly forty writes and patches this milestone made. WHAT LINT DOES NOT SEE is every defect this gate actually found: a Detail arguing against its own statement, a quotation naming a file it is not in, a state name that resolves to nothing. All three are mechanically checkable and none is checked.
- node corrections: SEVEN NODES AMENDED IN PLACE at this gate and at the states below it, each carrying the reason on its own face rather than overwritten — two option nodes, `el-account`, and four register entries including the deciding ADR. THE OVER-STATEMENT THEY SHARED came from one sentence in one candidate and reached five artifacts before anybody checked it against the requirement.
- tests: not owed at M5 and none run. M5 produced no code.
- must-check: RUN THREE TIMES BY COLD READERS over all forty pairs, after being run zero times by any state in M4 or M5. Seven of the ten musts discriminate between these lines; three live in `cluster: the-account`, are carried by `fn-run-a-governed-walk.stamp-who-answered-and-where`, and every line inherits them unchanged.

## round_1_validate

- exercised against the goal: YES, AND AGAINST A REGISTER THAT HAS SINCE BEEN REBUILT. Forty-three quality scenarios, five should-axes, and now ten musts. The first run of this gate could say the architecture was measured against the wrong ruler; that criticism is spent.
- missing: THE COST AXIS, after four askings. Nothing in the surviving five measures spend, exactly one row in the 119-row pool mentions cost, and the winner spends nothing on the walk without having been chosen for it. ALSO MISSING: any reader of the acting role, which is why two of five axes measure the two halves of something no design addresses.
- wrong: THE ROOT WAS AT M2 AND THE REPAIR RAN UPWARDS FOR A DAY. Requirements, then functions, then flows, then candidates, then the use case they all derive from. Each layer was repaired against a layer still wrong, which is why the same defect kept reappearing somewhere new.
- out of scope: the build, and the spike. `nbr-the-driver-that-performs-the-spawn` says the receiver reads and cannot act, and every scenario this architecture addresses assumes publishing reaches somebody who can use it. That is M6's to test.
- prior art: not re-scanned. The repair moved wordings and completed candidates; it produced no new design question. Every fill resolved to an option already on the chart or a clause already in a requirement's Detail.

## goals_served

- Every state in the rigor matrix carries a complexity rating on a five-rung ladder (C0 derive, C1 transcribe-or-rule, C2 apply, C3 author, C4 frame), each rated with evidence rather than asserted.: NOT RATED — M7 owns the ratings — AND NOW SERVABLE BY THREE DESIGNS RATHER THAN NONE. The demand is a complexity obtained for every applying cell, refusing loudly where it cannot. Declaring satisfies it, deriving from field count satisfies it, and this architecture's two figures satisfy it. THE POPULATION IS 154 ACTIVE CELLS and the two-part figure doubles that to 308.
- ONE fixed model list lives in the repo, identical on every host, mapping each rung to a model name.: NOT SERVED, AND THIS IS THE ONE THE OWNER SHOULD READ. The architecture publishes a rung and holds no roster; it scored 4 on surviving a host swap against 2 for every roster-holding rival. THE OWNER'S RULING STANDS AND THE SPEC NO LONGER ENFORCES IT — the ruling was written into the use case's guarantee, which turned an input to a design choice into an obligation on every design, and that is what made M4's search a formality. The conflict is on the call log as an answered question rather than only in this form.
- Each milestone names the driver it needs before it is walked, computed live from the matrix and never pinned into a record's demands.: PARTLY SERVED. Nothing is named per milestone; `raid-dec-difficulty-is-two-figures-and-is-named-per-state` publishes per state, which the restated sizing must permits with a unit of one. The never-pinned half is now the demand it always meant: keep a complexity out of every record's demand ledger, fatal, with a named test.
- Every call in the lane records which model actually answered it, so a walk can be attributed after the fact.: SERVED, AND UNVERIFIABLE. `fn-run-a-governed-walk.stamp-who-answered-and-where` carries it in the account cluster and every line inherits it. The answering value is self-reported, which the requirement asks be MARKED rather than forbidden. WHAT THIS ARCHITECTURE GIVES UP IS THE CROSS-CHECK: holding no roster, nothing here learns which model a rung resolved to. That is `raid-ar-the-actor-is-recorded-where-the-call-is-served`, graded certain because it is chosen rather than risked.
- A submachine takes the MAXIMUM complexity over its items, so one walker strong enough for the hardest item walks all of them and a fan-out never becomes a fleet.: NOT SERVED AND NO LONGER DEMANDED. The restated must asks that the engine name, for every unit it sizes, a difficulty no weaker than the hardest step inside it, with the distance readable. This architecture never groups, so the unit is one and the spread is zero. `reduce-a-milestone-to-one-difficulty` is allocated to el-sizing and never called, deliberately, so the choice shows.

## bound_breaches

- if-agent-harness-to-entrypoint: BREACHED AND WORSENED BY THIS ARCHITECTURE. Measured in this session: 89 of 1520 lane calls exceed the interface's declared 1-second bound, 5.9 per cent, and 87 of the 89 are se_pull; across 460 pulls the median is 357 ms and the tail runs p90 1686, p95 2761, p99 16285, worst 18377. The declared architecture puts a per-step read on that same verb. The bound carries no percentile, so a 5.9 per cent breach cannot be judged against it either way — read as a ceiling the interface fails outright, read as a median it passes with room, and nobody has written which. That is unchanged from M4's reading and it now has a design leaning on it.

## round_2_red_team

- THIS GATE'S OWN VERDICT WAS WRONG IN THE DIRECTION THAT LOOKS RIGOROUS => IT WAS. Refusing to bless reads as the harder call, and it was the easier one: it named a defect accurately, graded it correctly, and handed the repair to nobody. THE METHOD ALREADY HELD THE ANSWER — meth-requirement-authoring:148 and items/requirement:143 — so a requirement naming a mechanism is a defect with a named repair, not a choice between two legitimate readings. THE SENTENCE "the choice is not a gate's to make" IS THE FAILURE SHAPE contract rule 5 describes, in one line, in the state whose job was to catch it.
- YOU SAID FIVE OF FIVE AND IT WAS THREE => AND THE TWO EXTRAS ARE MORE INTERESTING THAN THE THREE. One was a `Where` clause whose antecedent cannot fire on a design holding no roster — a vacuous truth read as a violation. THE OTHER WAS A CANDIDATE'S HONEST OVER-STATEMENT OF ITS OWN WEAKNESS, quoted into five artifacts because nobody suspects a design of understating itself. A self-reported weakness is evidence of candour and not evidence of the weakness.
- YOU FOUND THE ROOT AND STOPPED ONE LAYER SHORT OF IT, TWICE => THE FIRST TIME it was the requirements, and the sweep that found three mechanism-naming musts missed a fourth of a different kind — a guard drawn wider than its own harm, invisible to the question "which mechanism did the seed choose". THE SECOND TIME it was the use case, found by the fifth cold pass, carrying the maximum and the one file and the model name in its own steps. EACH LAYER WAS REPAIRED AGAINST A LAYER THAT WAS STILL WRONG, so the defect kept being copied down faster than it was removed. THE CHEAP QUESTION NOBODY ASKED, at the first mechanism-naming requirement: where did this mechanism come from? It is one read of `source_refs`.
- FIVE COLD PASSES AND NOT ONE RETURNED NOTHING => TRUE, AND THE CHARACTER OF THE FINDINGS IS THE READING RATHER THAN THE COUNT. Passes one and two moved verdicts — a candidate eliminated, the register repaired, two lines returned to eligibility. Pass three moved two scores. Passes four and five found citations, attributions, unpropagated repairs and vocabulary; none moved a verdict and one moved the root. THE LOOP IS CLOSED ON OUTCOME AND NOT ON PROSE, and this gate says so rather than claiming the corpus is clean.
- AND THE REPAIRS THEMSELVES HAD ONE SHAPE, FOUR TIMES => A CORRECTION APPLIED TO THE FILE THAT CITES A THING AND NOT TO THE THING ITSELF. The dashboards sentence, the `demandOf` citation, the weaker-driver answer, the account musts. EACH TIME THE CITING FILE WAS THE ONE BEING READ. A repair lands where attention is, and attention is on the reader rather than the source.
- THE WINNER IS UNFLIPPABLE AND THAT IS WORTH LESS THAN IT SOUNDS => The comparison became decisive by losing the line that made it interesting. `cand-the-reader-beside-the-walk` beat the winner on the actor axis, cost nothing on the walk, and could take the winner's only structural advantage without becoming it. IT IS OUT ON TWO MUSTS IT WROTE ABOUT ITSELF, and the whole decision now rests on one clause of one requirement: whether publishing into a record that does not exist until after the call counts as publishing on the pull. That is the thing to press on, not any cell of the chart.

## raid_additions

- raid-ar-the-actor-is-recorded-where-the-call-is-served
- raid-ar-audit-answers-from-log
- raid-risk-the-reader-can-take-the-leaders-only-structural-advantage

## verdict

pass with overrides — and the first run of this gate refused to bless the same architecture.

WHAT CHANGED IS NOT THE ARCHITECTURE. Four musts were design frozen as obligation, and so was the use case they all derive from. All are restated to the outcomes their own `breaks_if_removed` fields already named. The winner now violates none of the ten and dominates both eligible rivals on every axis.

WHAT THIS GATE GOT RIGHT AND SHOULD BE CREDITED WITH: it ran the must-check that no state in M4 or M5 had run, and it named the cause correctly.

WHAT IT GOT WRONG: the count, by two; the root, by two layers; and the disposal — "the choice is not a gate's to make" — where the method had already made it.

THE OVERRIDES.

- The cost axis is absent after four askings, and the winner spends nothing on the walk without having been chosen for it.
- Two of the five surviving axes measure the two halves of accountability and no design addresses either.
- `req-a-machine-decision-repeats` was minted to let the comparison express why the chosen design is chosen and its own priority excludes it from the comparison. Still open.
- The rung readings behind the whole design remain judgments rather than measurements, unchanged since M3.
- The winner does not serve the kickoff's second goal and the spec no longer enforces the owner's ruling. On the call log as an answered question, not settled here.
- Every load-bearing finding in this repair came from a commissioned reader rather than from the walk, now true of four consecutive milestones.
- `nbr-the-driver-that-performs-the-spawn` says the receiver reads and cannot act, and the winner's entire value is downstream of that being fixable. M6's spike.

## follow_up

M6 INHERITS ONE QUESTION THAT DECIDES WHETHER ANY OF THIS SHIPS, and it also settles the owner's ruling without anybody arguing about it. Can a receiver read a published rung and start a stretch on it? If no receiver can act on a model name either, the roster is a file maintained for nobody and publishing a class is the honest answer. If one can, the ruling wins on merit rather than by having been written into the spec.

THREE MECHANICAL CHECKS ARE THE STRONGEST CONCRETE LEADS THIS MILESTONE PRODUCED and none is built, because building engine checks at a design gate is not this state's work.

- A QUOTED-STRING CHECK. A quotation with a named source is a pair — string, file — and the question is whether the string is in the file. Both fabrications this milestone produced are halves of that one check, and running it by hand over this gate's own form took four calls.
- A DETAIL-VERSUS-STATEMENT LINT. Five requirements were restated here and all five left prose arguing for the mechanism the statement had dropped. Flagging a Detail that repeats a distinctive phrase the statement no longer contains would have caught every one at the write.
- A STATE-NAME CHECK. `gate-design` appears five times in this record and is defined nowhere in `project/deliverable`. State ids are a closed set the engine already holds.

AND ONE QUESTION FOR THE METHOD RATHER THAN FOR THE ENGINE. `derive-functions` asks of every function whether two honestly different designs could both do this, and says why: a function naming a technology collapses M4's space before anybody compares anything. `write-requirements` carries WHAT-NEVER-HOW. NOTHING ASKS IT OF A USE CASE, which sits above both and is where the mechanism entered this record.

ONE STALE CELL IS OWED A READER. `cand-the-seed-made-total` on `req-a-wrong-act-never-passes-silently` was scored 3 against an open pin seam that the live-read restatement has closed. It does not change the outcome.

## anything_else

