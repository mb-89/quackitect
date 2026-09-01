---
id: wk-8ffc2fde6c
seq: 1000035
type: work
title: the retro collects voice
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: cowork
---

## detail

The voice check has two halves and only one is built. The per-write half lives in hook.go: it loads util/voice-rules.json, runs over prose on the way to disk, and refuses a write that breaks a rule. The other half was never built. Nothing reads a finished session and says how it went.

IT BELONGS IN THE RETRO. se retro already rotates the log, collects the record and the scratchpad into one folder, and drains them. It is the one command that reads a whole session on purpose, and the material a voice measure needs is the material it is already carrying.

WHAT THE ENGINE DOES. Collect. Run the same VoiceRules.Check over every message the agent wrote in the session being retired, and put the findings in the retro folder with the rest: which rule, how many, and where. The rules are data, so a rule added to util/voice-rules.json is counted without the collector changing.

WHAT THE METHOD DOES. Judge. The retro guidance reads what was collected and says what it means. Counting is mechanical and belongs in the engine. Whether a session went well is judgement, and this project keeps judgement out of the engine everywhere else.

The split matters more than the feature. A collector that also concludes is a collector nobody can disagree with.

WHAT CLOSES IT. A retro folder that carries the voice findings for the session, and a test that writes a record with known breaks in it and asserts they are counted.

This was UC-33, from the open list that has been removed. The backlog carries it now.

