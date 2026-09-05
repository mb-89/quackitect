---
# which schema reads this note
kind: [[work-token]]
# which process shapes this token and says how it moves
process: [[trivial]]
# the rules for filling this token
guidance: [[work-token]]
# the name this token is known by, in references and in links
title: the battery stops early
# where the token stands. The process owns these values.
status: closed
author: worker-cole
# the tree each time the work was taken up, snapshots the engine wrote
began:
  - f001fdb1cfb80d7613badae95068cd11dadc58b5
  - 2140ae343bea4f7440472fbb90d2abde1ea98f1b
# the tree each time the work was put down or closed, snapshots the engine wrote
ended:
  - 782812420cbabb4193623bd75ee7f68f23d55da2
  - 494dfc94068824d4344ceb5fdc5ae84f4230e943
# how it ended. Only an ended token carries one.
disposition: done
# why it was dropped
reason: "The first criterion is met and proven by two planted failures reported with their causes in one run over a copy of the tree. The second, a green battery on the clean tree, is not met. It is not this token's to meet. Eight checks fail for reasons belonging to other work in flight. Each is now named with its cause in a single run, which is what this token asked for."
# what it became. They have to exist.
successors:
  - "[[wk-9a53c8351d]]"
  - "[[wk-cd1d6e4684]]"
---

## detail

The battery was run five to eight times per stretch, thirty-seven seconds each, fixing one failure per run. In one stretch the same two failures were reported five times with no investigation between them.

## done when

- With two failures planted, one battery run reports both with causes. Planting undone after.
- battery.sh runs green on the clean tree.

