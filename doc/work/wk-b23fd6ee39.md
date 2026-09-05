---
kind: [[work-token]]
process: [[trivial]]
guidance: [[work-token]]
title: cage check follows queue
status: closed
author: main
began:
  - 71f2c73ef284bb3dc67e1fe36144fb868bc3f603
ended:
  - 2c3a5849cf7468b4083d6646864448b0292da319
disposition: dropped
reason: "The test it repairs is gone from the tree. Today's stop tests drive fixture roots, so the flake it describes has no instance left."
---

## detail

TestEveryHookTheCageDeclaresRunsHere in src/engine/cage_test.go goes red whenever a stop claim stands in .se/stop-claim.json for the actor the hook resolves to. Run: `go test -C src/engine -count=1 -run TestEveryHookTheCageDeclaresRunsHere$ .`. The test fires a Stop event and requires the word sanctioned in the answer, but decideStop in src/engine/hook.go:743 returns silently when StandingClaim finds a claim. Fix: give the hook run a session id that owns no claim, or drive it against a fixture root the test sets up. Then run the suite once with a claim standing and once with .se/stop-claim.json empty and require the same answer both times.

## done when

- go test -run TestEveryHookTheCageDeclaresRunsHere$ passes with a claim standing and with it empty.
- The hook run owns no claim: fresh session id or fixture root.

