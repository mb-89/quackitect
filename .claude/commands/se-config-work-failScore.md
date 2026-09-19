---
description: "config / work / failScore: sets work.failScore to what you type. The score a ticket takes for each hand-back that comes back refused."
argument-hint: "<value>"
allowed-tools: Bash(./RUNME.sh config:*)
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config work.failScore $ARGUMENTS`

The line above runs before this turn opens, so `work.failScore` reads what you type
after the name. Run `./RUNME.sh config` to read which layer answers a key:
`.se/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
