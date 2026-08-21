---
form: gate-release
bless: blessed by agent
by: agent
signed_off: 2026-08-21T00:19:07.550Z
authors: agent
files:
---

# Evidence form / gate-release

## current_situation

THE PACKAGE STANDS, WAS USED, AND THE PRODUCT RUNS OUT OF IT. `dist/quackitect-7.0.0.zip`, 3,101,755 bytes, expanded, dependency-installed, started against its own root and walked to the front desk.

WHAT SHIPS. A step can declare how strong a hand its work needs, and the machine publishes what it reads — a rung and the two figures behind it — and starts nothing. Every lane call records which hand made it, in which state, on which model, with the two the machine cannot see marked as claims.

WHAT CHANGED SINCE gate-validation SIGNED. That gate's last override said no live evidence for the three coordinates existed, because the running lane server predated the build. It does not predate it any more: the server has been restarted onto this tree, and the log now carries 929 records with all three fields on them.

### One repair landed after that gate, and the walk found it rather than a check

A CLAIM SENT BACK ON A STATE THAT RUNS A SUB-MACHINE COULD NOT BE RE-EARNED. The state's form is served only while its sub-machine is unseeded; once the walk is inside, the lookup reads the leaf, and a sub's start, end and join never sign. Leaving the sub needs the claim the form would make.

SO THE WALK DEAD-ENDED FOR GOOD AT `run-demos/end`, and the blocker's own remedy is what put it there. It is fixed in three places — the state, the machine that declares it, and the guard that says where a form may be stamped — designed on `dsp-walk-machine.md` and guarded by `tests/reopen-past-a-sub.test.ts`.

### What the comparison against running systems says, in full

WHAT THE OTHERS DO BETTER, first. Cursor's router computes a continuous complexity score from a predictor trained on live traffic, labelled by whether the user proceeded or corrected — it learns from outcomes and we do not learn at all.

AWS Bedrock Intelligent Prompt Routing predicts per-request response quality against a tunable threshold, so its operator gets a dial where ours gets a fixed table. OpenRouter's auto router ranks on a rolling spend index, so cost is in the decision; ours has no idea what anything costs.

LITELLM'S TAG ROUTING IS THE CLOSEST SHAPE TO OURS and has the two parts we lack: a default pool and an explicit fail-open switch, so a no-match is a configured condition rather than an unplanned one.

WHAT OURS SHEDS. The declaration is authored and auditable rather than predicted, so a person can disagree with it in the file where it lives. It is per-step rather than per-request, so the same work gets the same answer twice — a property none of the predictors have. And it publishes rather than dispatches, so nothing can be silently switched underneath a walk.

ONE PIECE OF PRIOR ART IS EVIDENCE AGAINST US rather than for any option, and it stays on the record: a model alias already resolves to different models on different providers, so one byte-identical table does not produce one behaviour.

### The steelman, argued before this gate's attack

THIS RELEASE SHOULD NOT SHIP, and its best advocate would say the headline feature is dark. Nothing in the shipped matrix is rated, so on a real machine every step publishes nothing at all.

WHAT A BUYER GETS IS A MECHANISM, A REFUSAL AND A VOCABULARY. The observable behaviour is identical to 6.0.0 for every step anybody will actually walk, and a major version for a feature that produces no output on any real input is a version number doing the work the product did not.

THAT CASE IS STRONG AND IT IS NOT DECISIVE. The mechanism is what the next act needs, and a rating cannot precede it. The attribution half is not cosmetic either: 929 records now answer a question the log could not answer before.

## market_block


## round_0_verify

- evidence vs claims: opened rather than trusted — the battery output was read, .se/calls.jsonl was counted directly (929 records, 843 walker / 74 surface / 12 owner, answered_by unreported on all 929), and the package was started against its own root rather than inspected; the one claim I did NOT open is that nothing in the lane starts a process on a published rung, which is an absence proven by looking.
- types: green — tsc -p . clean over the whole tree after every repair in this milestone, including the three-part re-sign-cascade fix.
- lint: green — the lane's write guard ran the linter on every patched file and reported its own safe fixes; no file was written past a red.
- tests: green — 1,657 tests, 148 suites, exit 0, fired by verification's OWN exit script and not by me; it ran three times through this milestone and the walk only left verification on the green one, after ten cases red-flagged an over-wide first draft of the cascade repair.

## round_1_validate

- exercised against the goal: yes for the saying half and no for the doing half — a step names the hand it needs, live on the pull, demonstrated end to end at run-demos; whether a weaker hand then delegates is obedience and nothing here compels it, which is the declared design.
- missing: the rating itself — 153 of 154 cells carry no complexity, so the mechanism is observable in a fixture and dark in the shipped product; also missing is any datum from a second hand, since no live record carries part=guide.
- wrong: nothing found wrong in what shipped, and two kill-criteria were run at it — a rated cell producing a rung a reader would reject, and the same step sizing differently twice; the repeat is held by tests/sizing-repeats.test.ts and the corner rule publishes the pair beside the rung so a reader can disagree with the rung and still use the input.
- out of scope: rating the matrix, the milestone maximum's consumer, a percentile for the one-second bound, and the installer's Windows path — each named on the record with the milestone or record that owns it rather than dropped.
- prior art: compared, not cited — Cursor, AWS Bedrock Intelligent Prompt Routing, OpenRouter and LiteLLM tag routing on the computed-at-dispatch side, Claude Code subagents and the OpenAI Agents SDK on the declared side, with what each does better stated first in current_situation; the comparison's own limit is that ours derives its declaration from a rated matrix and nothing is rated, so the novelty is unproven.

## goals_served

- Every state in the rigor matrix carries a complexity rating on a five-rung ladder (C0 derive, C1 transcribe-or-rule, C2 apply, C3 author, C4 frame), each rated with evidence rather than asserted.: NOT SERVED, knowingly — the mechanism to declare, refuse, compile and publish a rating stands (req-every-matrix-row-declares-its-complexity, engine/rigor-matrix.ts, tests/sizing-live-read.test.ts) and exactly one cell is rated by hand for the demonstration; the other 153 are debt under raid-debt-the-load-time-complexity-refusal-is-off-until-the-matrix-is-rated.
- ONE fixed model list lives in the repo, identical on every host, mapping each rung to a model name.: NOT SERVED, and REVERSED ON PURPOSE — opt-the-block-names-a-rung-and-never-a-model won the comparison and req-the-machine-names-a-driver-and-starts-nothing is what shipped, so the goal was decided against on the record rather than quietly dropped; prior art agreed, since a model alias already resolves differently per provider.
- Each milestone names the driver it needs before it is walked, computed live from the matrix and never pinned into a record's demands.: SERVED PER STEP rather than per milestone — engine/sizing.ts and session.ts strengthNeeded publish a rung and its pair on every pull, never pinned into a demand ledger (tests/sizing-block.test.ts, tests/sizing-on-the-pull.test.ts, tests/complexity-stays-out-of-the-ledger), demonstrated by sty-the-machine-picks-the-hands.
- Every call in the lane records which model actually answered it, so a walk can be attributed after the fact.: MECHANISM SERVED, DATA ABSENT — req-every-call-records-the-model-that-answered-it, engine/calllog.ts and tests/call-attribution.test.ts; all 929 live records read unreported because nothing in any host self-reports its model, which is a declared absence rather than a missing field.
- A submachine takes the MAXIMUM complexity over its items, so one walker strong enough for the hardest item walks all of them and a fan-out never becomes a fleet.: SERVED AND CALLED BY NOTHING — sizeUnit in engine/sizing.ts with tests/sizing-repeats.test.ts, unreachable in the shipped product because the declared design publishes per state.

## bound_breaches

- if-agent-harness-to-entrypoint: BREACHED AND MEASURED THROUGH THE LANE OWN LOG — 880 of 10,328 timed records exceeded the one-second bound, 8.5 per cent; 445 of those are mirror_slow, which is a record OF a slow request rather than a lane call, so excluding it gives 435 of 9,883 or 4.4 per cent, and both figures are stated because which one is honest depends on a question nobody has settled. The breach is concentrated in the pull: se_pull is 406 of the 880 and 26.3 per cent of all 1,544 pulls, while se_aim is 13, se_run 10, se_why 5 and se_web_fetch 1. THE DISPOSITION: the bound still carries no percentile for the sixth milestone running, an absolute over a distribution decides nothing, and it belongs to whichever record takes the bounds model — no milestone in this one owned it, and it is on the follow-up.

## round_2_red_team

- the headline feature is dark: TRUE AND ACCEPTED => one cell of 154 is rated, so nearly every step publishes nothing on a real machine; the mechanism is what the next act needs and a rating cannot precede it, so it ships as an override with the dissent logged rather than smoothed.
- the published rung could be WRONG rather than merely absent => kill-criterion run and it did not fire; tests/sizing-repeats.test.ts holds the repeat, and the corner rule takes the higher of the two figures with the pair published beside the rung so a reader can disagree with the rung and still use the input.
- the lane might START something on a published rung => kill-criterion run at verification over every path and nothing spawns, switches or names a model; this is the check I trust least, because an absence is proven by looking rather than by failing.
- as and answered_by are claims wearing an observation's clothes => marked rather than dressed up — every record carries claimed: [answered_by, part]; nothing better is available while one dispatcher serves every agent, and a field that reads like an observation and is a claim is worse than an empty one.
- no live record carries part=guide => TRUE AND UNRESOLVED; the coordinate this record was reopened to build has never been exercised by a second hand, so its first real datum is owed to a walk that actually delegates.
- the re-sign cascade can route a walk into a state it cannot leave => FIXED FOR THIS CASE, CLASS OPEN; the blocker's own remedy is what dead-ended this walk, and nothing checks that a remedy the engine offers is one the engine can then serve.
- a fresh package's first boot is red => TRUE, RECOVERABLE, NOT FIXED HERE; preflight refuses on two generated skill files that the archive excludes by design and that RUNME.ps1 never places — one named step recovers it and the installer should take that step.
- the version number does the work the product did not => THE DISSENT, LOGGED; a major bump for a feature with no output on any real input is the honest reading of what a person installing 7.0.0 will see, and the ruling overrides it rather than denying it.

## raid_additions

- raid-debt-the-load-time-complexity-refusal-is-off-until-the-matrix-is-rated

## verdict

pass with overrides — the package stands, the product runs out of it, and every override is one this record already named rather than one this gate is discovering.

WHAT IS ACCEPTED. A machine that says how strong a hand a step needs and starts nothing, demonstrated end to end. A log that can tell a walker's work from a guide's, live, with 929 records already carrying it. And a repair to the re-sign cascade that the walk itself found by dead-ending on it.

THE OVERRIDES.

- THE HEADLINE FEATURE IS DARK IN THE SHIPPED PRODUCT. One cell of 154 is rated, so nearly every step publishes nothing.
- TWO OF THE FIVE BLESSED GOALS ARE NOT SERVED. One is debt; one was deliberately reversed by the record's own comparison.
- `answered_by` IS `unreported` ON EVERY LIVE RECORD, because no host self-reports its model.
- NO RECORD CARRIES `guide`. The split this record was reopened to build has no datum from a second hand.
- A FRESH PACKAGE'S FIRST BOOT IS RED, on two generated skill files nothing places.
- THE ONE-SECOND BOUND IS BREACHED AND STILL HAS NO PERCENTILE, for the sixth milestone running.
- THE MILESTONE MAXIMUM IS BUILT AND CALLED BY NOTHING.
- THE MATRIX CACHE CAN SERVE A STALE ANSWER after an mtime-preserving restore.
- THE INSTALLER WAS NEVER RUN. No PowerShell on this box, so the archive's Windows install path is unchecked for 7.0.0.

THE DISSENT, LOGGED RATHER THAN SMOOTHED. The steelman in current_situation is the dissent: a major version for a feature that produces no output on any real input. The ruling overrides it because the rating cannot precede the mechanism, and because the attribution half ships with data behind it.

## follow_up

- RATE THE MATRIX. 153 cells, and until they are rated the sizing half is a mechanism nobody can observe. This is the single act that turns this release from a capability into a behaviour.

- MAKE THE INSTALLER PLACE THE PROMPT LAYER. One call to `engine/bin/place-prompt-layer.ts` in `RUNME.ps1`, and a fresh package's first boot stops being red.

- RUN THE INSTALLER ON WINDOWS against this archive before anyone claims the install path works for 7.0.0.

- GIVE `verification` THE REPAIR TOOLS WHILE ITS OWN CHECK STANDS RED. Its exit script is the battery and its tools are read-only, so a red battery cannot be fixed where it fires, and `fix-findings` sits behind that same exit. `boot/prepare_idle` already has this shape.

- CHECK THAT A REMEDY CAN BE SERVED. The cascade's remedy routed this walk into an unrecoverable state. The sub-machine case is fixed; nothing checks the class.

- EXERCISE THE GUIDE. The first walk with two hands is what turns `part` from a vocabulary into a measurement.

- GIVE THE ONE-SECOND BOUND A PERCENTILE, or stop measuring against it.

## anything_else

