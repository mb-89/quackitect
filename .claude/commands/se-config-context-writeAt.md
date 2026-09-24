---
description: "config / context / writeAt: sets context.writeAt to what you type. The context past which the session stops the step and writes the handover now. 0, or a value under handoverAt, switches it off."
argument-hint: "<value>"
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config context.writeAt $ARGUMENTS`

The line above runs before this turn opens, so `context.writeAt` reads what you type
after the name. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
