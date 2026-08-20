---
form: gate-motivation
bless: blessed by agent
by: agent
signed_off: 2026-08-19T11:03:24.816Z
authors: agent
files:
---

# Evidence form / gate-motivation

## current_situation

M1 is walked. The register carries five entries, the audit struck 3 of 13 items, and the scope cut the surviving 8 down to 6.

This gate asks one question: is what remains worth building. Past it the vision is axiom.

Nothing is built. The tree still stands as i16 and i17 merged it.

## vision_scope_stated

COMPLETE, and inherited rather than authored. This is a delta on a standing frame, so the packet's parts come from the resident vision and only the new half was written.

- The goal system: five goals, three conflicts named, priority order ruled. Written at draft-vision.
- The delta's value props: none new. Every item extends work the nine standing props already cover, and that is recorded as an explicit `none` rather than a blank.
- The scope: six items, each with a named file and line.
- The non-goals: seven, each with where it went.
- The register: five entries, every one with an owner and a trigger.

WHAT IS NOT ASKED AT THIS SIZE, and correctly so: the gap claim and the why-now. They stand from the resident frame and the form drops them mechanically.

## problem_agreed

THE DELTA IS REAL, and the sharpest evidence is that a previous record found one of these items by tripping over it.

i16's package state tried to prove its own build by asking the entrypoint for its version. There is no such flag, so the call started a server and timed out. That is a defect found the expensive way, and it is still there.

THE OTHER FIVE ARE THE SAME SHAPE — each is a mechanism that silently gives a plausible wrong answer.

- The feed's actor column reads `human` or `agent` from a string prefix. It was wrong for 52 records in one measured window, and it is wrong by construction for every new server-side tool.
- The palette check and the palette reader each hold their own copy of a path, so a moved file passes preflight and renders as an almost-empty palette two layers away.
- A field whose live source resolves to zero items renders as a field with no offer, which looks exactly like a field that was never wired up.
- The paint rules are enforced by scattered cases rather than by a pin, so nobody can say which of the three are actually covered.
- The battery's heaviest file has been named by three records and measured by one, and nobody has acted on either.

WHY IT IS WORTH HAVING. Every one of these produces a WRONG ANSWER rather than an error. That is the class the whole product exists to make impossible, so leaving them is more expensive here than it would be elsewhere.

WHAT WOULD MAKE THE MOTIVATION TRIVIAL, and it is worth stating because this gate may fail on exactly that: if these were cosmetic, or if each were a one-line typo with no mechanism behind it. Two of the six are one-line changes. Four are not, and all six change what a reader is told.

## prior_art_positioned

THE COMPARISON WAS MADE for one item and is honestly impossible for the rest. Both halves are stated.

THE VERSION FLAG — compared, and OURS LOSES TODAY. Every command-line tool people actually use answers `--version` and exits: git, node, docker, curl. The convention is old enough that a tool without it reads as unfinished, and GNU's own coding standards make it a requirement rather than a nicety. WHAT THEY DO BETTER: the answer costs nothing and has no side effects. WHAT OURS DOES INSTEAD: `se-mcp.ts` has `--help` and no `--version`, so asking for the version starts a server. WHAT OURS SHEDS by adopting it: nothing. There is no trade here, which is unusual and is why this item is cheap.

THE PACKAGE PROOF ITSELF — compared, and ours is deliberately weaker. A release pipeline elsewhere runs a smoke test that STARTS the thing. WHAT THAT DOES BETTER: it catches a startup-only defect, which a version flag cannot. WHAT OURS SHEDS, knowingly and on the owner's ruling: running what the package built destroys the lane it runs in, so the flag is the strongest proof available without that cost.

THE OTHER FOUR — NOT COMPARED, and here is why. An actor stamp in a private call log, a preflight path check, an empty-source hint in an internal form, and four test pins on this product's own colour rules have no external counterpart people use. Writing a comparison for them would be the citation-shaped filler this field exists to refuse.

THE TEST SPLIT — the relevant prior art is our own measurement, not anybody else's practice. The question is which file sets this battery's critical path, and no external system can answer it.

## success_measurable

EVERY ITEM IN SCOPE CARRIES A PASS LINE, and each one is checkable by somebody who did not write it.

- THE VERSION FLAG: running the entrypoint with `--version` prints the manifest's version and exits non-zero-free, without opening a port. A test asserts the exit and the absence of a listening socket.
- THE ACTOR STAMP: a log record written by a mirror control and one written by a lane call each carry an actor field, and the feed renders from that field. A test writes both and asserts the rendered column.
- PREFLIGHT ASKS THE READER: the palette path exists in exactly one place in the source. A test asserts that moving the file makes preflight fail, rather than making a surface render empty.
- THE EMPTY SOURCE: a field over a source that resolves to zero items renders text naming the source. A test asserts the string.
- THE PAINT PINS: three named rules, three assertions, in one file.
- THE TEST SPLIT: the battery's critical-path file is NAMED with a number. Passing means the number exists and the decision follows it, whether that decision is to split or to strike.

WHAT IS NOT MEASURABLE HERE, said plainly: whether the battery gets faster. That depends on the measurement this record does not yet have.

## risks_logged

FIVE ENTRIES STAND, each with an owner and a trigger, each a node under project/spec/trace/raid/.

- The bundle's list is stale and the day shrinks. Owner the owner, trigger frame-delta. ANSWERED at frame-delta: 3 of 13 struck, which is under half, so the record still holds work. Left open until the build confirms the six are as small as they look.
- Splitting the heaviest test file buys no wall clock. Owner the maintainer, trigger decompose-structure. Open, and it now gates an item rather than merely warning about it.
- A fresh container has no battery timings to design against. Owner the maintainer, trigger any state reasoning about test cost. Open, present tense, and it is why the split item is written to allow measuring as an outcome.
- Every gate in this record is blessed by its own author. Owner the owner, trigger the owner's next look. Open and inherited by this gate too.
- A fresh clone's empty inbox means no local state. Owner the owner, trigger the next retro on a cloud clone. Open, parked.

WHAT THE REGISTER DOES NOT YET CARRY: anything about the six items themselves. That is correct at this milestone — the assumptions the requirements lean on are M3's two states, and nothing has been specified yet.

## round_0_verify

- evidence vs claims: Every strike and every scope item names a file and what was read in it. The two landed items were confirmed by opening engine/version.ts and tests/refusals.test.ts rather than by searching for an absence. The register's five entries were re-read as nodes, and all five carry owner, trigger, impact and both grades.
- types: Not run, and not owed. Nothing has changed in this record, so the tree stands exactly as i16 and i17 merged it. No green is claimed from a run of my own.
- lint: Not run, same reason.
- tests: Not run, same reason. The battery is the engine's and fires at verification; no state before it may call one. There is also no last-run record on this container to inherit a number from, which is logged as its own issue.

## round_1_validate

- exercised against the goal: The goal is engine hygiene and the scope is six defects that each produce a wrong answer rather than an error. That is the right shape for the goal.
- missing: The measurement behind the split item. It is named as missing rather than assumed, and the item is written so measuring is a legal outcome.
- wrong: Nothing built, so nothing wrong yet. The gate's own hazard is arguing motivation for six items nobody has opened at code level beyond one line each. Two of the six — the empty source and the paint pins — are known by their symptom rather than by their fix.
- out of scope: Seven non-goals, each with where it went. Two went back to the pool with a ready-when rather than being dropped.
- prior art: Made for the version flag and the package proof, refused as filler for the other four, and named impossible for the split. Written out in full in its own field.

## goals_served

- ONE VERSION SOURCE, end to end: the engine reads its version from the manifest, and the entrypoint can be asked for it without starting a server.: HALF SERVED, and the served half predates this record. engine/version.ts already reads the manifest, confirmed at frame-delta and struck there. The entrypoint flag is in scope and unbuilt — M6 build-steps owns it.
- EVERY REFUSAL CLAUSE IS ANCHORED to its section in the guidance, with a test that refuses an unanchored one.: SERVED IN FULL, before this record started. tests/refusals.test.ts asserts both directions and the Rejection payload's pointer, and errors.ts computes it in clauseGuidance. The goal is met by a strike with evidence rather than by a build.
- THE BATTERY'S HEAVIEST TEST FILE stops dominating the wall clock.: nothing yet — decompose-structure owns the measurement that decides whether anything is built at all.
- THE PAINT RULES ARE PINNED by tests: green means submitted, the thumb means blessed, and a law-proven green is told apart from an opinion.: nothing yet — M5 author-tests owns it. Scattered cases exist in drift.test.ts, reopen.test.ts and claimops.test.ts, and whether they cover all three rules is that state's question.
- THE STANDING SMALL DEFECTS from the 2026-08-13 pool are each either fixed or struck with the evidence that they no longer stand.: PARTLY SERVED. 3 of 13 struck with evidence at frame-delta, 2 returned to the pool with ready-when conditions at scope-non-goals. The remaining fixes belong to M6.

## bound_breaches

- if-agent-harness-to-entrypoint: NOT BREACHED since this gate's window opened. The mirror's slow-request log records nothing after 10:44:14Z, and every lane call since has answered inside the second. The two breaches recorded at the kickoff were both boot-time pulls carrying a whole guidance document, and no state since has served one.
- every other modelled interface: Not exercised. This record has touched git, the vault, the test runner and the web exactly zero times.

## round_2_red_team

- STEELMAN: six small defects do not need an iteration, they need one afternoon and a commit => The strongest version is that the ceremony costs more than the work. 29 states, six gates, a full evidence trail — for a version flag and four test pins. What defeats it is not that the ceremony is cheap, because it is not. It is that four of the six were ALREADY known, written down, and left standing for weeks precisely because they kept being too small to schedule. The vehicle is what makes small things happen at all.
- KILL-CRITERION: the six items turn out to be one-liners, so the record ships in an hour and the evidence outweighs the code => Then the honest report is that a bundle of six was the wrong vehicle and an expedition was right, and it belongs in the retro rather than being hidden. IT IS PARTLY TRUE ALREADY: two of the six are one-line changes. The other four are not, and the split item may produce no code at all.
- The motivation argues from the DEFECTS, not from anybody wanting them fixed => Correct, and it is the weakest part of this gate. No user asked for any of this. The nearest thing to outside demand is i16 tripping over the missing flag, and that is the product's own agent, not a person.
- The version flag proves almost nothing, so a gate arguing its worth is arguing for theatre => Half true and already conceded in the prior-art field. The owner ruled the trade knowingly. What defeats the objection is the alternative: today there is no proof at all, and the choice is between a weak check and none.
- Striking three items and calling it audit is a way to make the record look rigorous while shrinking the work => A fair attack. The defence is that every strike names the file that was opened and what was in it, so any reader can re-run the check in seconds. A strike nobody can verify would deserve this objection; these can be.
- The measurement gating the split may never arrive, so that item quietly becomes nothing => Real, and it is why it is written as measure-then-decide rather than as split. If decompose-structure cannot produce a number, the item is struck THERE with that reason, not carried silently to the end.

## raid_additions

- none

## verdict

pass — six defects that each produce a plausible wrong answer, four of them already written down and left standing because they were too small to schedule, and one of them already found the expensive way by a previous record

WHY NOT A FAIL ON TRIVIALITY, which is what this gate exists to catch. The test is not whether each item is big. It is whether the delta is real and worth building. Every item changes what a reader or an agent is TOLD, and three of them make a wrong answer impossible rather than merely less likely.

WHAT THE ADJUDICATOR SHOULD PUSH ON. Whether an iteration is the right vehicle for six small things, given that two are one-liners. The counter-argument is in round 2 rather than settled here: these items have survived weeks of being too small for any other vehicle.

THE VISION IS AXIOM PAST THIS POINT, and that is what makes this the last place to object.

## follow_up

M2 is next: the stories and use cases for six engine defects.

WATCH FOR AN HONEST MISMATCH THERE. Four of the six have no user-facing story at all — they are internal correctness — and forcing one would be fabrication. The states that ask for stories get an explicit account of which items have one and which do not.

DECOMPOSE-STRUCTURE STILL OWES THE MEASUREMENT that decides the split item.

THE STALE-LIST RISK STAYS OPEN until the build confirms the six are the size they look.

## anything_else

ONE THING THIS GATE COULD NOT DO. It could not run a single check of its own — no battery, no lint, no type pass — because none is legal outside its state and nothing has changed. Every green above is inherited from the merge and labelled as such.
