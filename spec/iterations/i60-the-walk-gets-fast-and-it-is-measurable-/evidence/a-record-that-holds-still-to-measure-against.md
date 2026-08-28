---
form: a-record-that-holds-still-to-measure-against
amended: 2026-08-24T20:00:24.227Z by agent — the cold figures this form measured on its first use have since fallen by a factor of five, and the yardstick is what proved it
by: agent
signed_off: 2026-08-24T17:57:37.229Z
authors: agent
files: null
---

# Evidence form / a-record-that-holds-still-to-measure-against

## current_situation

The binding already pinned a record: a benchmark run rewinds the subject's `spec` to a fixed commit while the engine and the guidance stay current. So the record held still.

NOTHING WAS MEASURED AGAINST IT. The run recorded where it was told to stop and where it ended, and no timing at all. A yardstick nobody measures against is a fixture.

## built

THE PINNED RUN CARRIES WHAT EACH HOP COST TO WALK.

### What was added

`BenchmarkRun` in [deliverable/engine/benchmark.ts](deliverable/engine/benchmark.ts) gained `hops`, one entry per hop actually walked, each naming the hop and its duration.

`benchmarkNoteHops` appends to the bound run. It is a NO-OP when nothing is bound, which is every ordinary walk — refusing there would make the caller ask first, and asking first is a second reader of the same file.

`benchmarkEnd` now reports a `walk` summary: how many hops, their total, their median, and the slowest hop by name.

### The median and not the mean, deliberately

One slow hop — a cold cache, a machine that swapped — moves a mean and does not move a median. The question this answers is whether the WALK got slower, not whether one hop did.

### Where it is fed from

The sweep already records per-hop walking times as `swept_ms`. `sweptMs()` on the session is the ONE place that hands them out and notes them, because all four of the sweep's exits carry them and a second caller would be a second chance to forget.

### Why this is the yardstick and not just a number

The subject's `spec` is rewound to a fixed commit, so the record does not grow between runs. Two walks of the SAME pinned record are therefore comparable, and a walk that got slower can be told apart from a record that got bigger.

THAT DISTINCTION IS THE WHOLE POINT of the goal this chunk answers. Without it, a rising number says nothing: the record may simply have more in it.

### What it measured on its first use

Boot's three hops, from a cold process: 3,563 ms, 3,114 ms and 3,058 ms. The route drawing for the same three came to under thirty.

THE SAME THREE HOPS SINCE, and the yardstick above is what made the difference visible.

| hop | on first use, cold | now, cold | now, warm |
| --- | --- | --- | --- |
| `boot/start` | 3,563 ms | 716 ms | 34 ms |
| `boot/read_contract` | 3,114 ms | 325 ms | 66 ms |
| `boot/prepare_desk` | 3,058 ms | 310 ms | 59 ms |

WARM IS WHAT A LIVE ENGINE SEES. It pays the cold price once, at boot.

NO RED WAS OBSERVED FOR THIS CHUNK. The build landed before a check could be written, and [observe-red's evidence](spec/iterations/i60-the-walk-gets-fast-and-it-is-measurable-/evidence/observe-red.md) records that rather than tidying it away.

## follow_up

THE BUDGET IS NOT ENFORCED, and this chunk does not enforce it.

The owner ruled what the budget binds: the mechanical flip from one step to the next, not the work a state does inside the hop. Measured, that flip costs 11 to 12 milliseconds against a budget of 250.

SO THERE IS NOTHING TO ENFORCE TODAY. The figure is well inside the bound, and a threshold check would pass from birth. When the flip approaches the bound, this is the instrument that will say so.

THIS PARAGRAPH WAS LATER CONTRADICTED AND THEN VINDICATED. A register entry claimed the round missed the budget by more than three times, comparing the WHOLE HOP against a row that binds the flip. A phase trace put the flip at 20 milliseconds, which agrees with the 11 to 12 above, and the entry is closed as refuted.

WHAT THE STATES' OWN WORK OWES INSTEAD is a signal that it is running, which is a different row and carries its own open issue.

## anything_else

