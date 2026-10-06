---
description: "config / battery / budget: sets battery.budget to what you type. The time the whole check takes at most. Past it, the check prints a warning naming its slowest part and its slowest cases. 0 switches it off."
argument-hint: "<value>"
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config battery.budget $ARGUMENTS`

The line above runs before this turn opens, so `battery.budget` reads what you type
after the name. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
