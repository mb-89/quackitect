---
description: "config / migration / opentasks: sets migration.opentasks to old. The open-tasks slice's record. The badge, the work tab's brackets and its queue column read the index, and old and shadow reach no reader since phase 2 switched over."
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config migration.opentasks old`

The line above runs before this turn opens, so `migration.opentasks` reads `old`
from here on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
