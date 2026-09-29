---
description: "config / migration / log: sets migration.log to old. The session log rows: old answers alone, shadow runs the log topic beside it and logs a mismatch, new answers the topic's."
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config migration.log old`

The line above runs before this turn opens, so `migration.log` reads `old` from here
on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
