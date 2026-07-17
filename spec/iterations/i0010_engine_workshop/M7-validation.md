# M7 — Validate & accept (i0010_engine_workshop)

## Meets the need  → i10-m7-meets-need

Validated against the Ch1 criteria, each demonstrated for real where the criterion is live today:

- 1. **Cached status ≤ 1s** — measured live twice: 0.21s and 0.19s (from ~7s). ✅
- 2. **Battery announces re-runs** — observed live on every rebuild this session ("verification: cache miss — re-running tests…"); cached runs silent. ✅
- 3. **why names rule + delta** — probed live on `i9-m6-tests-red-observed`: names `coverage:tests-red` and the two restated tests. The "fresh — nothing changed" answer is dead for derived checks. ✅
- 4. **notes visible** — `quack notes` listed the live inbox (6 notes, ages, first lines). ✅
- 5. **Redacted call log** — live `calls.jsonl` lines carry cmd/ms/exit/channel; `--key` values appear only as REDACTED. ✅
- 6. **Mint clean** — dedupe + `--rationale` selftests green. ✅
- 7. **Modern scaffold drives from inside** — a real emitted vehicle (temp) ran `status` through its own launcher; project.toml + stamp + pointer chain asserted; no `.quack`. ✅
- 8. **No backward ratchet** — the fresh-clone fixture refuses the backward rebuild and ratchets forward. ✅
- 9. **Merged pager** — demonstrated via the selftest's rendered pager (combined header + "y = both" question). HONESTY NOTE: no live walk situation produced the merge this iteration (this iteration's killers sit FIRST in their milestones); the first live demonstration lands whenever a milestone's killer ripens last. ✅ (mechanism), ⏳ (live sighting)
- 10. **"user" everywhere** — the sweep selftest guards every prose surface against the word outside the frozen tokens; the walk's own output now says "GATE (user-adjudicated)". ✅

**Against all needs of every iteration:** the board holds — i3–i7 fully green including their backward-cumulative verification. i8/i9 green except the recorded geronticide debt (tests-red on two restated tests — visible red, adjudicated as accepted debt). No old need regressed: every earlier iteration's tests still pass under the new engine (the cache re-ran them all at this build identity).

## Killer use-cases demonstrated end-to-end  → i10-m7-killer-ucs-demonstrated

The three killer-marked flows exercised for real, not merely tests-green:

- the fast board (timed at the console)
- the modern scaffold roundtrip (an actual vehicle emitted and driven from inside)
- the honest red-observation (the tool REFUSED a green test live — that refusal is what exposed and fixed the fabrication defect)

## Acceptance obtained  → i10-m7-acceptance-obtained

The adjudicator has been at every gate of this walk: M1–M6 blessed at pagers with recorded actors; the mid-walk rulings (ledger repair + defect fixes + retro-bound log retention + green done-counts) were each explicitly authorized in-session. The sign-off referent is the bless trail in `spec/ledger/attest.json`.

## Validation gaps (RAID)  → i10-m7-validation-gaps

- **Gap:** merged pager has no live sighting yet (mechanism selftested). Watch at the next milestone where a killer ripens last.
- **Gap:** retro-time deletion of calls.jsonl runs first at the NEXT retro — the method line exists, the act hasn't happened yet.
- **Debt (recorded):** i9 tests-red red on two restated tests — geronticide list.
- **Risk (accepted at M5):** wall-clock ordering of build stamps.

## Milestone review  → i10-m7-gate

**Round 1 — verify.** Every Ch1 criterion has a demonstration referent above — live measurements, live probes or a fixture that reproduces the failure mode before proving the fix. Nothing rests on "tests green" alone except where the honesty note says so explicitly.

**Round 2 — validate.** The original need:

- speed
- self-explanation
- visibility
- honest vehicles
- less ceremony
- right wording

Each maps to a demonstrated criterion. The backward-cumulative check holds: no earlier iteration's need regressed under the new engine.

**Round 3 — red-team.** Weakest claim: the merged pager's live absence — could hide an integration bug the synthetic test misses. Mitigation: the synthetic test renders through the REAL HandoverPager path (same function the CLI calls), and the gap is recorded as a watch item rather than waved away. Second probe: "acceptance = bless trail" could be circular — answered: the trail records actor + hash per gate, which is exactly what acceptance means in this method.

**Verdict: PASS** — proceed to bless. No reopened checks.
