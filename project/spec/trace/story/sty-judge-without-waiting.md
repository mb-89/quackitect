---
minted_in: i12-performance-hold-the-one-second-rule-on-
id: sty-judge-without-waiting
type: "[[story]]"
statement: The engineer opens the drawing to make a call, and spends the next four seconds watching the machine think instead of judging.
actor: stk-engineer-driving-agents
refines:
  - vp-rigor-without-toil
priority: should
---

## Deck

The engineer has a gate to adjudicate. They open the state machine to see what stands, and the page does not come back.
|||
Measured 2026-08-15: /widget/machine answered in 3966 ms, and the root page in 4026 ms.

---

Nothing says it is slow. There is no spinner, no toast, and no record anywhere that a look cost four seconds.
|||
The standing guard, req-call-answers-in-one-second, covers a DRIVER'S CALL. No row covered a person's look until this record wrote one.

---

They open the evidence form behind a state. It takes three seconds. They open another. Three seconds again.
|||
Measured 2026-08-15: /widget/details broke the one-second rule on all seven of its requests, between 2720 ms and 3468 ms.

---

The waiting never appears as cost. The session's minutes are counted as judging, because judging is what the engineer was trying to do.
|||
Owed at M8. The mirror_slow records exist; nothing yet turns them into a report anybody reads.

---

The engineer stops opening things. They adjudicate from the form they already have, and skip the two artifacts they would have checked.
|||
Owed at M8. This is the failure the record is built to prevent, and it is the one that leaves no trace.

---

The rigor was not abandoned because it was hard. It was abandoned because looking cost more than the look was worth.
|||
Owed at M8. vp-rigor-without-toil now carries the pass line: every surface request inside a second, and no answer a host must move to disk.

## Notes

THE LAST SLIDE IS THE POINT AND IT IS THE ONE NOTHING MEASURES.

The first four slides are measured. A person deciding to look less is not,
and it leaves no record at all.

That is why the value prop's criterion is written against the SURFACE
rather than against the person. A surface that answers inside a second
cannot produce the last slide.
