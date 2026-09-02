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

The voice check refuses a write in hook.go using util/voice-rules.json, but nothing reads a finished session and says how it went. In se retro, run the same VoiceRules.Check over every message the agent wrote in the retired session. Put the findings in the retro folder: which rule, how many, where. The retro guidance judges what the count means. Done when a retro folder carries the voice findings and a test writes a record with known breaks and asserts they are counted. This was UC-33.
