---
description: "config / watchdog / deadlineDerived: sets watchdog.deadlineDerived to what you type. The span a derived provider with a pending input commits within."
argument-hint: "<value>"
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config watchdog.deadlineDerived $ARGUMENTS`

The line above runs before this turn opens, so `watchdog.deadlineDerived` reads what
you type after the name. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
