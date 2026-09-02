---
id: wk-6cfb0f1acf
seq: "22"
type: work
title: a person orders work
status: closed
assignee: main
scope: single-step
traced: true
disposition: done
rounds: "1"
minted_by: person
evidence:
  - outcome
---

## detail

The queue hands out the lowest seq and a person has no way to put a different token next. What a person owns is the order, so add a verb that writes seq and nothing else: se work --first <id> --by person. It does not move a token between states, which stays with the pull. The editor calls it when a person drags a row up.

## evidence: outcome

PutFirst in src/engine/token.go refuses a closed token, does nothing when the token is already first, and otherwise takes one below the lowest live seq. The --first branch records the move in the log with the actor from --by. TestPuttingATokenFirstIsRecorded and TestAPersonPutsATokenFirst in src/engine/token_test.go cover it, and pull_test.go pulls the moved token. The editor does not call it yet, since drag to reorder belongs with wk-bb34ab1208.
