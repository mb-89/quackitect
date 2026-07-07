---
id: crit-board-live
type: criterion
metric: commands from question to current board, and the board's freshness
target: one command, recomputed live on every render
statement: The project's standing is readable from one live board at any moment.
class: review
killer: false
---
The status and report commands recompute the board from the ledger on every call. There is no cached snapshot, so the board can never show a stale pass. Evidence is the rendered report.
