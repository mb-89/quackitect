---
description: "config / migration / opentasks: sets migration.opentasks to new. The open-tasks count: old answers alone, shadow runs the index's count beside it and logs a mismatch, new answers the index's."
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config migration.opentasks new`

The line above runs before this turn opens, so `migration.opentasks` reads `new`
from here on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
