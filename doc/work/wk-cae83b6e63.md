---
id: wk-cae83b6e63
seq: 1000017
type: work
title: a reviewer repairs trivia
status: spec_open
assignee: main
scope: single-step
traced: true
minted_by: person
---

## detail

THE OWNER'S WORDS: small stuff like this should not force a new round. We need a no nitpick rule. If it is not breaking anything, if it does not touch the functionality, then just fix it and tell the agent what you fixed. I do not see why this warrants a review round. MEASURED, AND IT IS WHY THIS EXISTS. wk-2b78b911b1 was rejected for a round because a recorded observation cited drain_test.go:201 where the assertion is at 241. The line number changes no behaviour, breaks nothing, and would have taken one edit. That round is one of the 106 rejections behind a review failure rate of 174 per cent over 61 tokens. THE SHAPE THAT MAY WORK, and it wants agreeing before it is built. A reviewer that finds something which changes no behaviour and can be repaired in one edit repairs it, records the repair on the token, and does not open a round for it. A round is for something that would ship wrong. WHERE THE LINE SITS IS THE HARD PART, because one reviewer's trivial is another's silent defect, and a reviewer that starts editing the work it is judging stops being a second pair of eyes. THE NARROW VERSION, WHICH IS WHAT I WOULD BUILD. A reviewer may repair only what it can prove changes nothing that runs: a stale line number in a recorded observation, a citation that has moved, a count in prose that recounts differently, a wording slip. Never a criterion, never a command, never code, never a detail's claim. Every repair is written on the token in its own section so the owner can see what the reviewer changed rather than only what it refused. AND THE ENGINE CAN HOLD THE LINE. A repair section is a field, so the engine can refuse a repair that touches a criterion, and a rule the engine refuses is a rule that holds where a rule a reviewer remembers is not. WHAT IS UNCERTAIN. Whether a repaired token still counts as a pass for the failure rate, and I think it should, because the round it saved is the point. And whether a reviewer that repairs three things on one token should be made to say so louder than one that repairs none.

