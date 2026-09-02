---
id: wk-4e8eeb76aa
seq: 13
type: work
title: a token gates writes
status: imp_done
assignee: main
scope: single-step
traced: true
disposition: done
rounds: 3
minted_by: main
submitted_by: main
evidence:
  - outcome
---

## detail

Writing to source is refused until a work token is open. The scratchpad stays allowed. A write names its token in a one-line call immediately before it, in the same turn, and naming it is what opens it. The guard pairs the write with the token named just before it, the way it pairs a PreToolUse with its PostToolUse. It gates writes only, and the misc token stays as the escape hatch. Git bracketing is not built here. Related: wk-ec0ef7653f.

## evidence: outcome

runsTheEngine in src/engine/hook.go now requires the engine as the first word and nothing else running. The separator scan reads angle brackets, so a redirection is refused. WriteNeedsAToken takes a path, and insideTheScratchpad in src/engine/gate.go asks filepath.Rel whether the path is under .se/scratchpad, with Bash still gated. src/engine/scratchpad_test.go and TestTheGuardRefusesAWriteWithNoTokenAndTakesTheEngineThrough were watched red first. blocksHoldNoHeading in src/engine/store.go gained Rejection.Answer, and bash util/checks/battery.sh answers all ok.
