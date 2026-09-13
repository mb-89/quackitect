---
description: "config / answer / ceiling: sets answer.ceiling to what you type. The score where the gate asks for one rewrite."
argument-hint: "<value>"
allowed-tools: Bash(./RUNME.sh config:*)
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config answer.ceiling $ARGUMENTS`

The line above runs before this turn opens, so `answer.ceiling` reads what you type
after the name. Run `./RUNME.sh config` to read which layer answers a key:
`.se/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
