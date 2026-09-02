---
id: wk-c22f29af7b
seq: "-23"
type: work
title: a reviewer names lessons
status: imp_done
assignee: main
scope: single-step
traced: true
disposition: done
parent: wk-bc3c5ba905
rounds: 3
minted_by: person
evidence:
  - outcome
---

## detail

A rejection is accepted only when it names the token the reviewer minted for the lesson. Owner's decision: the lesson is a judgment call. The reviewer mints the token with se work, backlogged or open as it judges, and tells the engine which id. The engine checks the id is a token and refuses a rejection naming none, the way one with no finding is refused. This replaces wk-6684401070, which had the engine minting.

## evidence: outcome

rejectionIsWhole refuses a rejection with no finding, no lesson, a lesson naming no token, or a learned id that is not a token. All nine refusals on the reviewer path, four in rejectionIsWhole and five in judge and judgeSpec, have a case in lesson_test.go or spec_test.go. Each case asserts on what only that refusal can say. Each was deleted alone in an isolated copy and watched red. The battery is green.
