---
description: "config / helper / find: sets helper.find to sonnet. The model a helper runs on that finds, lists, reads and reports."
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config helper.find sonnet`

The line above runs before this turn opens, so `helper.find` reads `sonnet` from
here on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
