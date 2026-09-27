---
description: "config / migration / phase1: sets migration.phase1 to true. Phase 1, the foundation. true in the tracked file on main lets a cloud box take the-foundation-lands-unchanged. A write on this box turns nothing on in the cloud."
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config migration.phase1 true`

The line above runs before this turn opens, so `migration.phase1` reads `true` from
here on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
