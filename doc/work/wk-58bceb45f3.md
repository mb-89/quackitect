---
id: wk-58bceb45f3
seq: "25"
type: work
title: source becomes src
status: closed
assignee: main
scope: single-step
traced: true
disposition: done
subs:
  - wk-25feb4418f
rounds: "1"
minted_by: person
evidence:
  - outcome
---

## detail

Rename source to src with the move verb, then run the whole battery: go test in each module, se lint, and the render check. The rename is a test of the verb, so anything that fails afterwards is a finding on the verb and is fixed there. Do it last, because every other piece of work in the queue names paths under source.

## evidence: outcome

se move --from source --to src ran and sh .se/scratchpad/battery.sh answers all ok. The verb was silent about references it declined to rewrite. declinedPairs in move.go now carries the quoted-segment spelling in the sweep, so the unrewritten list names check.mjs and check.py by path and line. TestATopLevelMoveReportsWhatItDeclinedToRewrite and TestANestedMoveRewritesTheSameSegments pin both sides of the branch. The rewrite rule is unchanged: a top-level folder's bare name is not edited.
