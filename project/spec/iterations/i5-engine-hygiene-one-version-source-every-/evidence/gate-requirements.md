---
form: gate-requirements
bless: blessed by agent
by: agent
signed_off: 2026-08-19T11:31:40.316Z
authors: agent
files:
---

# Evidence form / gate-requirements

## current_situation

Design input ends here. Five requirement rows, one story, one use case, one new function and three allocations stand, plus nine register entries.

Two states in this milestone were reopened and re-signed rather than amended. One because a row I wrote duplicated a standing one, one because its feeder moved under it.

Nothing is built. Everything past this gate is solution space.

## round_0_verify

- evidence vs claims: Opened rather than taken. Every strike at frame-delta names the file that was read; every scope item names a file and, where it is one site, a line. The one claim that could not be checked from a file — that the actor row was distinct from a standing one — turned out FALSE when it was checked, and the row was rewritten.
- types: Not run, and not owed. Nothing in the tree has changed. No green is claimed from a run of my own.
- lint: Not run, same reason.
- tests: Not run, same reason. The battery is the engine's and fires at verification.
- the reading: Complete. Eleven documents credited, the last three being the test-design card, the verification discipline and the two craft guides.
- the register's own integrity: CHECKED MECHANICALLY, and it caught two nodes neither this record nor this milestone wrote. One carried its probe in the frontmatter and had no `## Probe` section; the other carried a full section and neither frontmatter key. Both were completed out of what the node already said, and neither claim was touched.

## round_1_validate

- exercised against the goal: The goal is engine hygiene. Five rows, each naming a defect that produces a plausible wrong answer rather than an error, is the right shape for it.
- missing: Nothing in the design input. The measurement the split item needs is missing and is named as such — it lands at verification, which is after the state that would design the split.
- wrong: One thing was wrong and was fixed rather than carried. The actor row as first written restated req-acts-carry-role-and-channel. It now carries only the reader's half, `weighs_with` names the shared axis, and the finding that the standing row is unmet went to the register as an issue rather than into a requirement body.
- out of scope: Seven non-goals, two of them returned to the pool with ready-when conditions rather than dropped.
- prior art: Made where it exists and refused where it does not. THE VERSION FLAG loses against every command-line tool people actually use — git, node, docker, curl all answer `--version` and exit, and GNU's coding standards make it a requirement rather than a nicety. What ours sheds by adopting it is nothing, which is why it is cheap. THE PACKAGE PROOF is deliberately weaker than a smoke test that starts the thing: that catches a startup-only defect and ours cannot, accepted on the owner's ruling because running what the package built destroys the lane it runs in. THE OTHER FOUR have no external counterpart and the comparison was not made, which is stated rather than filled with citations.

## goals_served

- ONE VERSION SOURCE, end to end: the engine reads its version from the manifest, and the entrypoint can be asked for it without starting a server.: SERVED AS DESIGN INPUT. req-the-entrypoint-answers-its-version-without-starting, fn-arrive-on-a-machine.state-which-build-this-is, uc-prove-an-install and sty-ask-the-package-what-it-is all stand. The build is M6's.
- EVERY REFUSAL CLAUSE IS ANCHORED to its section in the guidance, with a test that refuses an unanchored one.: SERVED IN FULL, and served before this record started. tests/refusals.test.ts carries both directions and the payload pointer. Struck at frame-delta with that evidence.
- THE BATTERY'S HEAVIEST TEST FILE stops dominating the wall clock.: nothing yet — decompose-structure owns it, and raid-asm-the-test-runner-gives-each-file-its-own-process now gates it with a scheduled probe.
- THE PAINT RULES ARE PINNED by tests: green means submitted, the thumb means blessed, and a law-proven green is told apart from an opinion.: SERVED AS DESIGN INPUT. req-the-panel-s-paint-says-which-kind-of-green-it-is stands, with its six-part scenario and a Detail table carrying each of the three rules. The tests are M5's.
- THE STANDING SMALL DEFECTS from the 2026-08-13 pool are each either fixed or struck with the evidence that they no longer stand.: PARTLY SERVED. 3 of 13 struck with evidence, 2 returned to the pool, and 4 of the remainder now carry a requirement each — the actor row, the preflight row, the empty-source row and the paint row. The fixes are M6's.

## bound_breaches

- if-agent-harness-to-entrypoint: NOT BREACHED since this gate last had a window. The mirror's slow-request log records nothing after 10:44:14Z, and every lane call in M2 and M3 answered inside the second. The two breaches at the kickoff were boot-time pulls carrying a whole guidance document each, and no state since has served one.
- every other modelled interface: Not exercised. This record has still touched git, the vault, the test runner and the web zero times.

## round_2_red_team

- STEELMAN: the design input is ceremony over six small fixes, and five requirement rows for four one-file changes is paperwork => The strongest form: nobody will read these rows again, and the code would be identical without them. What defeats it is that writing one of them CHANGED THE WORK. The actor row, written carelessly, would have forked a standing demand; writing it properly turned up that the standing demand is not met at all, which is now an issue with a repair path. That finding did not exist before the row was written.
- KILL-CRITERION: the five rows describe fixes nobody will make, because M6 runs out of day => Then the record ships with rows and no code, which is worse than shipping neither. The check is at gate-implementation, and the honest response there is to escalate visibly rather than to sign a partial build as whole.
- The register's set criteria were re-argued by the same agent that wrote the rows => True, and unchanged from the last gate. There is still no outside view in this record. The mechanical checks are the only independent judgment: coverage both ways, the per-item probe check, the quality-scenario demand — and all three caught something a self-review had passed.
- Two states were reopened in one milestone, which says the design input was not thought through => Fair, and the numbers are 2 of 6. One reopen was a real defect I introduced; the other was its ripple. What the mechanism did right is refuse to let a state stand on a feeder that moved, which is exactly what it exists for. What it says about the walk is that a row should be checked against the standing register BEFORE it is written, not after.
- The probes field was answered as prose and had to be re-answered as a table, which means the state was signed on an answer the engine could not read => TRUE, and it is the sharpest process finding in this milestone. The form is a window on the register and the prose was a second copy of what the nodes already say. It signed once and failed its own re-check, which means a claim can stamp on content that does not survive the next look. That is a finding about the mechanism and it goes to the retro, not into this record's scope.
- The version flag's prior art is a convention, not a comparison of systems => Half true. GNU's coding standards and four tools people use daily are a real external standard, and ours does not meet it. What is missing is a comparison of RELEASE CHECKS, which is the thing the flag actually serves, and that comparison was not made.

## raid_additions

- none

## verdict

pass — five rows that are verifiable, traced both ways, covered by functions and probed, and one defect in them found and fixed inside this milestone rather than carried past it

WHY A PASS RATHER THAN AN OVERRIDE. Nothing here is being waved through. Every mechanical check the engine holds is green, and the two that were red were fixed rather than argued with.

WHAT THE ADJUDICATOR SHOULD PUSH ON. Whether five requirement rows are the right weight for six one-file fixes. The case for them is the actor row, which changed the work by being written properly. The case against is that the other four may never be read again.

DESIGN INPUT ENDS HERE. Past this gate the register is axiom, and the rest of the record is solution space.

## follow_up

decompose-structure is next and it owes two decisions.

- WHETHER THE SPLIT IS DESIGNED AT ALL, given that the measurement deciding it arrives at verification. The item must be written so it can still be struck after the build states have run.
- WHETHER THE PREFLIGHT ROW'S FIX CREATES A CIRCULAR IMPORT between the check and the reader. That was named at identify-assumptions as a decision we own rather than an assumption.

ONE FINDING GOES TO THE RETRO rather than into this record: a claim can sign on evidence content the engine rebuilds differently at the next look, and the prose-versus-table answer on the probes field is the worked example.

THE STALE-LIST RISK NARROWS BUT STAYS OPEN. 3 of 13 struck is under half, and the six that remain now each carry a requirement or a named measurement.

## anything_else

TWO NODES OUTSIDE THIS RECORD WERE COMPLETED HERE, and it is worth saying plainly because the diff shows them.

- raid-asm-the-target-machine-is-many-throttled-cores carried its probe in the frontmatter and had no `## Probe` section.
- raid-asm-a-vehicle-owner-reads-the-update-diff carried a full `## Probe` section and had neither frontmatter key.

NEITHER CLAIM WAS TOUCHED. Only the missing half was written, in each case out of what the node already said, and each says in its own words what it now says elsewhere.

THEY ARE ONE DEFECT FROM OPPOSITE SIDES: a node's two halves are written by different hands at different times and nothing checked that both were filled. One has been incomplete since i27 and one since i16. The state that had to read every standing assumption is what surfaced them, which is the mechanism working as designed.
