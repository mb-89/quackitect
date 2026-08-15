---
minted_in: i2-parallel-iterations-across-machines-seed
id: raid-asm-remote-serializes-claims
type: "[[raid]]"
kind: assumption
statement: The git remote serializes pushes, so a claim's first-push-wins race is a real lock.
owner: the driving agent
trigger: a claim push succeeds on two machines for the same iteration, or the remote's policy allows force pushes on the claims branch
status: open
probed: "2026-08-12"
probe: "holds locally, genuinely concurrent — the M7 race test (tests/claims.test.ts) pushes one claim name from two clients IN FLIGHT AT ONCE against a bare origin: exactly one lands, the loser rejects non-fast-forward and learns the holder. Still faked: the network and the hosted forge's receive layer; the trigger keeps watch for the first two-machine claim against the real remote."
impact: If the remote does not serialize - no network at claim time, or a force-push policy on the claims branch - two machines can hold the same iteration and duplicate a day of work.
breaks_how_badly: corrosive
how_likely: conceivable
---

## Probe

Two clients push a claim for the same iteration name to the same remote
within seconds; exactly one push is accepted and the other is rejected
with a non-fast-forward error. Run once against origin during the i2
build, before the mechanism is called done.

MEASURED 2026-08-11 (local half): two clones raced the same claims/i3.md
into a local bare repo - push A landed, push B rejected non-fast-forward
("the remote contains work that you do not have locally... another
repository pushing to the same ref"). Git's receive machinery serializes
ref updates by construction. FAKED: the network and github's receive
layer - the origin half of the probe stays owed at M7.

MEASURED 2026-08-12 (M7, concurrent): tests/claims.test.ts races two
pushes IN FLIGHT AT ONCE for one claim name; exactly one lands, the
loser's announce reports the holder and reconciles. 7 of 7 cases green
on the shipped claim module (engine/claims.ts). Still faked: the hosted
forge's receive layer - the trigger stands for the first real-remote
collision.

## Retro sweep 2026-08-13

Not advanced by the second-machine run. The claim lane was never reached:
the iteration was pulled in through the new itAdopt path (a checkout, not
a claim push), so no real-remote collision happened and the trigger did
not fire. Status stays open, unchanged from the 2026-08-12 measurement.
Worth a related question for a future retro: itAdopt mints nothing and
races nobody today (two machines adopting the same branch both just get a
worktree), but if it ever gains a write path, it will want the same
first-push-wins scrutiny this entry gives claims. See the i8 field-report
§3.
