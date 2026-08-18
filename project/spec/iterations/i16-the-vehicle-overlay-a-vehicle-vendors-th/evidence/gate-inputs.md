---
form: gate-inputs
bless: blessed by agent
by: agent
signed_off: 2026-08-18T11:03:44.175Z
reopened: "2026-08-18T11:01:52.681Z — The user picture gained a fourth story, four use-case extensions and a fifth intended use. The gate reviewed three stories and a surface that offered nothing productive."
authors: agent
files:
---

# Evidence form / gate-inputs

## current_situation

The walk stands at gate-inputs with M2 rebuilt again, this time for the affordance.

WHAT CHANGED SINCE THE LAST SIGNATURE. A fourth story, which is the RAMP-UP. Four new use-case extensions and one rewritten step. A fifth intended use and two new binding exclusions at the boundary. The roster did not move.

WHAT THIS GATE STOPS. System-level writing on a wrong user picture, which is what a major cannot afford.

AND THE WALK IT OWES RAN AGAINST A DIFFERENT SURFACE THAN LAST TIME. The lane's 34 verbs are unchanged, but the affordance puts capabilities in the EXTENSION, so the extension's own command list is now part of the enumeration this gate must compare.

## picture_judged

THE USER PICTURE IS RIGHT, AND THE AFFORDANCE FIXED SOMETHING THAT WAS MISSING RATHER THAN ADDING DECORATION.

### What the ramp-up rule exposed

THE METHOD SAYS THE FIRST STORY IS ALWAYS THE RAMP-UP: an empty machine, nothing installed, and the person has to reach the first screen. THIS RECORD HAD NO SUCH STORY UNTIL NOW, and nobody noticed across two signatures of this gate.

WHAT IT HAD INSTEAD: three stories that all began with a vehicle already existing. How it came to exist was a script somebody had to find, read and trust first — which is not a screen, and not a pass anybody had told.

SO THE AFFORDANCE DID NOT ADD A JOURNEY. It revealed that the first journey was missing, and the rule that would have caught it was in the method card all along.

### The roles did not move, twice

SCOPE GREW TWICE TODAY AND THE ROSTER HELD AT FOUR. Driving somebody else's product is the vehicle owner doing what their node already says. Pressing an act instead of running a script is the same person meeting the system somewhere else.

WHAT DID MOVE IS ONE DISPOSITION. stk-newcomer gains most from the affordance, because a capability reachable only from a script is one only somebody who has already read the tree can use. That is re-marked at map-stakeholders rather than minted as a fifth role.

### The boundary held and grew two exclusions

THE BOX DID NOT MOVE. A descendant still contains everything and there is still no container. The surface is INSIDE, and saying so mattered: drawing the extension outside would say a descendant depends on something it does not contain, which is the sealed model returning through a different door.

TWO NEW EXCLUSIONS ARE THE SHARPEST THING IN THE LIST, and both bound the most dangerous act this iteration ships. An act that writes a whole folder must write inside it and nowhere else, and it must not disturb the window it was launched from.

### The one thing a person can see here that no check can

THE STORIES NOW COVER HOW A VEHICLE COMES TO EXIST, HOW IT IS USED, HOW IT SURVIVES AN UPDATE, AND WHAT IT CANNOT DO. That is a complete arc for the first time in this record, and completeness of an arc is exactly the judgment the coverage counts cannot make.

## unspecified_capability

THE WALK, WRITTEN DOWN SO THE NEXT REVIEWER CAN REPEAT IT. The mechanical check does not exist yet (note-9c5253b4da67), so this is done by hand against two live lists rather than one.

### How the lists were obtained

THE LANE: a search of the engine for `^\s*name: "se_`, which returns 34 verb declarations in engine/tools.ts. Unchanged since the last signature.

THE SURFACE, WHICH IS NEW TO THIS WALK: a search of project/deliverable for `registerCommand`, which returns the extension's own list at vscode/src/extension.ts lines 1923-1942.

### What the extension offers today

FOUR COMMANDS PLUS A PER-CARD OPENER, and the finding is what is absent from them.

- `.help` — shows help.
- `.startAgent` — starts an agent in the tree already open.
- `.howToAttach` — shows instructions.
- `.expandDetails` — expands the panel.
- `.openCard<n>` — opens a card.

NOT ONE OF THEM PRODUCES ANYTHING. The surface today shows the tree it is in and starts an agent inside it. Nothing creates a tree, and nothing opens a window anywhere else.

SO THE TWO NEW ACTS ARE GENUINELY NEW CAPABILITIES AT THE SURFACE rather than a rename of something that was there. Both are covered: uc-vendor-and-overlay extension 1z and uc-drive-a-foreign-product extension 1z.

AND ONE THING THE READ TURNED UP THAT NOBODY WAS LOOKING FOR. Every command id is `$PRODUCT_ID$.something` — the extension is itself brand-templated. That is req-the-product-name-is-one-fact holding in a place no requirement mentions, and it is evidence the constraint is real rather than aspirational.

### Which lane verbs this change touches, and their coverage

- se_pull — serves the method, and the overlay changes what it serves. COVERED.
- se_prompt_place — re-projects the prompt layer. COVERED, named in the use case's lane doors.
- se_panel, se_survey, se_lint, se_seed_iteration, se_reload — each reads method artifacts of some class. COVERED by step 3 as widened.
- THE OTHER 28 are untouched.

### What has no verb and no command, and why that is not a hole

THREE CAPABILITIES IN SCOPE HAVE NO DOOR ANYWHERE TODAY: producing a copy, taking an update, and naming a product to drive. `RUNME.ps1 --export` is a script outside the lane and it produces a fork.

EACH HAS A USE-CASE STEP. THE TEST THIS GATE APPLIES IS USE-CASE COVERAGE, NOT DOOR EXISTENCE. A capability with a use case and no implementation is the work; a capability with an implementation and no use case is the hole. Neither list has anything in the second category.

### One capability is out of scope and argued

SENDING A DESCENDANT'S IMPROVEMENTS BACK UP. No use case, deliberately, and it is in scope-non-goals with the owner's ruling and the shape it must take.

AND THE REST OF THE BEGIN-A-PRODUCT FAMILY is now explicitly excluded at draw-context as well as at scope, because the affordance arriving is exactly when that boundary would blur.

## passes_concrete

YES FOR THREE, AND THE FOURTH HAS ONE SLIDE THAT CANNOT BE SCRIPTED YET. Examples are FORMULATED here and scripted at M6, so nothing being runnable is correct rather than a shortfall.

### sty-press-create-vehicle-and-land-in-it — new, and scriptable end to end

EVERY SLIDE IS AN OBSERVABLE. An act is chosen, three answers are given, a tree exists at a named path, a window opens on it, and the desk greets under the new name.

AND ITS FIFTH SLIDE IS THE ONE WORTH SCRIPTING FIRST: nothing else on the machine changed, and the window it was launched from is as it was. That is two assertions over a filesystem and one over the editor, all of them counts rather than judgments.

### sty-nothing-i-do-reaches-what-it-came-from — the most scriptable, and partly already run

ITS FIFTH SLIDE NAMES THE COMMAND, and the probe on 2026-08-18 ran it: a junction inside the tree, `git worktree remove --force`, and the neighbour's file destroyed at exit code 0.

ONE CORRECTION THE DECK OWES: it names the right command and not the right STRUCTURE. A demonstration planting a symlink on Windows passes while proving nothing, because an unprivileged user cannot create one there.

### sty-drive-somebody-elses-product — revised, and its new slide is the frontier

THE SYSTEM COMES UP IN A TREE THAT CARRIES NONE OF ITS METHOD. That is the one thing in this iteration with no mechanism behind it today, and it is now a slide somebody can watch rather than a sentence in a requirement.

IT IS STILL SCRIPTABLE: a folder that is not the system's own, a window, a report, and an assertion that nothing was written. v1's own test does exactly this and asserts the engine-home pointer, which is the shape to port.

### sty-vendor-it-into-my-product — scriptable up to slide seven

SLIDES ONE TO SIX ARE CONCRETE and two runs on 2026-08-18 exercised most of them. SLIDE SEVEN IS NOT SCRIPTABLE YET — deciding a collision — because what the builder sees depends on which mechanism M4 picks. Named as deliberate rather than missing.

## round_0_verify

- evidence vs claims: every claim in this gate cites something opened this session. vscode/src/extension.ts lines 1923-1942 for the live command list. engine/tools.ts for the 34 verbs. product/engine-go/i18_red3.go at ref main, whole, for v1's chain. The two use cases before and after their extensions. stk-vehicle-owner, whole. And four probe runs whose commands and output are in the call log.
- and one claim was checked rather than assumed at this reopen: that the extension already offers something like these acts. It does not — four commands, none of which produces anything.
- types: NOT RUN and it would answer nothing. No TypeScript changed. Everything this afternoon was corpus.
- lint: RUN, green, inside the battery at 08:42 — 285 files in 430 ms. Nothing since has touched code.
- tests: NOT RUN AT THIS GATE and not legal here. The battery at 08:42 answered 1439 with one failure, repaired, and the confirm run is owed at verification. NOTHING IN M2 IS TESTABLE: stories and use cases are documents.

## round_1_validate

- exercised against the goal: The goal of M2 is a user picture requirements can be written on. Exercised by asking whether every use-case step has somewhere for a requirement to attach, and TWO NEW STEPS DO NOT YET — both named in follow_up rather than left.
- missing: THE COLLISION PASS, unchanged and deliberate. And the outside prior-art scan, unchanged and owed.
- wrong: THE RAMP-UP WAS MISSING FOR TWO SIGNATURES OF THIS GATE. The method card names the rule in one sentence and this gate did not check it. That is a gate failing at its own job, and it took an owner's feature request to surface it.
- out of scope: nine items at scope-non-goals, plus two more excluded at the boundary specifically for the affordance.
- prior art: THE STRONGEST ANSWER THIS RECORD HAS HAD, and it came from the owner. v1's product/engine-go/i18_red3.go is the whole chain as a PASSING TEST — vehicle scaffolded, its own method committed, a stub created, the stub resolving the vehicle's method with the override beating the vendored copy. WHAT IT DOES BETTER: it exists, it ran, and it guards a hazard somebody hit in the field. WHAT IT USES THAT WE DO NOT HAVE: a per-workspace data home for the pointer, and a settable base. Both named in the register. AND WHAT IT DOES NOT HAVE: any surface at all, which is what the extension adds and neither ancestor carried.

## goals_served

- A DESCENDANT IS A COMPLETE INDEPENDENT COPY. It comes up on a machine with nothing of the parent's beside it, and everything in it is its owner's to change in place, including the parts the parent wrote. (vp-vendoring, amended 2026-08-18. Its requirement is OWED at write-requirements — req-engine-folder-is-sealed said the opposite and is removed there on the owner's ruling.): SERVED, AND NOW REACHABLE. sty-press-create-vehicle-and-land-in-it is the ramp-up this record lacked, and uc-vendor-and-overlay extension 1z generalises it. The requirement exists, the sealed one is deleted, and the run proved a colleague can clone from an internal repository with no reference to the source.
- NOTHING A DESCENDANT DOES CAN REACH ITS PARENT. No write, no link, no mount, no install step that writes to the source. The rule names the DIRECTION OF WRITES rather than any mechanism. (raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours, minted from v2's law with its witness: a symlink and a routine cleanup deleted a repository on 2026-07-25.): SERVED HARDEST, AND THE AFFORDANCE ADDED A SECOND SURFACE FOR IT. uc-vendor-and-overlay extension 1y bounds the act that writes a whole folder: inside the produced tree and nowhere else. That is new, and it exists because an act reachable by a button is an act somebody will press without reading anything first.
- THE OVERLAY WINS BY IDENTITY. Where a descendant carries a card for an identity the engine also ships, the descendant's card is served at every point that identity resolves, and an un-overridden resource is inherited. (req-overlay-resolution): SERVED, and v1's test is the proof shape — its stub asserts the vehicle's override BEATS the vendored copy, precedence rather than existence.
- IT WORKS WITH NO OVERLAY AT ALL. With none present, the product comes up on the engine's shipped method and zero builder-authored configuration files. (req-setup-serves-shipped-method): SERVED. The ramp-up story's sixth slide is this pass observed: the desk greets them, and they have written nothing of their own yet.
- AN UPDATE REACHES A DESCENDANT WITHOUT TAKING ITS CHANGES AWAY. What no longer resolves is REPORTED rather than silently defaulted. HOW is the open design question of this iteration and it is not answered here. (req-overlay-survives-update, req-overlay-drift-reported, raid-risk-ownership-and-receiving-pull-against-each-other): SERVED, and the probe answered HOW for the file half. Untouched by the affordance, which is worth saying: scope grew and this goal's evidence did not change.
- ONE COMMAND MAKES A DESCENDANT. The export produces a complete named copy with an empty overlay ready to write into, and no second install of anything. (req-second-product-reuses-install): SERVED, AND THIS IS THE GOAL THE AFFORDANCE CHANGES MOST. "One command" is now one command OR one act at the surface, and the owner asked for the second because a command nobody finds is not a way in. The walk found the surface offers four commands today and not one of them produces anything. AND THE SIXTH GOAL — a copy working on itself while driving something else — gained its hardest step: uc-drive-a-foreign-product step 2, the system coming up in a tree carrying none of its method.

## bound_breaches

- if-agent-harness-to-entrypoint: BREACHED THROUGHOUT and the shape is unchanged from three earlier gates. Submits scale with the size of the evidence rather than with the walk. WHAT THIS AFTERNOON ADDED is a second kind that is not this interface: four `se_run` probes at 1.0 to 2.4 seconds each, which is git doing real work in throwaway repositories and is not governed by the one-second rule. THE DISPOSITION IS UNCHANGED: neither is a defect. The first is the cost of writing evidence and the alternative is writing less. WHICH MILESTONE OWNS THE MEASUREMENT: none of this iteration's — note-f2bc2e1e2fb8 asks for the pull's phase breakdown and note-83b3d8a1d65a records that every figure from se_pull's own duration is a floor.

## round_2_red_team

- STEELMAN: this gate should FAIL, because it has now signed three times and each time something was missing that its own method card would have caught => THE ATTACK LANDS. The ramp-up rule is one sentence in meth-story-slideshow, this gate reads that method, and two signatures passed a story set with no ramp-up. WHAT ANSWERS IT is narrow: the rule was satisfiable only once the affordance existed, because before it a vehicle came into being by running a script and there was no screen to reach. WHAT DOES NOT ANSWER IT is why nobody said so. A record whose first journey is untellable is a finding, and this gate should have named it rather than waiting for a feature request.
- KILL-CRITERION: this is the wrong call if the affordance is a different iteration wearing this one's name => Tested at the surface rather than in the abstract. The extension's live commands show and start; none produces. So the two acts are new capabilities rather than a re-skin, AND they cannot exist without items one and two, which is the test. THE CRITERION DID NOT FIRE. What would make it fire is drift into the rest of tsp-product-scaffold, now excluded in two places.
- THE AGENT EXCLUDED THE AFFORDANCE AND DEFENDED THE EXCLUSION IN WRITING => True, and the defence was that an affordance over a capability that does not work yet is decoration. Still wrong, for a reason worth keeping: the surface is how anybody finds out whether the capability works.
- FOUR REOPENINGS, ALL FROM THE OWNER, NONE FROM A CHECK => Counted. In every case the corpus AGREED with the wrong answer, because the wrong answer was signed evidence. That is not an argument for checking harder; it is an argument for showing work early, which is what happened each time.
- SO WHY BELIEVE THE PICTURE IS COMPLETE NOW => Do not. What can be said is that the arc is complete for the first time — how a vehicle comes to exist, how it is used, how it survives an update, and what it must never do — and that an incomplete arc is the specific defect that hid the last omission.
- THE DEADLINE IS TOMORROW AND M2 HAS BEEN REBUILT TWICE TODAY => Real. The offsetting fact is that the build shrank while the scope grew: the channel is clone-and-pull, and the driven-project mechanism is v1's engine-home pointer. Two of the three hardest things are ports rather than designs, and the third is a surface over acts that already exist.

## raid_additions

- none
- Nine entries stand from this iteration and this gate adds none.
- The gate's job per meth-raid is to ask whether what stands is believable and whether anything obvious is missing. Both were asked.
- ONE THING IS RAISED AND NOT MINTED, because it belongs to M3 rather than to a register entry: two new use-case extensions have no requirement behind them — the act writing only inside the tree it produced, and the system finding its method through a recorded pointer. Both are named in follow_up and write-requirements owns them.
- AND ONE OBSERVATION IS DELIBERATELY NOT AN ENTRY. The extension being brand-templated with `$PRODUCT_ID$` is req-the-product-name-is-one-fact already holding somewhere no requirement mentions. That is evidence for a standing row rather than a new risk.

## verdict

pass with overrides — the user picture is complete for the first time in this record, and two things are passed on the record.

WHAT THIS SIGNATURE CARRIES THAT THE LAST TWO DID NOT. A RAMP-UP. The method's own rule is that the first story is the one starting from nothing and reaching the first screen, and this record had none until the affordance made one possible. Two earlier signatures of this gate passed a story set that never said how a vehicle comes to exist.

WHAT THE PASS RESTS ON. Four stories covering a complete arc — how a vehicle comes to exist, how it is used, how it survives an update, and what it must never do. Two use cases with sixteen steps and twenty-three extensions. A boundary that did not move while scope grew twice. And a roster that has not moved once.

WHAT THIS GATE ACTUALLY DID. It walked the extension's live command list, which no earlier signature had, and found that four commands stand and not one of them produces anything. That settles whether the affordance is new capability or new paint: it is new capability.

OVERRIDE ONE — THREE PRIOR-ART FAMILIES ARE UNREAD, and the evidence is lopsided. THE DISSENT: one mechanism has two runs and three families have nothing. WHY IT PASSES: enumerate-space fixes it, and no requirement names a mechanism.

OVERRIDE TWO — ONE USE-CASE STEP HAS NO STORY. Deciding a collision. THE DISSENT: a step nobody has walked is a step nobody has checked. WHY IT PASSES: the pass depends on which mechanism M4 picks, and writing it now would invent the screens.

WHAT THE PASS DOES NOT CLAIM. That the set is complete — it never is, and three untold passes are named with reasons. That four MUST stories are cheap — they are the largest commitment this iteration makes, though v1's chain covers three in one pass. And that this gate can catch what the corpus agrees with: four reopenings today, and it found none of them.

## follow_up

IMMEDIATELY, on the bless: M3 reopens, and write-requirements owes TWO ROWS neither of which is a button.

- THE SYSTEM COMES UP IN A TREE THAT IS NOT ITS OWN, finding its method through a recorded pointer to the copy that made the project. That is uc-drive-a-foreign-product step 2 and extension 2y, and it is v1's engine-home mechanism at note-b966f8fd311e. It is the load-bearing third of the owner's ask.
- AN ACT THAT PRODUCES A TREE WRITES INSIDE IT AND NOWHERE ELSE, and does not disturb the place it was launched from. That is uc-vendor-and-overlay extension 1y, and it is the only bound on the most dangerous thing this iteration ships.

AND THE REST OF M3 IS RE-SIGNING. The nine standing rows are untouched by the affordance; derive-functions gains whatever function carries the new rows; the assumptions and their probes are unaffected.

EXCEPT derive-criteria, WHICH NEEDS REDOING. The pool grows with any new `should` row, and a new requirement turning that state grey is the standing artifact working as designed.

WHAT M8 INHERITS. Four MUST stories means four demonstrations, and v1's chain covers three of them in ONE pass: spawn a vehicle, have it create a project, check the project runs. The fourth — the isolation story — is separate and half-run already.

AND ONE CORRECTION IS OWED TO A DECK at author-tests. sty-nothing-i-do-reaches-what-it-came-from names the right command and not the right structure. On Windows it must plant a junction; a symlink cannot be created there without elevation, so a symlink-based demonstration passes while proving nothing.

## anything_else

