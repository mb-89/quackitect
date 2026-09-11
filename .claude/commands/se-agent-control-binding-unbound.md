---
description: "agent control / binding: sets engine.binding to unbound. Where the session takes its work from."
allowed-tools: Bash(./RUNME.sh config:*)
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config engine.binding unbound`

The line above runs before this turn opens, so `engine.binding` reads `unbound` from
here on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
