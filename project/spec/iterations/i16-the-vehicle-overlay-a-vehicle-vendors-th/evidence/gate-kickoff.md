---
form: gate-kickoff
bless: blessed by agent
by: agent
signed_off: 2026-08-18T08:50:28.525Z
authors: agent
files:
---

# Evidence form / gate-kickoff

## current_situation

i16 stands at its kickoff gate, having walked M0's onboarding retro.

WHAT THE RETRO LEFT. The notes inbox went from 30 to 0: 5 done, 3 obsolete, 31 parked. All 91 previously parked items were walked and none was ripe. All ten raid debt rows carry a dated look, and one of them had never been swept since i33 minted it. Two method changes landed and one engine fix, on the owner's instruction.

WHAT THE RETRO GOT WRONG, because it shapes how this gate reads its own evidence. Two of its four headline findings were false and the owner caught both from memory. Both failed the same way: a downstream symptom was measured carefully while the document governing the mechanism went unread.

WHAT THE ITERATION IS. A vehicle vendors the engine in a folder of its own, overlays its own guidance and method through one resolution chain, and never writes under the engine.

WHY NOW, in the owner's words: get to a state where we can work, and start with the vehicle and the foreign project tomorrow.

WHAT MOVED TO MAKE IT REACHABLE. The `depends_on` edge on i10 was cut on the owner's ruling of 2026-08-18, and the rulings are written into the record.

WHAT IS ALREADY PROVEN, BEFORE ANY CODE. v1 built this chain and it was READ THIS SESSION at ref main rather than cited. `product/engine-go/resolver.go` carries the whole mechanism: `overlayLayers()` returns three layers most-specific first, `Resolve()` walks them and takes the first hit in ten lines, `ResolveGuides()` walks engine-first so the vehicle overwrites, and `selftestSplit()` asserts the three properties that matter.

AND IT ANSWERS THE FOLDER QUESTION BETTER THAN EXPECTED. `EngineDir()` PROBES two locations: `tools/vendor/quackitect` for a vehicle, falling back to `product/quackitect` for the dogfood repository. The same code serves both without either changing its layout. So the wrapper root does not have to move for this iteration to work, which is exactly what the owner hoped for.

## retro_drained

- note-2b1ccd564681 — THE AGENT MAY SPAWN SUBAGENTS: done, it is contract rule 11 at line 186
- note-11fdc65a1d43 — THE CONTRACT MUST CARRY THE PERMISSION: done, the contract half landed
- note-4bb710fe6520 — A STATE WITH NO EVIDENCE FIELDS IS INVISIBLE: done, closed at session.ts owesASignature
- note-fa24138d389e — THE WALK CROSSED AN UNSUBMITTED STATE: done, same fix
- note-9cbea25d2696 — HOW EVERY ITERATION WALKED PAST fill-story-evidence: done, same fix
- note-03e84c9b7c90 — needs retro: i33 shipped: done, this retro is the trigger
- note-f2f503b51dc3 — session.ts MAPS TO NO SCOPED TEST: obsolete, its own correction disproved the diagnosis
- note-a0dd8cf3faf6 — fix-findings HAS NEVER RUN: obsolete, wrong on every count, retracted by the owner
- note-238b43773188 — se_test IS 560 CALLS AND 48 VERDICTS: obsolete, already ruled, the feedback piggybacks
- note-f2bc2e1e2fb8 — THE PULL HAS NO PHASE BREAKDOWN: backlog, still true, checked today
- note-009a76da02aa — THE OPTIMISTIC PAINT HOLDS: backlog, half answered, the hold is now per-bank
- note-984d1b74e14c — THE VSCODE CLICK HANDLER HAS NO COVERAGE: backlog, zero of 139 test files reach it
- note-908e2e3b0dfc — A MACHINE SHOULD SHOW ITS OWN TITLE: backlog, still true, checked today
- note-8c6983ee66a9 — A PROBE WHOSE INSTRUMENT GOES IN THE ENGINE: backlog, wants a fifth probe outcome
- note-ce4ac7d7af2d — ONE FILE MUST NOT FORCE THE WHOLE BATTERY: backlog, unchanged and now ready
- note-4bfbbe7e8d93 — THE SCOPE MAPPING IS A FILENAME LOOKUP: backlog, re-checked byte for byte
- note-c137415d46d2 — A STATE NOBODY HAS WALKED: backlog, its question belongs with i31
- note-8a7a3030c5e9 — i15 BUILT TWO ENGINE PARTS AND GAVE NEITHER A DOOR: backlog, still doorless
- note-1447294a356d — THE WALK MUST RETURN TO A STATE: backlog, the hard stop closed, the rewind owed
- note-7d39aec8eee0 — se_exp_close MERGED FROM MID-WALK: backlog, confirmed unguarded at worktree.ts 489
- note-fe85c74be747 — A GATE SIGNED WHILE THE ROUTE REFUSED: backlog, it breaks a standing decision
- note-e9d74fcaf636 — TWO LANE FRICTIONS: backlog, half disproved, the inbox CAN be read back
- note-230eab44b08b — THESE DECKS SURVIVED IS UNVERIFIED: backlog, its check needs a verb this state lacks
- note-6c9321309b45 — A GATE DEMANDED ANOTHER RECORD'S NODES: backlog, the owner's to rule
- note-20d53a0e40fe — THE STOP HOOK BIT A SANCTIONED STOP: backlog, patched, the proxy stands
- note-b621c9986b74 — THE KICKOFF'S pulled_in FLATTENS: backlog, a form-schema question for i29
- note-5aeda2a86ceb — UNSTICKING A GREYED CHAIN IS HAND WORK: backlog, one of three on one question
- note-380d789f6f85 — se_amend's chain DOES NOTHING: backlog, whether it is wanted comes first
- note-fc18d2775583 — A KICKOFF RE-SIGN COSTS ONE SUBMIT PER STATE: backlog, it names its own measurement
- note-29960c805dc0 — CONFORMANCE NEVER REACHES AN UNPOINTED NODE: backlog, blast radius unmeasured
- note-360be74ad2e0 — THE BREACH WINDOW RESETS ON ITS OWN SUBMIT: backlog, the fix is stated exactly
- note-f60cea3ed555 — THE RETRO'S WINDOW OPENED AT A done DRAIN: backlog, and FIXED in this walk
- note-4387180fe2b9 — THE SESSION PROMPT STILL FORBIDS SUBAGENTS: backlog, the repo cannot reach it
- note-9f3883ec38fd — A RULING WITH NO ITERATION NEVER GETS BUILT: backlog, belongs with i17
- note-56343e522395 — A FABRICATED NOTE REF LANDED IN A STORED FIELD: backlog, mine, one regex fixes it
- note-83b3d8a1d65a — EVERY se_pull LATENCY READING IS A FLOOR: backlog, one piece of work with the phase split
- note-c14bc8712a54 — THE SHELL REPLACED A LANE VERB: backlog, two of its three parts cost nothing
- note-814c6d46f2ac — THE TOOL AN AGENT REACHES FOR WHEN STUCK IS REFUSED: backlog, owner accepted, not understood
- note-168e7a7fe477 — A FORM SAVED ANOTHER STATE'S FIELDS: backlog, belongs with i29

## goals

- VENDORED AND SEALED. The engine sits in a folder of its own inside a host repository, resolves every resource it serves from inside that folder, and writes zero files into it. (req-engine-folder-is-sealed)
- THE OVERLAY WINS BY IDENTITY. Where a host carries a card for an identity the engine also ships, the host's card is served at every point that identity resolves, and an un-overridden resource is inherited. (req-overlay-resolution)
- IT WORKS WITH NO OVERLAY AT ALL. With none present, the product comes up on the engine's shipped method and zero builder-authored configuration files. (req-setup-serves-shipped-method)
- AN UPDATE IS A REPLACEMENT, NOT A MERGE. A new engine version replaces the vendored folder whole, with zero merge operations and zero edits to builder-owned files, and whatever no longer resolves is REPORTED rather than silently defaulted. (req-overlay-survives-update, req-overlay-drift-reported)
- ONE COMMAND MAKES A VEHICLE. The export produces a host repository with the engine vendored, an empty overlay ready to write into, and no second install of anything. (req-second-product-reuses-install)

## pulled_in

- THE RESOLUTION CHAIN, ported from v1's `product/engine-go/resolver.go` at ref main. Origin: the record's own inputs, and the file was READ this session rather than cited. `overlayLayers()` plus `Resolve()` is about twenty-five lines.
- THE SEAL. The engine resolves from inside its own folder and writes nothing into it. Origin: req-engine-folder-is-sealed, minted i1, graded crippling.
- THE HOST'S OVERLAY LAYER, above the engine's, owned by the host and never touched by an update. Origin: req-overlay-resolution's eight clauses.
- THE DRIFT REPORT. What an engine update renamed that an overlay still points at is named, rather than the engine's default being served quietly. Origin: req-overlay-drift-reported and uc-vendor-and-overlay extension 6a.
- THE EXPORT PATH BECOMES A VENDORING. `RUNME.ps1 --export` today copies the whole tree, renames the brand and makes a fresh repository with one commit — a FORK. It must instead produce a host repository with the engine vendored and an empty overlay. Origin: the owner's goal, and req-second-product-reuses-install.
- A PROBE ON THE ENGINE FOLDER'S LOCATION. Origin: owner instruction 2026-08-18 that the folder decision is the agent's, settled by spike. v1 answers it by PROBING two locations rather than by moving anything, so the probe is cheap and its likely answer is already visible.
- THE OVERLAY SEAM'S TESTS. tsp-overlay-seam names tests/overlay.test.ts as the planned home and says three of its four claims are defined ahead of their cases. This iteration writes them.

## left_out

- THE FOLDER REWORK ITSELF — removing the wrapper repository root. Where it went: the owner ruled it may land later in its own iteration and must not block the overlay. Their words: "We can do the folder rework later. That's also... that's fine." v1's probing `EngineDir()` is the evidence that it is not needed here.
- MODULE-QUALIFIED IDS, and the whole of i10. Where it went: the owner ruled them later, accepting more total work. "The modules, we can do it later. That's not that important. Even if that means more work overall." The `depends_on` edge is cut and the argument is on the record.
- THE 121 BROKEN CITATIONS. Where it went: i10, and they cannot be repaired anywhere else — their sources are `.se/req-mine-v1.md` and `.se/req-mine-v2.md`, and `.gitignore` line 2 means they travel to no clone.
- THE FULL BEGIN-A-PRODUCT SCAFFOLD beyond what the export already does — req-scaffold-from-template, req-begin-touches-nothing-existing, req-fresh-product-starts-empty and the rest of tsp-product-scaffold. Where it went: unassigned, and it stays unassigned. This iteration makes ONE command produce a vehicle; it does not build the desk affordance around it.
- THE BRAND LAYER'S RENDER-TIME SUBSTITUTION. Explicitly out: v1 rejected rewriting text the ledger hashes, and the record carries that ruling. Identity surfaces come from the brand layer instead.
- THE PARALLEL-COORDINATES WORK the record pulled in from the pool on 2026-08-13. Where it went: it belongs to whichever record next touches the front card, and the owner has separately ruled that card has not earned its keep.
- EVERY ITEM IN THE POOL. 99 stand parked, each with its own ready-when. None blocks this iteration and none is blocked by it.

## change_size

minor — and the reasoning follows i34's correction rather than my own instinct, because that correction is the sharpest thing in the archive about this field.

THE COLUMN PRICES DESIGN INPUT OWED, NOT CODE TOUCHED. i34's gate records the agent getting this exactly wrong: "I priced the change by how much CODE it touches. The column prices how much DESIGN INPUT is owed, and this change owes almost none." i16 touches a lot of code and owes very little design.

WHAT MINOR DROPS TO none, and why each has nothing to do here. The M4 candidate lane — enumerate-space, derive-criteria, cut-criteria, evaluate-set, run-candidates, partition-functions, gate-candidates. The M5 architecture lane — converge-pugh, reverse-sensitivity, declare-winner, record-adrs, evaluate-architecture, gate-architecture. The M6 prototype lane — rank-unknowns, run-spikes, fold-back, gate-prototype. That is seventeen rows of CHOOSING BETWEEN DESIGNS, and there is one design: v1's layer chain, which I read at ref main this session.

WHAT MINOR KEEPS AT full, which is the part that matters: write-requirements, author-tests, observe-red, specify-build, build-steps, verification, trace-design, fix-findings, sweep-consistency, package, and all three of gate-requirements, gate-implementation and gate-release. Tests first, red observed, build, verify, sweep, ship.

WHERE THE FOLDER PROBE GOES ONCE run-spikes DROPS. To probe-assumptions at M3, which minor keeps at full and which i34 used for its own gating probe. That is the right home anyway: the folder question is an ASSUMPTION with a cheap probe, not a prototype of a competing design.

THE ESCALATION TELL IS EXPECTED TO FIRE, AND I AM NAMING IT RATHER THAN HOPING. decompose-structure's minor_note says escalate when the work wants a NEW element or interface. i16 ADDS a resolution mechanism where none exists, so it probably wants one. i34 could say the tell would not fire because it only removed things; I cannot say that.

WHY I STILL PROPOSE minor RATHER THAN major. Escalation is designed to be VISIBLE and cheap — the walk says so at decompose-structure and the column moves. Starting at major buys seventeen rows of selecting among candidates that do not exist, and the owner's stated constraint is to have a vehicle working tomorrow. If the tell fires, the walk escalates in the open and nothing is lost but the rows we would have skipped anyway.

NO STRIKES PROPOSED. Every row minor keeps is one I want.

## round_0_verify

- evidence vs claims: every file and line cited here was OPENED this session, not recalled. project/deliverable/engine/promptlayer.ts lines 22-34; engine/paths.ts lines 172-177; engine/bin/package.ts lines 30-49 and 58-72; RUNME.ps1 lines 57-155; engine/calllog.ts lines 202-224; engine/discipline.ts lines 402-418; engine/session.ts lines 1613-1643; engine/worktree.ts lines 489-511; engine/stateform.ts lines 944-963; M7_60_fix-findings.md whole. The four vendoring requirements and uc-vendor-and-overlay were read whole. v1's product/engine-go/resolver.go was read at ref main, 196 lines, and it is the design input the whole size argument rests on.
- and one claim was RETRACTED before it reached this gate: that fix-findings has never run. It was built on the absence of an evidence file, and the row says the state has no evidence of its own by owner ruling. The owner caught it from memory. That correction is why every citation above names a line rather than a file.
- types: NOT RUN, and it would answer nothing. No TypeScript changed in this iteration's own scope; the two edits this session were to engine/calllog.ts and two test files, both inside the retro.
- lint: RUN, green. biome checked 285 files in 430 ms with no fixes applied, inside the battery at 08:42.
- tests: RUN AND RED, THEN REPAIRED, AND THE CONFIRM RUN IS OWED. The battery at 08:42 answered 1439 tests, 1438 pass, 1 fail. The failure was mine and it was informative: tests/retro.test.ts line 82 asserted that a `done` drain marks a retro, which is the exact behaviour the window fix removes. Its own sibling at tests/mcp.test.ts line 239 asserted the opposite, so the suite held two cases that could not both be right. The stale case now drains a judgment disposition and carries the reason.
- WHY THE CONFIRM RUN IS NOT HERE: se_test is not legal at gate-kickoff. Checked by calling it — SE-C-110, naming the ten verbs this state grants. The battery is the engine's and it runs at verification. The repair stands unconfirmed until then, and that is stated rather than papered over.
- the sweep: RUN, green. 1305 nodes under project/spec in 413 ms.

## round_1_validate

- exercised against the goal: The goal is that somebody can build software with this system and keep their own guidance. It was exercised against the current product this session and FAILED, which is the argument for the iteration. `RUNME.ps1 --export <folder> <name> <abbr>` copies the whole tree, renames the brand and commits once — the receiver gets our guidance and the engine as one lump, with no seam. An upstream update would be a merge.
- missing: The overlay mechanism's own proof. tsp-overlay-seam says three of its four claims are DEFINED AHEAD OF THEIR CASES because the mechanism is not built, and tests/overlay.test.ts does not exist. Nothing here has been shown to work; it has been shown to have worked in v1, in another language.
- and one thing is missing that this gate cannot supply: whether v1's data-home overlay layer translates to this product at all. v1's most-specific layer is `dataDirFor("overlay")`, a per-workspace data directory. v3 has no data home. Where that layer goes is a real design question and it belongs at decompose-structure, not here.
- wrong: My first reading of this iteration's dependency. I reported that i16 waits on i10 because req-overlay-resolution demands one shared identity scheme. The demand is real; the inference that i10 supplies it was not checked against what the overlay actually resolves. Method artifacts resolve by hardcoded PATH today and already carry an `id:`, and i10 renames the SPEC corpus the chain never touches. The owner cut the edge and the argument is on the record.
- out of scope: the folder rework, module-qualified ids, the 121 citations, the full scaffold family, and the brand substitution. All five are named in left_out with where they went or why they are out.
- prior art: OURS IS THE CLOSEST AND IT IS READ RATHER THAN CITED. v1's resolver.go implements exactly this: a layer list most-specific first, first-hit resolution in ten lines, guides walked engine-first so the vehicle overwrites, and a selftest asserting the three properties — an engine default resolves to the engine, an overlay wins, and inheritance returns when the override is removed. Its `EngineDir()` probes `tools/vendor/quackitect` and falls back to `product/quackitect`, so one binary serves a vehicle and the dogfood repository without either moving. NOT COMPARED against any external tool, and saying so beats inventing one: the mechanism is a filesystem layer chain, and the only implementation whose tradeoffs we can actually evidence is our own.

## bound_breaches

- if-agent-harness-to-entrypoint: BREACHED TWICE in this gate's window, both times doing real work. Its bound is 1 second. This gate has never signed, so the window is the whole record: 2026-08-18T08:08 to now. Five records sit at or over a second and only two are this boundary — se_pull binding i16 and compiling its machine at 3475 ms (call-64f344ee5bdd), and se_pull submitting the retro with nine filled fields at 1025 ms (call-845eb22c1329). Neither is attributable to this iteration's subject, because the overlay chain does not exist yet.
- the other three records at or over a second: NOT this boundary. se_test_verdict at 66,823 ms is the battery, whose bound is deliberately not one second. The two mirror_slow entries are the transport's own shadow records of the two pulls already counted, not separate crossings.
- the reading itself: A FLOOR, NEVER A MEASUREMENT, and this interface's own node says so at lines 42-44 — every count quoted for it is a floor because the log undercounts silently. This retro added a second reason: the transport and the tool disagreed twenty-fold on one call in the previous window, 3384 ms against 69,141 ms, now note-83b3d8a1d65a. Both errors point the same way, so the true figures can only be worse.
- the standing baseline it is measured against: MISSED, and known to be. The node records 1834 of 8424 calls over a second as of 2026-08-17, with a worst single answer of 33,461 ms. This window's two breaches change nothing about that and are not offered as progress.

## round_2_red_team

- STEELMAN: this gate should FAIL, because the agent proposing minor is the agent that wants to finish tomorrow, and the deadline is doing the arguing => Partly right and worth stating plainly. The deadline IS in the reasoning, named rather than hidden. What answers it is that the size argument stands without the deadline: seventeen dropped rows are all design-SELECTION rows, and there is one design, read at ref main today. Remove the deadline and minor is still the honest column. What the deadline changes is only the tolerance for escalating later rather than starting high.
- KILL-CRITERION: this is the wrong call if the overlay needs a NEW element, because decompose-structure's minor_note says escalate exactly there => It probably does need one, and I said so in the size field rather than waiting to be caught. This is the difference between i34's case and mine: i34 could show the tell would not fire, and I cannot. The mitigation is that escalation is visible and cheap by design; the risk is that it arrives four states in and costs a re-sign of everything above it, which is real and is note-fc18d2775583's subject.
- THE AGENT RETRACTED TWO FINDINGS TODAY AND IS NOW PROPOSING A COLUMN => Both retractions have the same cause and it is worth carrying into this gate: a symptom was measured while the governing document went unread. So this gate's central claim rests on the governing documents themselves — the four requirements, the use case, the rigor rows, and v1's resolver read whole at ref main. No claim here rests on the absence of something.
- THE FOLDER QUESTION IS BEING ANSWERED BEFORE ITS PROBE RUNS => True, and the honest form is that the probe's likely answer is now visible rather than settled. v1 probes two locations rather than moving anything, which is evidence that the wrapper root need not go. It is not proof for THIS product, and the probe still runs at probe-assumptions.
- vp-vendoring IS GRADED must AND THE WORK IS GRADED could => Checked, and it is a real inconsistency in the corpus rather than a rhetorical point. uc-vendor-and-overlay is `priority: could`, req-overlay-resolution and req-engine-folder-is-sealed are `should`, req-setup-serves-shipped-method and req-second-product-reuses-install are `could`. The value prop they refine is a MUST whose recorded reason is that quackitect goes open source while company guidance stays inside the company. A must served only by coulds is a gap somebody should rule on; it is raised here and not resolved here.

## raid_additions

- NONE MINTED AT THIS GATE, deliberately. note-6c9321309b45 records what happens when a gate authors the nodes it then judges, and contract rule 5 forbids judging text written into a thing in the same pass.
- ONE ASSUMPTION IS OWED and is named so identify-assumptions cannot miss it: the engine folder can be FOUND BY PROBING rather than by fixing a path, so a vehicle and the dogfood repository share one binary without either moving its layout. Its probe is v1's own `EngineDir()`, and it gates whether the folder rework is needed at all.
- ONE MORE IS OWED at the same state: v1's most-specific overlay layer is a per-workspace DATA HOME, and v3 has no data home. Whether that layer has an equivalent here, or collapses into the host's own folder, is unanswered.
- AND ONE ISSUE IS RAISED RATHER THAN MINTED, because it is the owner's to rule: vp-vendoring is a MUST and every node refining it is graded should or could.

## verdict

pass — at change size minor, with the escalation tell named in advance rather than discovered later.

WHAT THE PASS RESTS ON. The goals are five requirement-backed lines, each naming the row it serves. The scope is seven items in and seven out, each with its origin or its destination. Every file and line cited was opened this session. The central design input, v1's resolver.go, was read whole at ref main rather than quoted from the record's summary of it — and reading it changed the argument, because `EngineDir()` probes two locations and so the wrapper root need not move.

WHY minor IS HONEST HERE. It drops seventeen rows of choosing between designs, and there is one design. It keeps every row that guards a build: tests first, red observed, verification, trace-design, sweep-consistency, and three gates.

WHAT THE PASS DOES NOT CLAIM. That the tell will not fire at decompose-structure. It probably will, because this iteration ADDS a mechanism, and the cost of escalating late is a re-sign of everything above it.

THE ONE THING LEFT UNCONFIRMED, stated rather than waved: the battery went red on one case during the retro, the cause was a stale test asserting behaviour the window fix removes, it is repaired, and se_test is not legal at this gate. The confirm run is owed at verification.

THE COLUMN IS A PROPOSAL AND THE BLESS IS THE OWNER'S. The method reserves this decision to the person and nothing below this gate assumes an answer.

## follow_up

IMMEDIATELY, on the bless: the engine compiles the blessed column into i16's state machine and pins it, and the walk moves to M1.

THE FIRST REAL WORK, in the order the machine will ask for it.

1. draft-vision and scope — the goals above become the record's, and the five conflicts worth ruling get ruled.
2. identify-assumptions — the two owed assumptions are already named in raid_additions.
3. probe-assumptions — the folder probe runs here, not as a prototype. v1's EngineDir gives it its shape.
4. write-requirements — the five requirements exist and are unbuilt, so this is mostly binding them rather than authoring.
5. author-tests, then observe-red — tests/overlay.test.ts is the planned home tsp-overlay-seam already names, and three of its four claims are waiting for it.
6. specify-build and the chunks — the resolution chain, the seal, the drift report, and the export becoming a vendoring.

WHAT THE CLOUD AGENT DOES IN PARALLEL, on the owner's routing: i17, the options pool. Its file set is the note drain and a new committed pool folder, and it touches none of the engine files above.

AND ONE DEBT WILL FIRE THE MOMENT THAT CLOUD RUN STARTS. raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make is repayable for the first time, because i35 shipped. It only counts if the entrypoint RUNS — a session that hands the agent a branch and lets it type the steps by hand is what that row already excludes.

ONE THING IS OWED AND CANNOT BE DONE FROM HERE: the confirm run on the retro's window fix. It runs at verification.

## anything_else

WHAT READING v1's RESOLVER CHANGED, because a gate should say when its own evidence moved it.

I came to this gate expecting to propose major and to tell the owner the wrapper root probably had to go. Both changed on one read.

THE MECHANISM IS SMALLER THAN THE RECORD CLAIMS, and the record was already calling it small. `overlayLayers()` is fourteen lines. `Resolve()` is ten. `ResolveGuides()` walks the same list backwards so the vehicle overwrites. `selftestSplit()` asserts the three properties in twenty lines and is worth porting almost verbatim, because it tests the seam rather than the code.

AND THE FOLDER PROBLEM HAS A CHEAPER ANSWER THAN MOVING ANYTHING. `EngineDir()` probes `tools/vendor/quackitect` first and falls back to `product/quackitect`. A vehicle has the first, the dogfood repository has the second, and one binary serves both. The comment says so in its own words: nothing carries a hardcoded dogfood path.

SO THE OWNER'S PREFERENCE AND THEIR CONSTRAINT ARE BOTH SATISFIABLE. They wanted the wrapper root gone and accepted keeping it. The probing answer means the overlay does not depend on which way that goes, so the rework can land later on its own merits rather than as this iteration's blocker.

WHAT I WOULD STILL LIKE TO KNOW, and it is the probe rather than a question for the owner: where v1's most-specific layer goes here. Theirs is a per-workspace data home and v3 has none.

AND A NOTE ON HOW THIS GATE WAS BUILT, because the retro above it earned the caution. Two of the retro's four headline findings were false, both because a symptom was measured while the governing document went unread. Every claim in this gate cites a document read this session, and the one claim I could not check — the confirm run — is named as unconfirmed rather than assumed green.
