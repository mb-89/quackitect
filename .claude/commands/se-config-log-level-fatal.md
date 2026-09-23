---
description: "config / log / level: sets log.level to fatal. The level this box writes at. info writes every line a door says, and debug writes what the hooks see too."
allowed-tools: Bash(./RUNME.sh config:*)
disable-model-invocation: true
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config log.level fatal`

The line above runs before this turn opens, so `log.level` reads `fatal` from here
on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/.runtime/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
