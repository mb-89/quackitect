---
form: gate-implementation
amended: "2026-08-14T18:38:00.027Z by agent — two red-team findings were struck by the owner on the record; the tsserver comparison was misapplied and the worktree one conflated two layers"
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
- missing: THE SEPARATION, not the roles. `se-mcp.ts` builds one `Session` and one server — no `Core`, `Satellite` or `Channel` is ever constructed. But BOTH JOBS ALREADY HAPPEN in that one process: it owns trunk, the ledgers and the routing, and it runs the bound record's walk. Core-and-satellite as a division of labour is live and fused. `core.ts`, `satellite.ts` and `channel.ts` are that fused pair pulled apart into two processes, and THAT is what has no caller. REAP has no code at all.
- wrong: the self-hosting flag was built and reverted on evidence — it made four design specs invisible in one read, because the record's content stands on its branch and not on trunk. `project/product.md` says in its own text that nothing reads it yet.
- out of scope: SE-C-134's retirement and the `clear-jump` chunk were added mid-build on the owner's explicit word. The kickoff bless covered neither. THE PROCESS CHUNKS ARE NOT IN THIS CATEGORY — the owner confirmed on 2026-08-14 that pulling them ahead was a conscious decision.
- prior art: COMPARED, on three shapes, each cited to a primary source — AND THE SEARCH HAPPENED AT THE GATE RATHER THAN AT M4, which is a finding in itself. THE DELTA vs OVERLAYFS (kernel.org/doc/Documentation/filesystems/overlayfs.txt): overlayfs layers a writable upperdir over read-only lowerdirs, copies a file up on write, and MERGES directories where both hold one. It does more than ours — whiteouts for deletion, metadata-only copy-up, transparent so nothing opts in. Ours sheds the MERGE deliberately: one store or the other, never both, because a composed view nobody assembled is what `req-entry-levels-the-record-tree` forbids. THE PROCESS SPLIT vs LSP AND TSSERVER: the multi-server LSP pattern runs one server per workspace folder for state isolation, which is our satellite, and it is shipped and proven. tsserver takes the opposite road — one process, many projects, sharing a DocumentRegistry so a file is parsed once. ITS SHARING MOSTLY DOES NOT TRANSFER, and the owner corrected me on this: tsserver shares PARSE RESULTS, which carry no meaning, while our reading credit is per-agent EVIDENCE. Sharing that would credit one agent for what another read, and the proof would stop proving anything — the two hands already keep separate ledgers. The narrow part that does transfer is parsing the corpus for rendering and checks, which is performance with no semantics. THE SEAM vs GIT WORKTREE (git-scm.com/docs/git-worktree): git answers the same question by category plus a short exception list — `refs/bisect`, `refs/worktree`, `refs/rewritten` — which is our `pathKind` plus `METHOD_PREFIXES`. TWO LAYERS, AND I CONFLATED THEM: we DO use git worktrees, and this record is bound to one. Git enforces its shared-versus-per-tree split inside `.git`; ours is a rule about which tree a PATH resolves to, layered on top of the worktrees git gives us. What ours adds is that the answer NAMES its store, so a wrong resolution shows at the call rather than at a merge.

## round_2_red_team

- KILL-CRITERION: if the core-and-satellite design proves wrong once a real process is stood up, three chunks of tested code become three chunks of tested WRONG code => STILL STANDING. I looked for it and cannot rule it out. tsserver is a live counter-design: one process, many projects. `raid-asm-machine-wide-state-serves-over-a-local-channel` carries the assumption and is probed only for the call log.
- The battery being green proves the build is correct => It does not. It proves nothing REGRESSED. Four of ten claims are observed and six are owed, and a battery cannot watch a demonstration.
- The verifier was the builder, which the discipline forbids => True and unavoidable here; `note-eccbfe7cd689` records thirty-four spawned verifiers, every one refused before reading a line. AND I OVER-USED IT: nine of ten claims were owed on that rule, four were doable, and doing them found a committed trace node carrying an account name. Owing them would have hidden it.
- The stop hook was reported fixed by the last session and was not => Confirmed and fixed. It sat one directory above the workspace, so no session ever loaded it. It has bitten this session repeatedly since. `tests/cage.test.ts` fails if any shipped hook is missing from the template RUNME installs.
- STRUCK BY THE OWNER, 2026-08-14: "this record should have stopped after the seam" => The pull-ahead was a CONSCIOUS DECISION, not scope drifting. An attack on a decision the owner made deliberately is not a finding, and I am not carrying it as one.
- STRUCK BY THE OWNER, 2026-08-14: "retiring SE-C-134 left the shell hole open" => The hole was ALWAYS there and the retirement neither opened nor widened it. M4's own prior-art record said so before any change this record made: "it is the hole SE-C-134 already has, where five write verbs are guarded and se_run is not." It is also not obviously avoidable and is sometimes wanted — a shell that could not reach outside would stop being a shell. It stays a registered standing property rather than a finding against this work.

## raid_additions

- raid-iss-the-autonomy-number-still-rides-every-answer
- raid-iss-whole-product-claims-reverified-by-every-record
- raid-iss-outward-search-runs-before-the-architecture-is-chosen

## verdict

pass with overrides — The build is complete, the tree is green at 1271 of 1271, and the goal is delivered and demonstrated in production rather than in a fixture. ONE OVERRIDE REMAINS, down from three. SIX OF TEN VERIFICATION CLAIMS ARE OWED: five need a person, the editor panel or a fresh machine, and one is red with its fix begun. `raid-iss-whole-product-claims-reverified-by-every-record` says why serving every record the whole product's claims is itself a defect. TWO OVERRIDES ARE WITHDRAWN BECAUSE THE WORK WAS DONE: prior art is compared on three shapes against overlayfs, the LSP and tsserver patterns, and git worktree, and the autonomy number has left the agent's packet. THE SCOPE OVERRIDE IS STRUCK BY THE OWNER — pulling the process chunks ahead was a conscious decision, and the SE-C-134 retirement was theirs to order. WHAT A BLESS ACCEPTS is a core-and-satellite whose two roles run FUSED IN ONE PROCESS, with the code that would split them tested and unstarted; a numeric autonomy still on the panel and in the weighing until i14; and one new finding, that the outward search runs before the architecture is chosen, so any shape decided after it reaches the build uncompared.

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
