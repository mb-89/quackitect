---
description: "config / migration / prose: sets migration.prose to new. The prose checks: old answers on wink alone, shadow runs the Go checks beside it and logs a mismatch, new answers the Go checks'."
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config migration.prose new`

The line above runs before this turn opens, so `migration.prose` reads `new` from
here on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
