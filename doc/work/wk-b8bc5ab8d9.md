---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: enum refusal has test
# where the token stands. The process owns these values.
status: closed
author: worker-six
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - f464eadf2a5cfa9eac31a847a7641323c362d303
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 8b0363c4946ae13664cb6ba6f4b9670c166a47a4
# how it ended. Only an ended token carries one.
disposition: done
---

## detail

The save refuses a frontmatter value outside its enumeration (src/engine/schema.go:354-357 names the field and the allowed values, src/engine/hook.go:801-833 denies the write) and Narrow resolves x-enum-from process.states and process.dispositions (src/engine/process.go:260-269). No test drives that path. src/engine/schema_test.go covers const, chapters and word counts, and nothing asserts the enum refusal or the x-enum-from resolution. So the checking half is missing, and a regression would ship silent.

## proposed action

Add cases to schema_test.go. Give a note a status outside its process states, and another a disposition outside its process dispositions. Each is seen refused with the field name and the allowed values.

## done when

- a test gives a note a status outside its process states and sees ValidateNote name the field and the allowed values. Run by se test
- a test gives a note a disposition outside its process dispositions and sees the same, run by se test
- each test was seen red against a copy with the enum check disabled, or its ability to fail is shown another way

## evidence: step 1. ask

the done-when lines are decided by se test --on wk-b8bc5ab8d9 --propose TestAValueOutsideItsProcessEnumIsNamed. The red half is decided by the same test over a scratchpad copy with the enum check disabled

## evidence: step 2. do

TestAValueOutsideItsProcessEnumIsNamed in src/engine/schema_test.go drives a status and a disposition outside their process enums over fixtures. It was seen red over a copy with the enum check turned to if false (both refusals vanished, the test named each). It went green through se test, ok true in 0.24s

