---
id: wk-fbbc33b2f7
seq: 1000131
type: work
title: the standing assertion unnamed
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: rev-7
---

## detail

Before agreeing a criterion that changes what a function answers, search the test files for that function and the answer being changed. List in the detail each test that will go red and what its assertion becomes. A behaviour with a test and a comment behind it is a decision, and a token has to beat the reason rather than the code. Seen on wk-be13363600 round 1: criterion 2 reverses three tests in src/engine/pull_test.go and names none. They are TestUnreviewedWorkBlocksTheQueue, TestAStaleHoldIsNotAReviewerReading and TestAReviewerThatStopsPullingGoesStale.
