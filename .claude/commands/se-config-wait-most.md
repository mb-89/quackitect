---
description: "config / wait / most: sets wait.most to what you type. The span the wait tool holds at most before it returns with no signal."
argument-hint: "<value>"
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config wait.most $ARGUMENTS`

The line above runs before this turn opens, so `wait.most` reads what you type after
the name. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
