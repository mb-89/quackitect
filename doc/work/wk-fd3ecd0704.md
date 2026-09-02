---
id: wk-fd3ecd0704
seq: "16"
type: work
title: prompts get answers
status: closed
assignee: main
scope: single-step
traced: true
disposition: done
minted_by: main
evidence:
  - outcome
---

## detail

For every prompt the person gives they should see one answer from the agent in the log, clickable and readable there. The guard already records UserPromptSubmit, and the answer half needs a verb the agent calls with what it would have said.

## evidence: outcome

se --answer puts the answer in the record, and se_answer does the same through the lane. The guard records the whole prompt instead of cutting it through firstLine at two hundred characters, asserted by TestAPromptIsRecordedWhole. The guidance names the order: their sentence, the answer, then the work.
