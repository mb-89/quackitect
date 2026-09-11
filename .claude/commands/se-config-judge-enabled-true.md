---
description: "config / judge / enabled: sets judge.enabled to true. The model reading a write. false leaves the mechanical rules alone."
allowed-tools: Bash(./RUNME.sh config:*)
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config judge.enabled true`

The line above runs before this turn opens, so `judge.enabled` reads `true` from
here on. Run `./RUNME.sh config` to read which layer answers a key:
`.se/config.json` beats the environment, and the environment beats
`spec/config/level0.json`.
