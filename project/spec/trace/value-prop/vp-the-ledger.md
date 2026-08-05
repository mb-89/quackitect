---
id: vp-the-ledger
type: "[[value-prop]]"
statement: As an engineer, I need every decision recorded, attributed and refusable.
audience: stk-engineer-driving-agents
outcome: the record says who approved what and why, still answers it years later, and carries across sessions what the agent forgets
priority: must
---

## Success criteria

- Any decision from years back answers its "why" in one click from the record.
  Metric: clicks from the record to the rationale. Target: one.
- A killer gate carries a person's adjudication, never the agent's.
  Metric: the share of killer gates blessed by the agent rather than the person. Target: zero.
- The project's standing is readable from one live board at any moment.
  Metric: commands from question to current board. Target: one, recomputed live on every render.
- A new session resumes without re-deriving settled decisions.
  Metric: settled questions reopened after a compaction or a session change. Target: zero.

## Unlike

An agent runtime with an audit log. Those record who ran what, never whether the work earned its way. The difference is that this record is refusable — a claim can be rejected, and the rejection is itself recorded.

## Notes (not load-bearing)

The decision-record practice this rests on is Nygard's. It is named here rather than in `source_refs`, because reference notes are not a trace type yet and a reference that resolves to nothing is worse than a sentence.

The continuity criterion is the one the gap claim argues directly: an agent that does not write down what it did and why REGRESSES, because every compaction and every new session loses information. The record is not bureaucracy here. It is the agent's continuity.
