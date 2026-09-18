---
description: "config / refactor / mostAtOnce: sets refactor.mostAtOnce to what you type. The hands one session starts. 0 lifts the bound."
argument-hint: "<value>"
allowed-tools: Bash(./RUNME.sh config:*)
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config refactor.mostAtOnce $ARGUMENTS`

The line above runs before this turn opens, so `refactor.mostAtOnce` reads what you
type after the name. Run `./RUNME.sh config` to read which layer answers a key:
`.se/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
