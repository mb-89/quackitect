---
id: wk-45a742fbeb
seq: "-40"
type: work
title: every write names it
status: imp_done
assignee: main
scope: single-step
traced: true
disposition: done
rounds: 2
minted_by: cowork
submitted_by: main
reviewed_by: rev-31
evidence:
  - outcome
---

## detail

se work --on <id> arms one gated write and the next is refused until named again. Shells keep their hand, the scratchpad is exempt.

## done when

- Second write on one ticket refused
  `rg -q func.TestANamedWriteSpendsItsTicket src/engine && go test -C src/engine -count=1 -run TestANamedWriteSpendsItsTicket$ .`
- Naming again reopens one write
  `rg -q func.TestEveryWriteNeedsItsOwnName src/engine && go test -C src/engine -count=1 -run TestEveryWriteNeedsItsOwnName$ .`
- Scratchpad spends nothing
  `rg -q func.TestTheScratchpadSpendsNothing src/engine && go test -C src/engine -count=1 -run TestTheScratchpadSpendsNothing$ .`
- A reviewer's hold needs no ticket
  `rg -q func.TestAReviewersHoldWritesWithoutTickets src/engine && go test -C src/engine -count=1 -run TestAReviewersHoldWritesWithoutTickets$ .`
- Bash keeps its hand
  `rg -q func.TestAShellKeepsTheStandingHand src/engine && go test -C src/engine -count=1 -run TestAShellKeepsTheStandingHand$ .`
- Each watched red first

## evidence: outcome

Built in src/engine/ticket.go and WriteNeedsAToken in gate.go. The engine suite is green.
