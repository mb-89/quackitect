---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: refusal names dead session
# where the token stands. The process owns these values.
status: closed
# who did the work step, so the verdict is never theirs
author: worker-dvorak
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 15b01031813c17871d2226abe77c9074513c6612
  - 0c36a817dc66c1ce73e14a942812344d8286cb47
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 87c395eef42b0d0db7557c9bca208d57ea6a815d
  - 7422bd7369b93fa4aa2fd565e46baec855b448a0
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

From the verdict on wk-3b5205ef21. src/engine/gate.go:517, in ANameAnotherSessionHolds, picks the session that holds the named name with `a.Kind == "session" && id != session && a.Name == named && a.Gone.IsZero()`. It does not ask `a.Run == run`. Everywhere else in the tree a live agent is one whose run is this run: evidence.go:251 (aSessionName, one file over, deciding the same names), evidence.go:330 and evidence.go:336 all carry `a.Run == run` beside `a.Gone.IsZero()`. Gone is only set on SessionEnd, so a session killed without one keeps Kind session, Name main and a zero Gone forever.

The damage is in the refusal, which is the whole product of this guard. With a stale prior-run record under main, the loop iterates a map and breaks on the first match, so the message can say "main is the session s-old, which is working over this same folder" and name a session that is not here. The token this came from exists because an agent spent fifteen turns locked out; sending the next one to look at a dead session id is the same cost again. The refusal is never lost, only mis-attributed, because dropping the run filter can only match more records than the real holder.

Fix: filter the loop by the run the way aSessionName does, and prefer a deterministic pick over the first key the map hands back.

## done when

- ANameAnotherSessionHolds names only a session of this run: a prior-run session registered under main with a zero Gone is not the one the refusal names, and the live holder is: go test -C src/engine -run TestANameAnotherSessionHoldsIsRefused
- the two places that decide a session name agree on what live means, both asking Run and Gone together: go test -C src/engine -run TestTwoSessionsAreTwoActors

## evidence: step 1. ask

The ask is one loop in one function plus the case that drives it, small enough to review whole. Both done-when lines name a go test in src/engine and both were run. The basics exist: TheRunNow, the register's Run field, and the stale-run fixture pattern in registerrun_test.go.

## evidence: step 2. do

work-token.md read, and rule 12 put the case in before the fix. Red first: a stale session record under main, Run aaaaaaaaaa and a zero Gone, went in beside the live one, and TestANameAnotherSessionHoldsIsRefused failed on a refusal reading main is the session s-dead-of-an-earlier-run. Green after: TestANameAnotherSessionHoldsIsRefused ok in 16.5s and TestTwoSessionsAreTwoActors ok in 5.4s. The change is src/engine/gate.go and src/engine/sessionisanactor_test.go and nothing else: the loop now asks Run and Gone together, the way aSessionName already did, and takes the lowest id rather than the first key the map hands back. The other places asking whether an agent is live were read, and evidence.go 251, 330 and 336 already ask both, so gate.go was the only one out of step.

## note

The guard picked the session holding the named name with Gone alone. Gone is
written on SessionEnd and on nothing else, so a session killed without one keeps
its kind, its name and a zero Gone for ever, and the loop broke on whichever key
the map handed back first. The refusal is the whole product of this guard, so
what that cost was an agent sent to look at a session that is not here.

It now asks Run and Gone together, the way aSessionName one file over already
did, and takes the lowest id rather than the first key, so two live sessions
under one name cannot make the message change between two calls asking the same
thing. The refusal itself cannot be lost by this: dropping the run could only
ever match more records than the live holder, never fewer.

