---
form: gate-implementation
bless: blessed by agent
by: agent
signed_off: 2026-08-19T13:40:59.179Z
authors: agent
files:
---

# Evidence form / gate-implementation

## current_situation

The build stands and the battery is green: 1461 tests, 0 failures, the typechecker clean, the code linter clean over 307 files.

Five requirements built, five test specs, twenty-five cases in five new files plus one pin file for the engine repairs.

A tester with fresh context found twelve findings. All twelve are dispositioned: eleven fixed, one recorded and not built. Two of the five requirements did NOT stand when it looked, and both do now.

## quality_ok

- [x] Dependencies stay layered
- [x] Every new element carries one stated responsibility
- [x] The linter and the complexity ceiling are clean, with no new suppression
- [x] Every new behavior carries its check, and the battery is green at rest
- [x] Nothing speculative shipped
- [x] What changed is findable
- [x] Every quick-and-dirty taken stands as a visible raid debt entry

## debt_taken

- none

## risks_acceptable

acceptable — four register entries moved and none of them is a trade this record made knowingly for speed

WHAT MOVED. Five issues were opened, all of them defects this record FOUND rather than took: raid-iss-a-cut-subsystem-left-its-interface-node-behind, raid-iss-a-bound-tables-header-reads-as-a-reference, raid-iss-the-refs-check-reads-a-node-tables-written-cells, raid-iss-a-recorded-act-carries-no-acting-role, and raid-iss-a-case-guarded-local-artifacts-as-facts-of-the-source. Four of the five are now repaired; the fifth records a demand this record met.

WHAT DID NOT MOVE. No risk was regraded. raid-risk-splitting-the-heaviest-test-file-buys-no-wall-clock stands untouched because the item it gates was never built, and raid-risk-every-gate-in-this-record-is-blessed-by-its-own-author stands because it is about this walk rather than about the code.

WHY THIS IS ACCEPTABLE RATHER THAN A JUDGMENT DEFERRED. Every entry names an owner, a trigger and what repair consists of, and the four that were repaired say so in their own bodies.

## round_0_verify

- evidence vs claims: Distrusted and opened. A fresh-eyes tester read the built code against each requirement's own measure rather than against the tests, and two requirements that the tests called green were not met. Both were built afterwards.
- types: GREEN. `tsc -p . --noEmit` exits 0. It was RED when the tester looked — one error, a required member left unfilled at the third of three construction sites, in the code that decides whether a standing claim passes.
- lint: GREEN. biome over 307 files, no findings, no suppression added. One unused import surfaced after the paths moved and went with them.
- tests: GREEN. 1461 cases, 1460 passing when the tester ran it, 1461 now. The battery is this record's own exit script and fired twice: red at verification, green at the fix-findings confirm.
- the reading: Complete. Fifteen documents credited, the last three being the fault-finding card and the two craft guides.

## round_1_validate

- exercised against the goal: The goal is engine hygiene, and what shipped is six defects that each produced a plausible wrong answer. Four of the six had been written down for weeks and left standing because they were too small to schedule.
- missing: The heavy test file is not split, and that is the designed outcome rather than a gap. The measurement that decides it arrives at verification, after every build state, so the item was written as measure-then-decide from the kickoff on. The battery's own timings now exist for the first time on this container.
- wrong: Two things were wrong and both were found by somebody else. The empty-source row had a payload and no renderer. The configuration-path row was counted in one file where the row demands the count across the engine — and widening it turned up two further namings the tester had not reached.
- out of scope: Seven non-goals from the kickoff, unchanged. Two items went back to the pool with ready-when conditions.
- prior art: Made where it exists. THE VERSION FLAG loses against every command-line tool people use — git, node, docker, curl all answer `--version` and exit, and GNU's coding standards make it a requirement. Ours sheds nothing by adopting it. THE PACKAGE PROOF is deliberately weaker than a smoke test that starts the thing, on the owner's ruling, because running what the package built destroys the lane it runs in. THE OTHER FOUR have no external counterpart and the comparison was not made rather than filled with citations.

## goals_served

- ONE VERSION SOURCE, end to end: the engine reads its version from the manifest, and the entrypoint can be asked for it without starting a server.: SERVED. `engine/bin/se-mcp.ts` answers `--version` before the root is resolved, observed at exit 0 printing `5.0.0` including against a root that does not exist. req-the-entrypoint-answers-its-version-without-starting, tsp-an-install-answers-what-it-is, uc-prove-an-install, sty-ask-the-package-what-it-is, fn-arrive-on-a-machine.state-which-build-this-is.
- EVERY REFUSAL CLAUSE IS ANCHORED to its section in the guidance, with a test that refuses an unanchored one.: SERVED, and served before this record started. tests/refusals.test.ts carries both directions and the payload pointer. Struck at frame-delta with the evidence.
- THE BATTERY'S HEAVIEST TEST FILE stops dominating the wall clock.: NOT SERVED, and deliberately. The measurement that decides whether splitting buys anything only exists now, and i16 already measured that another file sets the critical path. raid-risk-splitting-the-heaviest-test-file-buys-no-wall-clock carries it.
- THE PAINT RULES ARE PINNED by tests: green means submitted, the thumb means blessed, and a law-proven green is told apart from an opinion.: SERVED. One decider, `statePaint`, and a law-proven green paints a dashed stroke. All four legs of the wire verified by the tester end to end. req-the-panel-s-paint-says-which-kind-of-green-it-is, tsp-the-paint-tells-three-greens-apart.
- THE STANDING SMALL DEFECTS from the 2026-08-13 pool are each either fixed or struck with the evidence that they no longer stand.: SERVED. 3 of 13 struck with evidence, 2 returned to the pool with ready-when conditions, 4 fixed with a requirement and a test spec each, 1 measured rather than built. Every one of the thirteen has a disposition.

## bound_breaches

- if-agent-harness-to-entrypoint: NOT BREACHED since this gate's window opened. The mirror's slow-request log records nothing after the boot pulls at 10:44:14Z, and every lane call across M4 through M7 answered inside the second.
- what improved rather than breached: preflight runs in 721 ms against 944 to 1029 ms before, because the boot check stopped importing the drawing graph. It is not a modelled interface and the numbers are recorded so the change is not read as neutral.
- every other modelled interface: Not exercised. This record has touched the web zero times, and its git, vault and test-runner crossings are the engine's own.

## round_2_red_team

- STEELMAN: this should have been an expedition, not an iteration — six small fixes do not need 29 states => The strongest form is that the ceremony visibly outweighed the code: five requirement rows, one story, one use case, a build plan and six gates for a version flag and four test pins. What defeats it is what the ceremony CAUGHT. Writing the actor row properly turned up that a standing crippling demand had never been met. The verification state's fresh eyes found two requirements unmet that every test called green. An expedition has neither.
- KILL-CRITERION: the tests are green because they were written to be, not because the code is right => It nearly was true, and somebody else had to find it. Two cases passed against no design at all — one suppressed excess-property checking with a cast, one matched `catch` anywhere in a file with three of them. Both are fixed and both now say in their own headers why the shape is forbidden. WHAT REMAINS UNPROVEN: nobody has swept the rest of the battery for the same shape, and raid-iss-a-case-guarded-local-artifacts-as-facts-of-the-source says so.
- Three engine repairs shipped that no requirement asked for => True, and each blocked the walk outright: a bound table's header read as a node id, its written cells read as references, and an empty register demanded a `none` nobody could write. Each is on the register with what it cost, and each now has a pin. The alternative was to stop the record and hand back three defects in the machinery that decides whether claims stand.
- The gate is blessed by its own author => Unchanged and standing as raid-risk-every-gate-in-this-record-is-blessed-by-its-own-author. What is different at THIS gate is that it is not the only judgment in the record: the tester is an independent view, and it overturned two of the five requirement verdicts.
- The version flag proves almost nothing => Conceded at the kickoff and unchanged. It does not start a server, so a startup-only defect passes it. The alternative was not a stronger check, it was none.
- A boot check that imports a renderer is a design error the requirement invited => Fair, and it is the sharpest thing this record did wrong. The row asks a check to ask the reader, and the first fix read that as "import the module that reads". The correct home was a module that owns the configuration folder and imports nothing — which is what the row meant all along. It cost a red battery and a tester to see it.

## raid_additions

- raid-iss-a-case-guarded-local-artifacts-as-facts-of-the-source

## verdict

pass — the battery is green at rest, both blockers are closed, and every one of the twelve findings has a disposition on the record

WHY A CLEAN PASS RATHER THAN AN OVERRIDE. Nothing is being waved through and no debt was taken. The two requirements that did not stand were built rather than argued about, and the four repaired defects each carry their own register entry.

WHAT THE ADJUDICATOR SHOULD PUSH ON. The three engine repairs outside the blessed scope. Each blocked the walk and each is recorded, but a record that fixes the machinery it is walking on is a record that could have hidden something in it. The pins in tests/bound-table-refs.test.ts are what a reader can check.

THE SECOND THING WORTH PUSHING ON. Two of my own test cases were hollow and a tester found them. That is the argument for the fresh-eyes rule and also the reason to distrust the rest of this record's greens more than the numbers suggest.

## follow_up

fill-story-evidence is next, and the new story is a MUST — its demonstration is one command.

WHAT GOES TO THE RETRO rather than into this record.

- A claim can sign on evidence content the engine rebuilds differently at the next look. The probes field answered as prose and failed its own re-check.
- A blocking engine defect needs three acts, not one: fix it, reach idle, reload. The running engine holds the sources it started with, and that cost two full restarts.
- The battery has no per-state cost, so a record cannot say which step was expensive.

WHAT GOES TO THE POOL. The unswept battery: nobody has looked for other cases that read a working tree as if it were the repository, and one was found by accident here.

## anything_else

THE SEVEN QUALITY BOXES, each with what it rests on rather than a bare tick.

- DEPENDENCIES STAY LAYERED. The one change that broke this is the one the tester caught: preflight reaching a renderer took a boot check from 16 modules to 95. The paths moved to `brand.ts`, which imports two node builtins and nothing else, and a case now asserts preflight imports no renderer.
- ONE STATED RESPONSIBILITY. No new element was created. The one new function says what it does and what it deliberately does not.
- LINTER AND CEILING CLEAN. 307 files, no findings, no suppression added anywhere.
- EVERY NEW BEHAVIOUR CARRIES ITS CHECK. Twenty-five cases across five files, plus five more pinning the three engine repairs that had none.
- NOTHING SPECULATIVE. The one thing that could have been built for a future nobody named is the test split, and it was not built — the measurement that would justify it did not exist.
- WHAT CHANGED IS FINDABLE. Six design specs carry the design of what changed in the files they claim, and two engine files that no spec claimed were given one.
- DEBT IS VISIBLE. There is none to make visible: nothing here was a conscious trade of quality for speed, which is why `debt_taken` says none rather than naming something to look responsible.
