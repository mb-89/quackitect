---
description: "config / judge / thenEveryNth: sets judge.thenEveryNth to what you type. After the warmup, the judge reads one write in this many."
argument-hint: "<value>"
allowed-tools: Bash(./RUNME.sh config:*)
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config judge.thenEveryNth $ARGUMENTS`

The line above runs before this turn opens, so `judge.thenEveryNth` reads what you
type after the name. Run `./RUNME.sh config` to read which layer answers a key:
`.se/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
