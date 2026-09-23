---
description: "config / work / failsBeforeWait: sets work.failsBeforeWait to what you type. The times a step fails back before the pull drops the hold and answers wait."
argument-hint: "<value>"
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config work.failsBeforeWait $ARGUMENTS`

The line above runs before this turn opens, so `work.failsBeforeWait` reads what you
type after the name. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
