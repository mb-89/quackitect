---
id: it.machine-build-steps-c9-board
kind: machine_state
statement: "c9 the board cluster: JSON tree with search+filter, parallel branches side by side, maximize fills, scroll holds, the log redline."
machine: it.machine-build-steps
state: c9_board
state_kind: work
filled_by: agent
---

## Guidance
Realization: board-html. The native tree (renderJsonTree) as the default detail renderer; the hand-rolled search/filter layer (key:/val:, /re/, space-AND; clicking the input surfaces the keyword help in the details pane - never a button); branch columns from canvas geometry with every token lit; the maximize modal truly fills; refresh preserves scroll; the log widget drops source/destination and its details show request then response as one object.

## Evidence form
- what_landed | files touched and the mechanism, one breath | required
- run_ref | the green run for the render checks | required
