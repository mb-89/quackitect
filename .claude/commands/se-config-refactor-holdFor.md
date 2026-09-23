---
description: "config / refactor / holdFor: sets refactor.holdFor to what you type. The span the hand holds its file against every other write. 0 switches the hold off."
argument-hint: "<value>"
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config refactor.holdFor $ARGUMENTS`

The line above runs before this turn opens, so `refactor.holdFor` reads what you
type after the name. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
