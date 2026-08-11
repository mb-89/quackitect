---
id: raid-asm-remote-serializes-claims
type: "[[raid]]"
kind: assumption
statement: The git remote serializes pushes, so a claim's first-push-wins race is a real lock.
owner: the driving agent
trigger: a claim push succeeds on two machines for the same iteration, or the remote's policy allows force pushes on the claims branch
status: open
impact: If the remote does not serialize - no network at claim time, or a force-push policy on the claims branch - two machines can hold the same iteration and duplicate a day of work.
breaks_how_badly: corrosive
how_likely: rare
---

## Probe

Two clients push a claim for the same iteration name to the same remote
within seconds; exactly one push is accepted and the other is rejected
with a non-fast-forward error. Run once against origin during the i2
build, before the mechanism is called done.
