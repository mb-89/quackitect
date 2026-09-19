---
description: "config / refactor / mostWarnings: sets refactor.mostWarnings to what you type. The warnings the tree holds before the rule fires. 0 switches the rule off."
argument-hint: "<value>"
allowed-tools: Bash(./RUNME.sh config:*)
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config refactor.mostWarnings $ARGUMENTS`

The line above runs before this turn opens, so `refactor.mostWarnings` reads what
you type after the name. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
