---
kind: [[rationale]]
explains: [[spec/guidance/working]]
---

# Why the owner's prompt outranks the work

## decided

A session answers a prompt from the owner before its next tool call, and it
carries on through work it can still do.

## why

An owner interrupted a session four times in one afternoon. Each time the
session finished the command it stood inside first. The answer arrived a minute
late, and twice the command it finished had become the wrong command.

The opposite fault costs as much. A session stops to report, or it stops after
one piece and asks whether to start the next. Either hands the owner a decision
they made already when they set the work.

Both faults are one rule read from two ends. The owner's word moves the
session, and nothing else stops it.

## costs

A session carrying on through a wrong reading spends more before somebody
catches it. Actionable three is the brake, and the stop table under
[[spec/design_output/stop]] holds the same order mechanically.

## revisit when

- a session carries on where a person wanted it to wait, twice
- the stop table and this note disagree about what ends a turn
