---
description: "config / migration / log: sets migration.log to new. The session log's slice, switched over in phase 3. The log verb reads the log topic."
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config migration.log new`

The line above runs before this turn opens, so `migration.log` reads `new` from here
on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
