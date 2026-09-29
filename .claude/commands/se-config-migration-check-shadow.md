---
description: "config / migration / check: sets migration.check to shadow. The check twins: old answers alone, shadow runs the check names beside it and logs a mismatch, new answers the names'."
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config migration.check shadow`

The line above runs before this turn opens, so `migration.check` reads `shadow` from
here on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
