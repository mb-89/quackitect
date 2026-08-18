---
form: gate-architecture
bless: blessed by agent
reopened: "2026-08-18T15:40:50.813Z — evaluate-architecture was re-signed after the fitness flags landed, so this claim answered ground that has since moved"
by: agent
signed_off: 2026-08-18T15:40:54.636Z
authors: agent
files:
---

# Evidence form / gate-architecture

## current_situation

M5 CLOSES HERE, and this is the gate a major exists to pass.

WHAT STANDS. Twenty-two elements, 41 interfaces, 35 functions. The winner is cand-the-program-route, seated at converge-pugh with the Pugh runs stable, and its picks are six recorded decisions.

WHAT THIS MILESTONE FOUND IN ITSELF. The winning design's central mechanism had no function and therefore no element. Taking an update was named in prose on a flow node and its mechanism handed to a boundary crossing, so nothing modelled it. Reporting what a vehicle changed had no function either, though a requirement clause demanded it.

BOTH ARE CLOSED. Two functions, two elements, three flows and one interface, with the cluster they joined rewritten because they gave it its first internal flow.

AND THE MATRIX FOUND IT, not a reviewer. That is what the completeness check is for and it is the strongest evidence on this page that the check works.

### What the scenario walk returned

TWENTY-EIGHT CARDS: 9 addressed, 16 at risk, 3 unaddressed. FOURTEEN OF THE SIXTEEN AT-RISK CARDS WERE ALREADY AT RISK before this record opened. Two are this iteration's.

SIX OF THE TWENTY-EIGHT HAD NEVER BEEN RULED AT ALL. They arrived after the last architecture evaluation, and two of the three unaddressed verdicts come from that six.

### How the review was kept honest

NINE CARDS WENT TO CLEAN-CONTEXT READERS. Three because this iteration wrote the evidence beneath them, and six because a first ruling deserves a reader with no prior verdict to inherit.

AND TWO CLAIMS WERE MEASURED AT THE CODE rather than cited from the register. Both settled contradictions, and both bear on FATAL cards.

## round_0_verify

- evidence vs claims: TWO CLEAN-CONTEXT READERS TOOK NINE OF THE TWENTY-EIGHT CARDS, and every verdict they returned quotes a file and a line. Three went out because this iteration wrote the evidence under them — req-overlay-survives-update now names el-update-runner, an element written twenty minutes earlier by the same hand that would have blessed it. Six went out because they had never been ruled at all. AND TWO CLAIMS WERE MEASURED RATHER THAN CITED: the bypass surface, which the register carried at two disagreeing values, and the overlay machinery, which a second-hand citation described. Both counts are recorded with their patterns so a later reader can re-run them.
- one reader was wrong and it is kept rather than dropped: it treated an element not restating a requirement in `satisfies` as evidence of weakness. The trace reaches elements through functions, and decompose-structure's own rule is that nothing is written twice. Its other findings survived and are acted on.
- types: NOT RUN AND IT WOULD ANSWER NOTHING. No TypeScript changed at M5. The engine was READ at four points — paths.ts, tools.ts, and two counts across the tree — and nothing was written to it.
- lint: NOT RUN, and se_lint is not among this state's legal tools. The lane holds the linters for the states that build. Nothing written across M4 or M5 has been through a lint pass, and the honest statement is that these artifacts are unlinted rather than clean.
- tests: NOTHING TO RUN AND NOTHING SKIPPED. M5 produced no code. The full battery belongs to verification and is fired by that state's own exit script. One thing is owed there from this morning: the confirm run on the retro's window fix.
- flow closure: RAN AND PASSED over the rebuilt function set, which is the mechanical check confirming the three new flows land on both ends.

## round_1_validate

- exercised against the goal: THE STRUCTURE WAS WALKED AGAINST 28 QUALITY SCENARIOS, worst grade first. 9 addressed, 16 at risk, 3 unaddressed. AND THE TWO NEW ELEMENTS WERE EXERCISED AGAINST THE USE CASE THAT DEMANDED THEM: uc-vendor-and-overlay steps 6, 7 and 8 had nothing behind them before this iteration and now have el-update-runner and el-change-reporter with an interface between them.
- how much of the risk is ours: ONLY TWO OF THE SIXTEEN AT-RISK CARDS ARE THIS ITERATION'S. req-overlay-survives-update hinges on an element written here, and req-trees-never-mix turns on the overlay boundary this iteration is about. The other fourteen are the standing system's and were at risk before this record opened.
- missing: THE OVERLAY-LOCATION DECISION. raid-risk-the-overlay-location-is-unchosen says M4 and M5 settle it and record it at record-adrs. Six decisions were recorded there and none is this one. ALSO MISSING: a criterion asking whether the resolution order is stated, in an iteration whose whole subject is the overlay. AND tests/latency.test.ts, which a test spec names as the home of the one-second line and which is not in the tree.
- wrong: ONE COUNT IN MY OWN PLAN. I carried "four unimplemented functions" into decompose-structure and the matrix said two — el-vehicle-producer and el-project-producer already existed. Corrected on the form. AND ONE SPLIT IN THE REGISTER was resolved rather than carried: req-acts-carry-role-and-channel held an open risk and an addressed verdict at once.
- out of scope: THE UPDATE PROGRAM'S FORMAT, which is M6's and which the tripwire probes. The code for any of it, because M5 produces none. Widening the path jail, which is a live issue in the register and not this state's to settle. Reading the 2010 abandonment study, which two nodes cite as primary-not-seen and which no verdict here leans on.
- prior art: NOT COMPARED AT THIS GATE, AND THAT IS A FINDING RATHER THAN A BLANK. gate-candidates did the field comparison properly — Nixpkgs overlays, Debian 3.0 quilt, Copybara, git subtree, cruft diff, global.json, Bazel's sandbox, all with primary sources. WHAT NOBODY COMPARED IS THE STRUCTURE. No architecture from any of those products was set beside this decomposition, so nothing here says whether 22 elements and 41 interfaces is ordinary, heavy or thin for this job. THE ONE PLACE THE FIELD IS STILL AHEAD is unchanged and it bites this gate: Debian refuses the build when the tree holds changes no patch accounts for, and no element in this structure has a counterpart.

## goals_served

- A DESCENDANT IS A COMPLETE INDEPENDENT COPY. It comes up on a machine with nothing of the parent's beside it, and everything in it is its owner's to change in place, including the parts the parent wrote. (vp-vendoring, amended 2026-08-18. Its requirement is OWED at write-requirements — req-engine-folder-is-sealed said the opposite and is removed there on the owner's ruling.): SERVED, AND IT NOW HAS A STRUCTURE. el-vehicle-producer makes the tree and sits at no interface at all, which is the isolation rule showing itself in the shape rather than a hole in the wiring.
- NOTHING A DESCENDANT DOES CAN REACH ITS PARENT. No write, no link, no mount, no install step that writes to the source. The rule names the DIRECTION OF WRITES rather than any mechanism. (raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours, minted from v2's law with its witness: a symlink and a routine cleanup deleted a repository on 2026-07-25.): SERVED, AND THE STRUCTURE PROVES IT BY CONSTRUCTION. bring-forth-a-vehicle is the only function in the matrix with no edge in either direction. The two elements added this iteration were checked against it and run the legal way: both live inside a vehicle and act on that vehicle's own tree.
- THE OVERLAY WINS BY IDENTITY. Where a descendant carries a card for an identity the engine also ships, the descendant's card is served at every point that identity resolves, and an un-overridden resource is inherited. (req-overlay-resolution): SERVED AS A DESIGN AND NOT AS A SYSTEM, and this gate says so plainly. The engine holds zero lines of method-overlay machinery. Twenty-six uses of the word, twenty in the trace UI, and the three in serving code are a git environment overlay, a thumbs-up badge and a graph-route drawer.
- IT WORKS WITH NO OVERLAY AT ALL. With none present, the product comes up on the engine's shipped method and zero builder-authored configuration files. (req-setup-serves-shipped-method): SERVED, and it is the only one of the six that the structure does not put at risk anywhere. No scenario in the deck touches it, which is the quiet kind of served.
- AN UPDATE REACHES A DESCENDANT WITHOUT TAKING ITS CHANGES AWAY. What no longer resolves is REPORTED rather than silently defaulted. HOW is the open design question of this iteration and it is not answered here. (req-overlay-survives-update, req-overlay-drift-reported, raid-risk-ownership-and-receiving-pull-against-each-other): SERVED, AND IT IS THE ONE GOAL THIS ITERATION ACTUALLY BUILT STRUCTURE FOR. Two elements, one interface, and the act that was named in prose and modelled by nothing now has a function, an element and a contract. AND ITS SCENARIO IS RULED AT RISK, on a hinge that is one of those new elements: the design buys indifference to restructuring and pays with no collision signal.
- ONE COMMAND MAKES A DESCENDANT. The export produces a complete named copy with an empty overlay ready to write into, and no second install of anything. (req-second-product-reuses-install): NOTHING YET — M6 OWNS IT, unchanged from the last two gates. What M5 hands it is an element with a black-box description and a stated realization concept: a clone, a delete of two folders, one file written, one commit.

## bound_breaches

- if-agent-harness-to-entrypoint: BREACHED AND NOW MEASURED FROM TWO SIDES. The submit path is unchanged since the last gate: every slow call carries a multi-kilobyte form submit, 93 breaches in the day, worst 20.5 seconds, typical 2 to 4. THIS GATE ADDS THE READ SIDE, which the last one could not see. The scenario walk found that the signal meant to cover a breach reads a job registry holding only spawned children, so every one of those 93 in-process calls passed the bound in silence. That is raid-ar-work-past-its-bound-says-it-is-working, minted here. THE DISPOSITION IS UNCHANGED FOR THE LATENCY and new for the silence: the latency is the cost of writing evidence and M6 owns it, and the silence is now a register entry with a named hinge rather than an observation nobody filed.

## round_2_red_team

- STEELMAN, the strongest case that this gate should FAIL: sixteen of twenty-eight scenarios are at risk and three are unaddressed, three of them FATAL, and a milestone whose own evaluation cannot clear half its quality bar has not produced a structure fit to build on => THE COUNT IS RIGHT AND THE INFERENCE IS WRONG, and the check is which cards moved. Fourteen of the sixteen were at risk before this record opened and are the standing system's. Two are this iteration's. A gate that failed on inherited risk would be failing every iteration for the same reason forever, and it would never once name what THIS one broke.
- KILL-CRITERION 1, the decomposition is not actually complete: an element, an interface or an allocation is missing and the matrix cannot see it => CHECKED AND NOT FOUND. Interface debt 0, unimplemented functions 0, idle elements 0, all computed from the nodes rather than typed. The one gap that existed was found and closed in this same walk: two functions with no element, which is exactly the class this check exists to catch, and it caught it.
- KILL-CRITERION 2, the structure cannot answer the iteration's own demand => THE DEMAND IS ANSWERED AND THE ANSWER IS UNTESTED. req-the-system-runs-in-a-tree-that-is-not-its-own reaches el-project-producer and if-project-producer-to-resolution-seam, both written, both naming the record's format as the contract. Nothing has exercised it and the interface says so.
- THE OVERLAY-LOCATION ADR IS OWED AND M5 IS ENDING WITHOUT IT => CONFIRMED AND IT IS THE SHARPEST DISSENT ON THIS PAGE. raid-risk-the-overlay-location-is-unchosen says M4 and M5 settle it and record it at record-adrs. Six decisions landed there and none is this one. A FATAL card counts writes across a boundary whose position is undecided, so req-trees-never-mix cannot be discharged until somebody chooses.
- THE WINNER'S SAFETY STORY IS A HUMAN BEHAVIOUR NOBODY HAS OBSERVED => CONFIRMED AND NEWLY MINTED. raid-asm-a-vehicle-owner-reads-the-update-diff, graded crippling and expected to fail. The design's whole answer to a wrong migration is that the result sits unstaged in front of a person. The candidate it beat by one cell errors out instead and needs nobody to read anything.
- THREE OF THE TWENTY-TWO ELEMENTS ARE OFF THE LIVE PATH => CONFIRMED, and it changes how three at-risk verdicts should be read rather than whether they stand. raid-debt-core-and-satellite-is-off-the-live-path records that the cluster is built and tested and nothing the running server imports reaches it. A hinge on el-core or el-satellite-supervisor is a hinge on a design, and the gate should not read those three as reports on a running system.
- NO STRUCTURAL PRIOR ART WAS COMPARED => CONFIRMED AND UNFIXED. Seven external products were compared at gate-candidates on MECHANISM, with primary sources. Not one of their architectures was set beside this decomposition, so nothing says whether 22 elements is ordinary or heavy for this job. Stated here rather than quietly left.
- THE AGENT BLESSING ITS OWN STRUCTURE IS THE WEAKEST LINK IN THIS PAGE => TRUE, AND MITIGATED RATHER THAN SOLVED. Nine of the twenty-eight cards were ruled by readers with no access to my reasoning, and the three that touch elements I wrote today were all in that nine. What is NOT mitigated is this verdict itself, which no second reader saw.
- TWO STRUCTURE NUMBERS ARE NOT ZERO AND THE TARGET IS ZERO EVERYWHERE => BOTH EXAMINED AND BOTH CORRECT. The undemanded interface is a process boundary carrying ten flows as transport, which a flow-derived demand cannot see by construction. The two-way pair is a real cycle between the record store and the test runner, and it is i1's. Neither can go to zero without changing somebody else's structure.

## raid_additions

- raid-asm-a-vehicle-owner-reads-the-update-diff
- raid-ar-a-clear-jump-is-one-call
- raid-ar-one-operation-reads-its-input-once
- raid-ar-work-past-its-bound-says-it-is-working
- raid-un-surface-answers-in-one-second
- raid-un-a-slowness-signal-never-shortens-the-wait

## verdict

pass with overrides — the decomposition is complete and checkable, the two functions it was missing are now elements, and five dissents are logged with it.

WHAT THE PASS RESTS ON, and every number here is computed from the nodes rather than typed. Twenty-two elements, 41 interfaces, 35 functions. Interface debt zero. Unimplemented functions zero. Idle elements zero. Every requirement reaches the structure, most transitively through the functions their elements implement and two named directly on the interfaces that answer them.

THE HOLE THIS MILESTONE FOUND IN ITSELF IS THE STRONGEST EVIDENCE THE CHECK WORKS. The winning design's central mechanism had no function and therefore no element. Taking an update was named in prose on a flow node and handed to a boundary crossing, so nothing modelled it. Three use-case steps sat behind that. It was found by the matrix, not by a reviewer, and it is closed.

### The five overrides, logged rather than waved

ONE. THE OVERLAY-LOCATION DECISION IS OWED AND M5 IS ENDING WITHOUT IT. raid-risk-the-overlay-location-is-unchosen is open, graded crippling, and says M4 and M5 settle it and record it at record-adrs. Six decisions landed there and none is this one. THE DISSENT: a FATAL scenario counts writes across a boundary whose position nobody has chosen, so req-trees-never-mix cannot be discharged until it is. WHY IT PASSES ANYWAY: the winning design resolves by declared identity rather than by path, so the location is a placement question rather than a structural one, and no element in this decomposition changes shape whichever of the three candidates wins.

TWO. THREE FATAL SCENARIOS SIT AT RISK, and two rest on one surface. The path jail guards what an agent names through a lane verb; the engine's own path construction is outside it. Counted at the code today: 28 resolver call sites against 277 bare joins. THE DISSENT: the register carried this at 44 against 116 and at 40 against 88, and both were wrong in the same direction. WHY IT PASSES: nothing in this iteration made it worse, the measurement is now on both nodes with its patterns, and the fix is engine work that belongs to a code-review iteration.

THREE. THE WINNER'S SAFETY STORY RESTS ON AN UNOBSERVED HUMAN BEHAVIOUR. raid-asm-a-vehicle-owner-reads-the-update-diff, minted here, crippling, expected to fail. THE DISSENT: the losing candidate errors out and needs nobody to read anything, and it lost by one cell. WHY IT PASSES: the trade was made knowingly at gate-candidates with the weakness named, and M6 can still build a floor under it. Debian's refusal is the shape and no candidate carried one.

FOUR. NO STRUCTURAL PRIOR ART WAS COMPARED. Seven products were compared on mechanism with primary sources. Not one architecture was set beside this one. THE DISSENT: nothing here says whether 22 elements is ordinary or heavy for this job. WHY IT PASSES: the comparison that decided the design was made properly, and this one would inform a future refactor rather than this choice.

FIVE. THE AGENT BLESSED ITS OWN STRUCTURE. THE DISSENT: I wrote two of the elements today and I am signing the review of them. WHY IT PASSES: the three cards resting on those elements were ruled by a reader with no access to my reasoning, and it ruled the central one AT RISK rather than confirming me. What remains unmitigated is this verdict, which no second reader saw.

### What this gate does NOT claim

THAT THE OVERLAY WORKS. Zero lines of method-overlay machinery exist in the engine. Every overlay verdict on this page is a judgment about a design, and at M5 that is correct rather than a failure.

THAT THE AT-RISK COUNT IS GOOD. Sixteen of twenty-eight is worse than the last comparable walk. Fourteen of the sixteen are inherited and two are this iteration's, which is the fact that decides the verdict rather than the ratio.

AND THAT THE STRUCTURE IS FINISHED. M7 builds inside this baseline, and a new element found mid-build returns here rather than joining silently.

## follow_up

IMMEDIATELY ON THE BLESS: M6 opens, and it is the first milestone in this iteration that writes code.

### One decision is owed before M6 gets far

WHERE THE OVERLAY LIVES. raid-risk-the-overlay-location-is-unchosen names three candidates and is graded crippling. It says M4 and M5 settle it; they did not. It is the sharpest override on this gate and it is the first thing M6 should put in front of the owner.

WHY IT DID NOT BLOCK THIS GATE: identity-keyed resolution makes the location a placement question rather than a structural one, so no element changes shape whichever candidate wins. WHY IT BLOCKS M6: a FATAL scenario counts writes across that boundary, and the boundary has no position.

### What M6 builds, in the order the structure implies

- THE UPDATE PROGRAM'S FORMAT FIRST. What a program may say decides whether an engine change can be expressed at all, and raid-tripwire-i16-a-structural-migration-cannot-be-written falsifies the whole route if the answer is no. Everything else in el-update-runner waits on it.
- THEN THE INVENTORY, because if-change-reporter-to-update-runner makes it the runner's input rather than its by-product. An update cannot be decided without it.
- THEN THE TWO PRODUCERS, which are the smallest pieces: a clone, a delete of two folders, one file written, one commit.

AND ONE MARK IS OWED WITH THE MECHANISM RATHER THAN AFTER IT: which commit a vehicle was built from once it has taken several updates. The first update is the clone point and nothing records the ones after.

### What M7 gets

FOURTEEN FITNESS CANDIDATES, each naming what it would count, and every one now carrying the flag on its own node. Seven of those flags were written at this milestone; the last walk had listed them and never written them, so the list and the corpus disagreed for four days.

THE CHEAPEST THREE read artifacts that already exist: count binary files under the product root, count log lines against dispatches, count acts with no role or channel stamp.

ONE CANNOT BE AUTOMATED AT ALL and says so on its node. Whether a slowness signal shortens a wait is a count of people who abandoned it, in two arms with a control.

### Parked, each with what makes it ready

- THE COLD-START LOOKUP, resolving an identity on a machine that has never seen the named copy. Ready when a vehicle exists as running code.
- WHAT A VEHICLE'S IDENTITY IS. Two elements depend on it. A vehicle today is a folder with a name, and two people could produce vehicles with the same name.
- THE STRUCTURAL PRIOR-ART COMPARISON, which nobody has made. Ready whenever somebody wants to know whether 22 elements is heavy for this job; it informs a refactor rather than this design.
- THE OWNER RULING on whether the eighty standing comparisons count as recorded moves. Owed in six forms now.
- THE CONFIRM RUN on the retro's window fix, at verification.

### Notes this milestone filed for the retro

- note-a5b270dd8a0f, MUST: a major iteration needs a state asking which standing requirements its change makes obsolete.
- note-122bd7a042f6, MUST: v1 has tested implementations of six things this product has open.
- note-761dbf2a236c: the requirement ids still say copy where the product now says vehicle, and a rename owes a migration.
- note-5a4745132c01, note-63bac0a2d858, note-1f9a82df68db, note-faa0646dd7ba, note-1836cbc9322b.

## anything_else

