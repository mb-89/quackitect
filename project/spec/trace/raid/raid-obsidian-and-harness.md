---
id: raid-obsidian-and-harness
type: "[[raid]]"
kind: dependency
statement: Two things outside this project are load-bearing — Obsidian as the drawing surface, and the agent harness as the runtime.
owner: the owner
trigger: on a breaking change to either
status: open
breaks_how_badly: fatal
how_likely: plausible
impact: A machine is a canvas a person edits in Obsidian, and the whole lane runs inside somebody else's agent harness. A breaking change to either stops the walk rather than degrading it.
source_refs:
  - the machines-are-drawn law in software.md
  - the cage that blocks the native tools
---

Neither dependency is accidental and neither is cheap to replace.

OBSIDIAN holds the machine format. The law is that a person edits the drawing
in Obsidian in the real world, so a mechanism depending on metadata Obsidian
does not surface to its editor is a defect by definition.

THE HARNESS holds the lane. Every tool the agent has is served through it,
and the cage that blocks the native tools is configured per host — one file
for Claude Code, another for Copilot CLI.

WHAT KEEPS THIS A DEPENDENCY RATHER THAN A RISK: somebody else owns both, and
no amount of care here changes when they move.

The escape routes are known and unbuilt. The machine format question is
already open (note-968f90177b05), and a second host has already been caged,
which is what proves the harness coupling is a configuration rather than an
architecture.
