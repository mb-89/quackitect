---
description: "config / stop / enabled: sets stop.enabled to false. The tooth. false ends every turn where the agent asks to end it."
allowed-tools: Bash(./RUNME.sh config:*)
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config stop.enabled false`

The line above runs before this turn opens, so `stop.enabled` reads `false` from
here on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
