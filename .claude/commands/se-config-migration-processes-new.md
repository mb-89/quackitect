---
description: "config / migration / processes: sets migration.processes to new. The processes: old runs every module in the index alone, shadow spawns the IO process beside it and logs each value it reads apart, new runs the placements."
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config migration.processes new`

The line above runs before this turn opens, so `migration.processes` reads `new`
from here on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
