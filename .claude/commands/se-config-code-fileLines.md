---
description: "config / code / fileLines: sets code.fileLines to what you type. The lines a file holds at most. The write door refuses a write that grows past it."
argument-hint: "<value>"
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config code.fileLines $ARGUMENTS`

The line above runs before this turn opens, so `code.fileLines` reads what you type
after the name. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
