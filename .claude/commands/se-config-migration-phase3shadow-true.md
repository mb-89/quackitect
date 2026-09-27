---
description: "config / migration / phase3shadow: sets migration.phase3shadow to true. Phase 3 in shadow. true in the tracked file on main lets a cloud box take read-topics-land-in-shadow. A write on this box turns nothing on in the cloud."
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config migration.phase3shadow true`

The line above runs before this turn opens, so `migration.phase3shadow` reads `true`
from here on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
