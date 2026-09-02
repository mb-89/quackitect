---
id: wk-deb5e6de06
seq: 1000069
type: work
title: views belong in source
status: backlogged
assignee: main
scope: multi-step
traced: true
minted_by: cowork
---

## detail

The owner ruled: setup, checks and cage stay in util, and views is source because the engine reads it to run. Move util/views/ to src/views/ and util/parameters.json, util/projections.json, util/icons.json, util/tools.json and util/voice-rules.json to src/. se move will not find the segmented joins in config.go:102, icons.go:32, lint.go:59, project.go:40, query.go:123, query.go:173, query.go:175, tools.go:57 and voice.go:54. First replace those nine with one function that answers where a declaration lives, then move. Do this on a quiet queue, since the paths are read on every start. Done when the battery is green, the engine finds all five declarations, and se query draws a view. A grep for util must find nothing outside util/setup, util/checks and util/cage.
