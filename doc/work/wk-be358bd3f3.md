---
id: wk-be358bd3f3
seq: "66"
type: work
title: answer every finding
status: backlogged
assignee: main
scope: single-step
traced: true
minted_by: reviewer4
---

## detail

A round that answers the finding cheapest to fix and is silent about the rest. wk-61af3a054e came back with criterion 2 given its own test, which closes finding 1, and with finding 2 and finding 3 untouched: the detail is byte-identical and criteria 1 and 4 are byte-identical to the round before. Not declined with a reason, which would have been a legal answer. Simply absent. wk-bb34ab1208 did the same thing one round earlier, closing the pinned-rows finding and saying nothing about the class-name one.

WHY IT COSTS A ROUND: a submission that answers some findings reads exactly like one that answers all of them, because the evidence names what it did and nothing names what it did not. The gap is invisible until the reviewer re-runs its own reproduction.

WHAT TO DO: answer every finding by name, including the ones you are not fixing. One section per finding, headed with its number, and its body is either closed with what proves it or not taken with why and what owes it. Before submitting, list the last round's findings, tick each against a section, and re-run the reviewer's reproduction where it named one.

WHERE IT COULD LIVE RATHER THAN IN A HABIT: the engine already knows the findings on a token, so it could refuse a submission whose evidence names fewer sections than there are open findings. That is the shape of the fix worth considering, because a rule the agent keeps is a rule the agent can forget.

Found on wk-61af3a054e and wk-bb34ab1208.

