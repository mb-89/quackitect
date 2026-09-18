---
description: "config / work / retroCap: sets work.retroCap to what you type. The tickets a retro's improve step mints, so the list holds what gets done."
argument-hint: "<value>"
allowed-tools: Bash(./RUNME.sh config:*)
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config work.retroCap $ARGUMENTS`

The line above runs before this turn opens, so `work.retroCap` reads what you type
after the name. Run `./RUNME.sh config` to read which layer answers a key:
`.se/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
