---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: stop claim, current name
# where the token stands. The process owns these values.
status: open
claimed_by: 547b9365/worker-fir
claimed_at: "2026-09-05T15:20:33Z"
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - ecc717debb5ea597eba9346bf49102d7638467c0
---

## detail

Found reviewing wk-c1d58b91d6 (stop claim knows names). src/engine/stop.go:176 now answers the first claim standing under any of everyNameOf(r, actor), and src/engine/gate.go:508 makes that the harness name followed by every name it has ever pulled with, appended by NoteTheNameItActsAs across the whole life of .se/actors.json. A harness name is a slot that is reused: .se/actors.json on this box holds general-purpose-1..5 and main, one name each today, and NoteTheNameItActsAs appends rather than replaces, so a slot that pulls under a second name in the same session carries both.

The damage that reaches: agent A pulls as worker-ash under general-purpose-1 and claims a stop, then the slot is handed to agent B, which pulls as worker-birch under the same harness name. StandingClaim(r, "general-purpose-1") walks the list in order and answers worker-ash's claim, which is of this session and unspent, so B's stop is granted on a reason B never named — the one thing guards.stop_needs_claim exists to refuse. SpendClaim at stop.go:200 walks the same list and deletes every name's claim, so B carrying on ends A's stop too, which is what the comment above it, "ONE ACTOR'S CLAIM IS SPENT AND THE REST STAND", was written to prevent.

theByName in gate.go:334 already answers this question the other way, taking names[len(names)-1] because the last name pulled with is the current one.

## proposed action

StandingClaim and SpendClaim resolve one name, not a list: the harness name and the name it currently pulls with, the last of TheNamesItPullsWith(r)[actor], the way theByName reads it. A claim under a name the slot pulled with earlier is another agent's and is neither found nor spent.

## done when

- a claim under a name the harness slot pulled with earlier does not grant a stop to the name it pulls with now, decided by: se test --propose 'TestAClaimUnderAnOlderNameGrantsNoStop' answers ok
- the claim under the name the slot pulls with now is still found and still spent, decided by: se test --propose 'TestAStopClaimIsFoundUnderTheHarnessName' --propose 'TestACallUnderTheHarnessNameSpendsThePulledClaim' answers ok
- sh util/checks/battery.sh reports no new failure against the run before the change

## evidence: step 1. ask

<!-- write what is asked and what done means, one criterion per line -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the ask is small enough to review whole, or it is split first | — |  |
| [ ] | every done-when line is decidable, and names the command where one decides it |  |  |
| [ ] | the basics it stands on exist, or are minted first | — |  |

## evidence: step 2. do

<!-- write one test, watch it go red, make the change, watch it go green -->

| done | criterion | evidence | receipt |
|---|---|---|---|
| [ ] | the guidance this token names was read and applied | — |  |
| [ ] | one test was written first and seen red for the reason expected |  |  |
| [ ] | the same test was seen green after the change, and named |  |  |
| [ ] | the change is git diff began..ended, the two hashes the engine wrote on this token | — |  |
| [ ] | the cleanup the change revealed is in the change, or is a token of its own | — |  |

