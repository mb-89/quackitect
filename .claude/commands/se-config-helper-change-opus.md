---
description: "config / helper / change: sets helper.change to opus. The model a helper runs on that makes a scoped change with its test, or reviews against a list."
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config helper.change opus`

The line above runs before this turn opens, so `helper.change` reads `opus` from
here on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
