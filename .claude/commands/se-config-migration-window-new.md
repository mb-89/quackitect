---
description: "config / migration / window: sets migration.window to new. The window: old draws its own reads, shadow reads the log and the work view off the index beside them and logs a mismatch, new draws the index's."
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config migration.window new`

The line above runs before this turn opens, so `migration.window` reads `new` from
here on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
