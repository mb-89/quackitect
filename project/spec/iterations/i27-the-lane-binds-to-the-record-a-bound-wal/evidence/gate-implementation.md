---
form: gate-implementation
amended: "2026-08-14T18:22:33.373Z by agent — prior art was recorded as unmade instead of being done; the owed count was wrong; the autonomy number has started leaving"
by: agent
signed_off: 2026-08-14T18:09:26.069Z
authors: agent
files:
---

# Evidence form / gate-implementation

## current_situation

Thirteen build chunks signed, trace-design signed, verification signed.

THE BATTERY IS GREEN: 1271 of 1271, preflight green, lint clean. Job `test-mst98hdl-12`.

THE GOAL WAS DELIVERED AND THEN SOME. The record's goal is that the lane binds to the record and a write lands where the walk stands. That landed. On the owner's word mid-build, SE-C-134 was also retired and a thirteenth chunk was added.

NINE OF TEN VERIFICATION CLAIMS ARE OWED, each against an open register entry. That is the honest state of this gate and the reason its verdict is not a clean pass.

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

acceptable — No implementation risk was added or regraded. Two ISSUES were opened and both are observations rather than exposure changes: `raid-iss-the-autonomy-number-still-rides-every-answer` records a standing spec that cannot be observed green, and `raid-iss-whole-product-claims-reverified-by-every-record` records why nine claims are owed. `raid-risk-a-broken-engine-delta-has-no-way-back` was CLOSED IN EFFECT by `replaceComposition`, which keeps the working composition until the replacement validates — but I did not regrade it, because regrading a risk on the strength of code that has no live caller would be the same overclaim this gate exists to catch.

## round_0_verify

- evidence vs claims: every chunk form's claim was checked against the code it names, not against its own text. Two survived that check only after correction — `supervisor-watch` claimed three things and had numbers for two, and `refusal-remedies` was read in code rather than trusted from the handover.
- types: `npx tsc --noEmit` exits 0, run after every engine change and last at the close.
- lint: biome clean at the battery, error-on-warnings. The complexity ceiling FIRED on `fieldProblems` at 36 against a max of 25, and it was refactored into `voiceProblems` rather than suppressed.
- tests: 1271 of 1271, 129 suites, preflight green. Four reds were found and fixed during the run, and every one was this record's own: a container assertion pinning the old law, the write-door ceiling missing `bound.ts`, a truncated use-case id in a refines edge, and three test files naming a real guidance path.

## round_1_validate

- exercised against the goal: YES, and in production rather than in a fixture. A method write from inside the bound record landed with no refusal, which is the goal stated as an act. The forty-four hop route that produced `is not active` eight times now walks in four clean pulls.
- missing: the three process modules have NO LIVE CALLER. `core.ts`, `satellite.ts` and `channel.ts` are logic with tests and nothing that runs them. `se-mcp.ts` still starts one process that does everything. REAP, one of the four acts `dsp-satellite-lifecycle` names, has no code at all. Planned incompleteness rather than a surprise — but a reader should not take the chunk count as a working core-and-satellite.
- wrong: the self-hosting flag was built and reverted on evidence. It made `workRoot()` answer the machine root, and four design specs went invisible in one read, because the record's content stands on its branch and not on trunk. `project/product.md` now says in its own text that nothing reads the flag yet.
- out of scope: SE-C-134's retirement and the `clear-jump` chunk were both added mid-build on the owner's explicit word. The kickoff bless covered neither.
- prior art: COMPARED, on three shapes, against systems people actually use. THE DELTA vs OVERLAYFS (kernel.org/doc/Documentation/filesystems/overlayfs.txt): overlayfs layers a writable upperdir over read-only lowerdirs, copies a file up on write, and MERGES directories where both sides hold one. It does more than ours — whiteouts for deletion, metadata-only copy-up, and it is transparent so nothing opts in. Ours sheds the MERGE deliberately: `composeForRecord` serves one store or the other and never both, because a composed view nobody assembled is what `req-entry-levels-the-record-tree` forbids, and the override list is readable without diffing. THE PROCESS SPLIT vs LSP AND TSSERVER: the multi-server LSP pattern runs one server per workspace folder for complete state isolation, which is our satellite. tsserver takes the opposite road — one process, many projects, sharing a DocumentRegistry so a file is parsed once. THAT SHARING IS WHAT OURS LACKS: our core owns the ledgers but nothing shares a parsed corpus between satellites, so N satellites would re-read it N times. The LSP pattern is shipped and proven; ours is not started. What ours adds is a core that owns machine-wide single state, which neither has because an editor coordinates instead. THE SEAM vs GIT WORKTREE (git-scm.com/docs/git-worktree): git answers the same question — which paths belong to the machine and which to the checkout — and answers it the same way, by category plus a short explicit exception list (`refs/bisect`, `refs/worktree`, `refs/rewritten`). Ours is `pathKind` plus `METHOD_PREFIXES`. Git does it BETTER in one respect that matters: the split is physical, so a caller cannot address the wrong side by accident, while ours is a routing decision that `se_run` bypasses entirely — `raid-iss-the-shell-writes-method-with-no-path-to-judge`, still open. What ours adds is that the answer NAMES its store, so a wrong resolution shows at the call rather than at a merge.

## round_2_red_team

- STEELMAN: this record should have stopped after the seam and the resolution change => That is the strongest opposing case and it is largely right. The goal was delivered by `laneRoot` sending method to the machine root, plus the seam. Everything from `core-process` onward is the NEXT record's shape, built early. The counter is that the build plan blessed that order at gate-architecture, and the chunks are tested rather than sketched.
- KILL-CRITERION: if the core-and-satellite design turns out wrong when a real process is stood up, three chunks of tested code become three chunks of tested wrong code => I looked for it and cannot rule it out. The prior-art search sharpened it rather than settling it: tsserver runs many projects in ONE process and shares a parsed-file registry, which is a live counter-design to the split, and our design has no equivalent sharing. `raid-asm-machine-wide-state-serves-over-a-local-channel` carries the assumption and is probed only for the call log.
- The battery being green proves the build is correct => It does not. It proves nothing REGRESSED. Four of ten verification claims are now observed and six are owed, and the battery cannot observe a demonstration.
- Retiring SE-C-134 removed a guard that stopped a real accident => The refusal was replaced by a RESOLUTION, checked rather than assumed: `laneRoot` sends method to the machine root, so a method write cannot land in a tree that does not own it. What the guard never covered is unchanged — `se_run`'s shell writes are handed no path to judge. Git worktree's physical split does not have this hole, and ours does.
- The stop hook was reported fixed by the last session and was not => Confirmed and fixed here. It was wired in the repository root's settings, one directory above the workspace, so no session ever loaded it. It has since bitten this session twice. `tests/cage.test.ts` fails if any shipped hook is missing from the template RUNME installs.
- The verifier was the builder, which the discipline forbids => True and unavoidable here; `note-eccbfe7cd689` records thirty-four spawned verifiers, every one refused before reading a line. AND I OVER-USED IT. The first version of this gate owed nine of ten claims on that rule. Four were inspections and analysis a careful reader performs, and performing them found a committed trace node carrying an account name. Owing them would have hidden it.

## raid_additions

- raid-iss-the-autonomy-number-still-rides-every-answer
- raid-iss-whole-product-claims-reverified-by-every-record

## verdict

pass with overrides — The build is complete, the tree is green at 1271 of 1271, and the record's goal is delivered and demonstrated in production rather than in a fixture. TWO OVERRIDES ARE ASKED FOR, down from three, and each is named rather than absorbed. FIRST, six of ten verification claims are owed: five need a person, the panel or a fresh machine, and one is red. `raid-iss-whole-product-claims-reverified-by-every-record` says why serving every record the whole product's claims is itself a defect. SECOND, scope grew past the kickoff bless twice on the owner's own word, adding the SE-C-134 retirement and the `clear-jump` chunk. THE THIRD OVERRIDE IS WITHDRAWN because the work was done rather than excused: prior art is now compared on three shapes against overlayfs, the LSP and tsserver patterns, and git worktree, each cited to its primary source, and the autonomy number has left the agent's packet. WHAT A BLESS WOULD STILL BE ACCEPTING is a core-and-satellite that no process runs, and a numeric autonomy that survives on the panel and in the weighing until i14 takes it.

## follow_up

THE BLESS IS THE OWNER'S. This gate is the one the standing order of 2026-08-14 keeps for them, and the evidence is submitted unblessed.

What waits behind it:

- The 18 off-scale grades on trunk, corrected on this branch and stale there. Levelling moves them, and levelling needs a live caller for the git adapter.
- `raid-iss-the-autonomy-number-still-rides-every-answer` needs the owner's ruling on which half moves, the number or the criterion.
- The one-folder question, `note-61ed242bac7e`, is parked for the retro on the owner's request.

## anything_else

THREE THINGS THE BOXES ABOVE COULD NOT HOLD.

WHY `nothing speculative shipped` IS TICKED WHILE THREE MODULES HAVE NO CALLER. Speculative means built for a need nobody established. `dsp-core-and-satellite` traces to elements and interfaces that trace to requirements, and the chunks were blessed at gate-architecture. The code is ahead of its caller, which is incompleteness rather than speculation. Flagged here because a reader could reasonably disagree, and a gate is the place to disagree.

WHY `debt_taken` SAYS none. No quick-and-dirty was taken. The shortcuts this record met were pre-existing and each was registered rather than worked around.

WHAT THE RECORD FOUND THAT NOBODY WAS LOOKING FOR. Four defects surfaced only because something else was being built: the stop hook wired above the workspace, a duplicate `inputs:` key that made a corpus file unparseable and hid an undeclared crossing, a `GitLane` interface promising `rebase` when SE-C-002 forbids exactly that, and a committed trace node carrying an account name. None would have been found by testing the thing under construction, and the last one would have been hidden by owing the claim that caught it.
