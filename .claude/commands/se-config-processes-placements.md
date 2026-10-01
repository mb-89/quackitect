---
description: "config / processes / placements: sets processes.placements to what you type. the lists of module instances that share one process, where each instance in no list takes a process of its own"
argument-hint: "<value>"
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config processes.placements $ARGUMENTS`

The line above runs before this turn opens, so `processes.placements` reads what you
type after the name. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
