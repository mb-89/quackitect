---
form: gate-implementation
bless: blessed by agent
by: agent
signed_off: 2026-08-12T14:20:49.974Z
authors: agent
files:
---

# Evidence form / gate-implementation

## current_situation

The b1–b10 build is landed on trunk and merged into the record tree. Verification signed green after one fresh-eyes tester round. This gate judges internal quality, debt and risk before M8.

## quality_ok

- [x] Dependencies stay layered
- [x] Every new element carries one stated responsibility
- [x] The linter and the complexity ceiling are clean, with no new suppression
- [x] Every new behavior carries its check, and the battery is green at rest
- [x] Nothing speculative shipped
- [x] What changed is findable
- [x] Every quick-and-dirty taken stands as a visible raid debt entry

## debt_taken

- raid-debt-delta-default-views

## risks_acceptable

acceptable — two named risks, both bounded:

- The tester's findings 6–9 are disturbed demonstrations, re-observed at run-demos before gate-validation. Until then the demo evidence is one round old.
- The submit path skips the state laws the route-side check runs (note-983b5e651e85). Noted as an engine lead for the retro; the route-side check still reports the gap.

## round_0_verify

- evidence vs claims: all ten claims checked on the verification table, each naming its test spec; the tester's nine findings adjudicated — 1–4 answered from raid-dec-autonomy-tier-ladder, 5 fixed, 6–9 re-observed at run-demos
- types: tsc runs blocking in the pre-commit and passed on commit 34f38784, the last engine change — the call log shows no engine write since 13:51
- lint: biome check --error-on-warnings runs blocking in the same pre-commit and passed on 34f38784; the only two biome-ignore comments sit in files this iteration never touched
- tests: the battery ran at the verification submit and signed green; se_test refuses an unchanged tree, which is the same fact standing

## round_1_validate

- exercised against the goal: the claim lane, the seed push and the entry gate deliver parallel iterations across machines; the concurrent race in claims.test.ts shows one machine winning and one refused; signing b8–b10 flowed through the fork live
- missing: the delta-default resolvers (raid-debt-delta-default-views); the six disturbed demonstrations, re-observed at run-demos
- wrong: nothing found against the frame this round
- out of scope: no scheduler and no peer discovery — the shared remote stays the only meeting point, per the frame
- prior art: not scanned at this gate — no web door is legal here and this form carries no state_of_the_art field; gate-validation holds that scan

## round_2_red_team

- two machines could hold the same iteration at once (the kill criterion) => looked for in claims.test.ts's concurrent race: one push wins, the loser is refused and rebuilds; the entry gate names the holder; not observed to fail
- a machine dies holding a claim and wedges the iteration => forceRelease writes a second commit carrying who and why; a released claim is reclaimable
- an offline machine cannot see claims and could double-enter => no claims branch means pool:false free entry, deliberate for solo use; the offline test pins the behavior
- the tier words could drift from their anchors while both stand => valueFor resolves words in one place; the ruling names the anchors transitional carriers
- the submit path signs over an unmet state law => noted as an engine lead (note-983b5e651e85), rides the retro; the route-side check still surfaces it

## raid_additions

- none

## verdict

pass — findings 6–9 are re-observed at run-demos before gate-validation, and the delta-default debt stands in the register with its trigger.

## follow_up

M8 next: fill-story-evidence, then run-demos re-observes the six disturbed demonstrations (tester findings 6–9), then gate-validation carries the state_of_the_art scan.

## anything_else

The iteration's standing register entries: raid-debt-delta-default-views (debt); probes appended to raid-asm-peer-runs-supported-platform and raid-asm-remote-serializes-claims.
