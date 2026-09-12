---
description: "agent control / hold: sets stop.hold to running. What the session does when it reaches the end of a turn."
allowed-tools: Bash(./RUNME.sh config:*)
generated: "GENERATED. Edit the source named below, not this file. It is written again every time the tree is projected, so an edit here is lost. Source: spec/config/level0.json"
---

!`./RUNME.sh config stop.hold running`

The line above runs before this turn opens, so `stop.hold` reads `running` from here
on. Run `./RUNME.sh config` to read which layer answers a key: `.se/config.json`
beats the environment, and the environment beats `spec/config/level0.json`.
