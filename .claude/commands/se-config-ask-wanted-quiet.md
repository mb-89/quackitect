---
description: "config / ask / wanted: sets ask.wanted to quiet. What the owner wants said at the end of this turn."
allowed-tools: Bash(./RUNME.sh config:*)
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config ask.wanted quiet`

The line above runs before this turn opens, so `ask.wanted` reads `quiet` from here
on. Run `./RUNME.sh config` to read which layer answers a key: `.se/config.json`
beats the environment, and the environment beats `spec/config/level0.json`.
