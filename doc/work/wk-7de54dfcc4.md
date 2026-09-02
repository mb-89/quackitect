---
id: wk-7de54dfcc4
seq: 1000042
type: work
title: hooks the editor carries
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: cowork
---

## detail

Spike. util/cage/claude-settings.json declares fourteen events, and nothing has established which of them the editor integration fires. For each declared event, in the editor, on each harness, measure whether it fires, proved by the record and not by the settings file. An event that fires writes a line, and no line is the result. Put the answer into doc/levels/level-0-design.md as a ruling naming which events are enforced in the editor and which are declared and not enforced. If the editor carries fewer, that is a finding for the person.
