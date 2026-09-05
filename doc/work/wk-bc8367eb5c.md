---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: size limits from schema
# where the token stands. The process owns these values.
status: closed
author: worker-two
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - ba6f97f77e33b50431b8a3d341bb575c9a9e6856
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 4c8d434480491af0b12b935d882e8976acc59107
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

The save refuses an oversize detail or evidence section off c.DetailBytes and c.SectionBytes (src/engine/store.go:357-364), which come from util/parameters.json limits detail_bytes and section_bytes through src/engine/config.go:430-522. The ruling on wk-126fd296db says these limits become field constraints in the schema, and the schema already holds each section's word bounds. So today one size rule lives in two places, and only the config half guards an engine-side write.

## proposed action

Declare the byte bounds on the detail and evidence sections in src/schemas/work-token.schema.yaml with an x- keyword, have SaveToken read them from the loaded schema, and delete detail_bytes and section_bytes from util/parameters.json, config.go and lint.go.

## done when

- util/parameters.json, src/engine/config.go and src/engine/lint.go carry no detail_bytes or section_bytes, checked by se find over the tree
- an oversize detail is still refused at SaveToken off a bound the schema declares, naming the section and the bound, checked by a test
- the test was seen red for the reason expected before the change

