---
id: wk-49dac4dab4
seq: "19"
type: work
title: a flag not search
status: closed
assignee: main
scope: single-step
traced: true
disposition: done
rounds: "3"
minted_by: person
evidence:
  - outcome
---

## detail

The engine works out that an answer is owed by reading its own log back and looking for a prompt with nothing after it. Store the fact instead: a prompt arriving flips a bit, an answer arriving clears it, and the guard reads the bit. The owner asked whether this belongs in the MCP server rather than the engine. That is part of the resident engine question, so decide that first. Related: wk-4b67d7126a.

## evidence: outcome

owed.go keeps the obligation per actor in owed.json as a list: TheyAsked appends, TheyWereAnswered clears what was outstanding, and AnswerOwed hands back every waiting question. The answer verb no longer clears an obligation it cannot attribute. The read and write run as one operation under a lock file. A lock is stale after one second and a waiter tries 1500 times at 2 milliseconds. owed_test.go adds TestTheWaiterOutlastsTheStaleness and TestADeadLockIsStolenAndTheWriteHappensUnderIt, both red first, and sh .se/scratchpad/battery.sh answers all ok. The MCP placement stays with wk-4b67d7126a.
