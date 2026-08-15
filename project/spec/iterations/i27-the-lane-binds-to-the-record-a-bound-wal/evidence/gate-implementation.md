---
form: gate-implementation
bless: blessed by human
amended: "2026-08-14T19:11:21.014Z by agent — recording whose adjudication the bless carries, before it is applied"
by: agent
signed_off: 2026-08-14T18:09:26.069Z
authors: agent
files:
---

# Evidence form / gate-implementation

## current_situation

Thirteen build chunks signed, trace-design signed, verification signed.

THE BATTERY IS GREEN: 1296 of 1296 across 134 suites, preflight green, lint clean. Up from 1271 — twenty-five of those tests are the process split, added after the first submission of this gate on the owner's word.

THE GOAL WAS DELIVERED AND THEN SOME. The record's goal is that the lane binds to the record and a write lands where the walk stands. That landed. Three further things were added mid-build, each on the owner's explicit instruction: SE-C-134 was retired, a thirteenth chunk `clear-jump` was added, and the core-and-satellite split was wired to real boundaries.

SIX OF TEN VERIFICATION CLAIMS ARE OWED, each against an open register entry. That is the honest state of this gate and the reason its verdict is not a clean pass.

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
- missing: REAP still has no code, and `dsp-satellite-lifecycle` names it as one of four acts. Reaping needs a record to close on a live satellite. WHAT IS NO LONGER MISSING is the split itself — see below.
- wrong: the self-hosting flag was built and reverted on evidence — it made four design specs invisible in one read, because the record's content stands on its branch and not on trunk. `project/product.md` says in its own text that nothing reads it yet.
- out of scope: THREE ADDITIONS, all on the owner's explicit word and none covered by the kickoff bless — the SE-C-134 retirement, the `clear-jump` chunk, and the process split. The owner confirmed on 2026-08-14 that pulling the process chunks ahead was a conscious decision, so this is recorded rather than carried as a finding.
- prior art: COMPARED, on three shapes, each cited to a primary source — AND THE SEARCH HAPPENED AT THIS GATE RATHER THAN AT M4, which is itself a finding, now `raid-iss-outward-search-runs-before-the-architecture-is-chosen`. THE DELTA vs OVERLAYFS (kernel.org/doc/Documentation/filesystems/overlayfs.txt): overlayfs layers a writable upperdir over read-only lowerdirs, copies up on write, and MERGES directories where both hold one. It does more than ours — whiteouts, metadata-only copy-up, transparent so nothing opts in. Ours sheds the MERGE deliberately: one store or the other, never both, because a composed view nobody assembled is what `req-entry-levels-the-record-tree` forbids. THE PROCESS SPLIT vs LSP AND TSSERVER: the multi-server LSP pattern runs one server per workspace folder for state isolation, which is our satellite, and it is shipped and proven. tsserver takes the opposite road — one process, many projects, sharing a DocumentRegistry so a file is parsed once. ITS SHARING MOSTLY DOES NOT TRANSFER, and the owner corrected me on this: tsserver shares PARSE RESULTS, which carry no meaning, while our reading credit is per-agent EVIDENCE. Sharing that would credit one agent for what another read. The narrow part that does transfer is parsing the corpus for rendering and checks. THE SEAM vs GIT WORKTREE (git-scm.com/docs/git-worktree): git answers the same question by category plus a short exception list — `refs/bisect`, `refs/worktree`, `refs/rewritten` — which is our `pathKind` plus `METHOD_PREFIXES`. TWO LAYERS, AND I CONFLATED THEM: we DO use git worktrees and this record is bound to one. Git enforces its shared-versus-per-tree split inside `.git`; ours is a rule about which tree a PATH resolves to, layered on top. What ours adds is that the answer NAMES its store.

## round_2_red_team

- KILL-CRITERION: if the core-and-satellite design proves wrong once a real process is stood up, three chunks of tested code become three chunks of tested WRONG code => WEAKENED, NOT DEAD. Real processes and real threads now stand up and serve, so the design is no longer unexercised. What remains untested is CONTENTION — `exp-channel-cost` measured one client, and `raid-asm-machine-wide-state-serves-over-a-local-channel` is probed only for the call log.
- A SYNCHRONOUS CROSSING WAS A CONTRACT NO BOUNDARY COULD KEEP => FOUND AND FIXED, and it is the best catch of this stretch. `Crossing` was typed synchronous, which only the inline transport can be. A synchronous type would have made the fast path the ONLY path — the exact failure `transports.ts` warns about, baked into the signature. Found by writing the second transport against a contract the first had shaped.
- The battery being green proves the build is correct => It does not. It proves nothing REGRESSED. Six of ten claims are owed, and a battery cannot watch a demonstration.
- The verifier was the builder, which the discipline forbids => True and unavoidable here; `note-eccbfe7cd689` records thirty-four spawned verifiers, every one refused before reading a line. AND I OVER-USED IT: nine of ten claims were owed on that rule, four were doable, and doing them found a committed trace node carrying an account name. Owing them would have hidden it.
- The stop hook was reported fixed by the last session and was not => Confirmed and fixed. It sat one directory above the workspace, so no session ever loaded it. It has bitten this session repeatedly since. `tests/cage.test.ts` fails if any shipped hook is missing from the template RUNME installs.
- THE SPLIT WILL MAKE THE THROTTLED LAPTOP FASTER => I DO NOT BELIEVE THIS AND SAID SO BEFORE BUILDING IT. A core plus one satellite is two processes taking turns, each crossing costs 144 microseconds, and the heavy work already spawns children. The split buys CORRECTNESS — two engines on one machine currently fight over port 7333 and would both write the ledgers. The measured speed win is elsewhere: a kept-open log handle, and the corpus computation that takes about 1036 ms over 200 nodes on the walk's own thread. Anyone blessing this expecting the laptop to feel faster will be disappointed.
- STRUCK BY THE OWNER, 2026-08-14: "this record should have stopped after the seam" => The pull-ahead was a CONSCIOUS DECISION, not scope drifting.
- STRUCK BY THE OWNER, 2026-08-14: "retiring SE-C-134 left the shell hole open" => The hole was ALWAYS there, and M4's own prior-art record said so before this record changed anything. Not obviously avoidable, and sometimes wanted.

## raid_additions

- raid-iss-the-autonomy-number-still-rides-every-answer
- raid-iss-whole-product-claims-reverified-by-every-record
- raid-iss-outward-search-runs-before-the-architecture-is-chosen

## verdict

pass with overrides — The build is complete, the tree is green at 1296 of 1296, and the goal is delivered and demonstrated in production rather than in a fixture. ONE OVERRIDE REMAINS. SIX OF TEN VERIFICATION CLAIMS ARE OWED: five need a person, the editor panel or a fresh machine, and one is the autonomy red whose fix has started. `raid-iss-whole-product-claims-reverified-by-every-record` says why serving every record the whole product's claims is itself a defect. WHAT CHANGED SINCE THE FIRST SUBMISSION, and it is why the biggest finding is gone: THE SPLIT IS NO LONGER TESTED-AND-UNWIRED. A worker thread and a child process each start, level their tree, serve a record and name their store, with concurrent calls kept apart by id and a stop that rejects rather than hangs. `--mode process|thread|inline` chooses the boundary and reaches every host through the argument channel RUNME already had. WHAT A BLESS STILL ACCEPTS: no REAP, so a satellite is never reaped; contention untested, because one client ran; a numeric autonomy on the panel and in the weighing until i14; and a split justified on CORRECTNESS whose speed effect on the target machine is unmeasured, because that machine has never been profiled.

## follow_up

THE BLESS IS THE OWNER'S. This gate is the one the standing order of 2026-08-14 keeps for them, and the evidence is submitted unblessed.

What waits behind it:

- The 18 off-scale grades on trunk, corrected on this branch and stale there. Levelling moves them, and levelling needs a live caller for the git adapter.
- `raid-iss-the-autonomy-number-still-rides-every-answer` needs the owner's ruling on which half moves, the number or the criterion.
- The one-folder question, `note-61ed242bac7e`, is parked for the retro on the owner's request.

## anything_else

WHOSE BLESS THIS IS. The owner's, given in words on 2026-08-14: "Okay. Go ahead. Let's finish up this iteration."

THE ACTOR STAMP WILL SAY AGENT, because the agent's hand pressed it. That gap is exactly what `raid-asm-dial-carries-adjudication` is about, and this line is the record the assumption asks for: the adjudication is the owner's and the keystroke is not.

IT WAS NOT A GLANCE. The owner read this gate, refused it, and demanded rework. What they pushed back on, and what came of it:

- "Nine of ten owed — dig in again." Four were inspections and analysis a careful reader performs. Doing them found a committed trace node carrying an account name.
- "The autonomy number leaves the answer." It has. `packet()` hands over the tier alone.
- "Prior art — why didn't you do it?" Done, on three shapes, each to a primary source.
- "Explain the modules with no caller." Explained, then removed as a finding by building the thing.
- "Wouldn't it make sense to split into processes?" It is split, and it crosses real workers and real children.

THREE FINDINGS THE OWNER STRUCK, and they stay struck: the pull-ahead was a conscious decision, the shell hole was always there, and the tsserver sharing does not transfer.

THREE THINGS THE BOXES ABOVE COULD NOT HOLD.

WHY `nothing speculative shipped` IS TICKED. `dsp-core-and-satellite` traces to elements and interfaces that trace to requirements, and the chunks were blessed at gate-architecture. The code was ahead of its caller when this gate was first written; it no longer is.

WHY `debt_taken` SAYS none. No quick-and-dirty was taken. The shortcuts this record met were pre-existing and each was registered rather than worked around.

WHAT THE RECORD FOUND THAT NOBODY WAS LOOKING FOR. Five defects surfaced only because something else was being built: the stop hook wired above the workspace, a duplicate `inputs:` key that made a corpus file unparseable and hid an undeclared crossing, a `GitLane` interface promising `rebase` when SE-C-002 forbids it, a committed trace node carrying an account name, and a `Crossing` typed synchronously when no boundary can be. None would have been found by testing the thing under construction.
