---
id: wk-a02f7c1e4c
seq: "18"
type: work
title: answer before anything
status: closed
assignee: main
scope: single-step
traced: true
disposition: done
rounds: "4"
minted_by: main
evidence:
  - outcome
---

## detail

The engine forces the order rather than asking the agent to remember it. It writes the log, so it knows when the newest prompt has no answer after it. While that is true, the guard refuses every call and says: answer them first. The obligation is keyed by actor, since several agents run here at once.

## evidence: outcome

The guard in owed.go refuses every tool call while the actor owes an answer, and TheyAskedIfNamed records an unattributed message against Walker, as heard.go does. TestTheFallbackVerbLeavesTheWalkerOwing runs se --said with no actor and requires the walker to owe. TestTheTwoWritersMakeOneObligationInEitherOrder runs the fallback and the copier in both orders and requires exactly one obligation. Both were red first. sh .se/scratchpad/battery.sh answers all ok.
