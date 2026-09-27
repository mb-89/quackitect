---
description: "config / pull / margin: sets pull.margin to what you type. The room the pull keeps free below the cap. A hand-out past cap less margin splits, and the next pull on the step prints the rest."
argument-hint: "<value>"
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config pull.margin $ARGUMENTS`

The line above runs before this turn opens, so `pull.margin` reads what you type
after the name. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
