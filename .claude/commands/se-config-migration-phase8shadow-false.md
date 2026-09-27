---
description: "config / migration / phase8shadow: sets migration.phase8shadow to false. Phase 8 in shadow. true in the tracked file on main lets a cloud box take sidebar-lands-in-shadow. A write on this box turns nothing on in the cloud."
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config migration.phase8shadow false`

The line above runs before this turn opens, so `migration.phase8shadow` reads
`false` from here on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
