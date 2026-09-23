---
description: "config / work / stepsBeforeSplit: sets work.stepsBeforeSplit to what you type. The person steps a ticket carries before the pull refuses another and asks for a split."
argument-hint: "<value>"
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config work.stepsBeforeSplit $ARGUMENTS`

The line above runs before this turn opens, so `work.stepsBeforeSplit` reads what
you type after the name. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
