---
description: "config / work / staleAfter: sets work.staleAfter to what you type. The age of a held group's tip that puts it under yours."
argument-hint: "<value>"
allowed-tools: Bash(./RUNME.sh config:*)
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config work.staleAfter $ARGUMENTS`

The line above runs before this turn opens, so `work.staleAfter` reads what you type
after the name. Run `./RUNME.sh config` to read which layer answers a key:
`.se/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
