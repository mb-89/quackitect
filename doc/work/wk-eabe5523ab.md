---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: todos become sub-tokens
# where the token stands. The process owns these values.
status: closed
author: worker-erin
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - 05b9d3b75e226a14cd5ef4e61a82086b14263e56
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 7f53d53512647d201dd11bec7715551e083bb4dd
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

The person said: do not write your own todos. Mint sub tokens under the token you are on. The agent used the harness's TodoWrite during the hygiene work and the plan lived outside the record. Consumes wk-f09c5978cf.

## done when

- TodoWrite and TodoRead are refused by the guard, naming a sub-token under the token in hand: go test -C src/engine -run TestATodoIsASubToken
- driving-the-engine says it in one rule: .bin/se.exe lint

## evidence: criterion 1 the guard refuses

se test ran src/engine/TestATodoIsASubToken, named outright: ok in 0.17 seconds. It holds a token, then asks the guard for TodoWrite and TodoRead and requires both refused. The refusal names se work, the flag --parent, and the id of the token in hand. It also requires Read, Write, Bash and Glob to pass, so the guard does not reach past what it is about. TestATodoWithNothingInHandSaysHowToGetOne is ok in 0.08 seconds: holding nothing, the refusal offers no --parent and names se pull instead.

## evidence: criterion 2 one rule

.bin/se.exe lint reports no finding for driving-the-engine.md. It gains rule 10, break work into sub-tokens with se_work naming the parent, your own todo list is refused. It gains a chapter saying why. A plan in the harness's list lives inside one agent and goes when the agent goes. A sub-token, by contrast, is handed out before its parent and keeps that parent open until it closes. Ten rules against a cap of fifteen, and the Discussion is under its thousand words.

## evidence: not yet in force

The guard is compiled and tested but not running, because the engine in memory is the stale build from commit 7f22e1a3. It takes effect at the next restart. That is wk-65c53d4b97, already open and carrying a ready_when that names the restart, so nothing new was minted for it.

## evidence: the red was watched

The test went in first against a stub answering no, so the red was an assertion rather than a compile error. It failed saying TodoWrite was allowed, so the plan can live outside the record, and the same line for TodoRead. The stub was then replaced by the guard and both went green.

## evidence: what changed

src/engine/gate.go gains TodoTools, declaring TodoWrite and TodoRead together because reading the list is how an agent finds the list it is about to write. It also gains TodoIsASubToken, which builds the refusal and names the held token as the parent to mint under. src/engine/hook.go calls it just after the write gate, denying with that text. src/engine/todogate_test.go is new. doc/guidance/driving-the-engine.md gains the rule and chapter.

