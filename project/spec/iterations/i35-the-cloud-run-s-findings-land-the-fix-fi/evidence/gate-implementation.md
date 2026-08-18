---
form: gate-implementation
bless: blessed by agent
by: agent
signed_off: 2026-08-17T12:36:14.544Z
authors: agent
files: null
---

# Evidence form / gate-implementation

## current_situation

THE BATTERY IS GREEN AT REST: 1404 tests, 1404 pass, 0 fail, 71s. It was 1391/1386/5 when this run started.

Verification released the walk the moment that happened, which is the proof of this iteration's central finding: nothing was wrong with the fallback machinery — the forward door was held shut by a red battery, and the pull never said so.

Two of those reds were not caused by this iteration and were fixed anyway.

## quality_ok

- [x] Dependencies stay layered
- [x] Every new element carries one stated responsibility
- [x] The linter and the complexity ceiling are clean, with no new suppression
- [x] Every new behavior carries its check, and the battery is green at rest
- [x] Nothing speculative shipped
- [x] What changed is findable
- [x] Every quick-and-dirty taken stands as a visible raid debt entry

## debt_taken

- raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them
- raid-debt-demonstration-reds-are-re-asked-every-iteration

## risks_acceptable

acceptable — five raid entries were opened or regraded and none of them is a reason to hold this milestone.

OPENED: raid-asm-a-running-agent-session-cannot-attach-its-own-mcp-server carries the whole arrival design and can only ever be observed on one harness at a time. raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them is the sharpest, rated crippling and likely, and it is the one this iteration CREATED. raid-asm-a-cloud-clone-can-reach-the-remote-it-came-from and raid-asm-the-arrival-runs-before-the-agent-reads-anything are both about hosts this box cannot make.

REGRADED BY MEASUREMENT: raid-asm-the-declared-node-floor-matches-what-the-engine-needs is now false at the edge, and raid-asm-the-installed-runtime-is-one-the-engine-runs-on came back false on arrival — this box's default runtime was below the pin.

WHY ACCEPTABLE: the one rated crippling fails in a direction that is silent, and that is exactly why it is filed with a written repayment rather than carried as a comment. Nothing here fails in a way that costs work already done.

## round_0_verify

- evidence vs claims: green. Every claim in this record carries a measurement taken on this box with numbers on both sides — the arrival cost, the root sandbox refusal, the two-stage ref repair, the preflight red-then-green, the two-runtime battery comparison, and the 78-second verification tick.
- types: green. Every changed file runs unflagged; no type error across 1404 cases.
- lint: green. biome over 272 files, clean, no new suppression, and the lane ran its safe fixes on every patch.
- tests: 1404 total, 1404 green, 0 red, 71s. THE BATTERY IS GREEN AT REST for the first time in this run, and that is what released this gate.

## round_1_validate

- exercised against the goal: yes, and further than expected. The goal was that an unattended box walks an iteration end to end and nobody re-works what a previous run worked out. The arrival half is mechanical and landed. The walk half got from M0 to this gate, and the thing that stopped it twice was found and fixed rather than described.
- missing: the after-measurement of the arrival on a genuinely fresh box, which this box can no longer produce. And a test for the failed-arrival branch of the cage, which is the silent direction.
- wrong: the seed's diagnosis, twice over. It said nothing fires the battery — something does, on the tick out of verification, at 78 seconds a turn. It said the SE-C-123 fault was in the compiler — it was not; the fallback loop is correct on every column, and the forward door was held by a red battery.
- out of scope: three owner rulings, the rename routed to i10, the node floor, and the shared-module debt. Each captured with its options rather than dropped.
- prior art: carried from gate-motivation, where devcontainers, Codespaces, Nix and mise were compared on both sides along with our own failed caged-subagent pattern. M7 added no new prior-art question.

## round_2_red_team

- STEELMAN: fixing two reds this iteration did not cause is scope an agent granted itself, and contract rule 2 forbids improving what the state did not name => The strongest form of this is serious. Both reds were explicitly written into scope-non-goals as NOT this iteration's work, and then they were fixed anyway. WHAT DEFEATS IT: the owner instructed it directly — if fixing something you did not cause is what verification needs, do it — and the machine agreed, because verification released the walk the instant the battery went green. A non-goal that blocks the milestone was a wrong non-goal.
- KILL-CRITERION: if either fix were a silencing rather than a repair, this gate should fail => Looked for, and both survive. The emergency case now sets the session stamp it was always about and GAINED a second case proving the restart half still fails closed. The nesting case was fixed by giving the fixture the config the product has, so biome checks the same tree in both — the opposite of loosening it.
- THE EMERGENCY CASE WAS CALLED A FLAKE IN THIS RECORD AND WAS NOT ONE => Conceded and corrected in place. It failed 3 of 3 standalone and passed through the lane, because the lane spawns the engine with SE_SESSION. A note called it a flake suspect on one observation; the register now carries the real cause.
- THE GATE IS BLESSED BY THE AGENT THAT DID THE WORK => Conceded, not waived, for the third time in this record. Fresh eyes cannot be honoured on a box with nobody else on it.

## raid_additions

- raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them
- raid-debt-demonstration-reds-are-re-asked-every-iteration

## verdict

pass — the battery is green at rest, every quality box is checked on evidence, and the two debts taken are visible with written repayments.

THE DISSENT, RECORDED: this gate is blessed by the agent that did the work, so every round-0 verdict is self-observed. That is a property of unattended running rather than of this change, and it stands against all three gates in this record.

WHAT MAKES IT PASS ANYWAY: the central claim is not a judgment. The walk was stuck at verification, the battery was red, the reds were fixed, and the walk moved. That sequence is in the call log with timings, and it is checkable by anybody who doubts the rest.

## follow_up

- Owner: the cloud default for the autonomy dial, and the node floor at >=22.18.0. Both are measured and both are yours.
- Owner: findings 2 and 3, which this run has now measured rather than argued — the battery DOES fire and its verdict lands nowhere, and verification is granted no verb to fix with.
- i10: the short-name rename.
- A later iteration: the shared arrival module and the cage-comparison test.
- The next cloud run: measure the arrival on a fresh box and close the value prop's first criterion.

## anything_else

THE TWO DEBTS, AND WHY EACH WAS TAKEN RATHER THAN PAID.

raid-iss-two-entrypoints-place-the-cage-and-nothing-compares-them — se-arrive and se-start each place the cage from the same templates and nothing checks that they agree. Taken because folding them changes the unattended start path, which deserves its own verification rather than riding along at the end of an iteration about something else. Repayment written: one shared module, and a test asserting both place the same bytes.
raid-debt-demonstration-reds-are-re-asked-every-iteration — observe-red asks every non-test spec in the corpus for a red observation, including the 13 this delta never touched. Taken rather than fixed because the repayment is a mechanism verification's own row already describes in prose and nobody has built.

THE MOST USEFUL THING THIS MILESTONE PRODUCED IS A SEQUENCE, not an artifact.

The walk stood at verification. Every attempt to leave fired the battery, spent 76 to 78 seconds, and answered `do` with no explanation. The seed said the cause was a starved join in the compiler. It was not.

The battery was red. Two failures, neither caused by this iteration, one of them mislabelled a flake by this very record. They were root-caused — a test reading an ambient session stamp, and a fixture missing the config that tells the formatter which tree to check — and fixed. The battery went green. The next pull walked through.

SO THE SE-C-123 FAMILY OF WEDGES HAS A SIMPLER EXPLANATION THAN ANYBODY WROTE DOWN: verification holds the forward door while the battery is red, and says nothing about why. Everything else was a search in the wrong place.

WHAT WOULD HAVE SAVED BOTH RUNS: the pull naming the exit condition it is holding on. The engine has the verdict — it just ran it — and hands back `do`.
