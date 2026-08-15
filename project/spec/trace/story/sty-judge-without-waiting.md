---
minted_in: i12
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
Measured 2026-08-15 at write-stories: /widget/machine answered in 3966 ms, and the root page in 4026 ms. RE-MEASURED AT M8 from the call log, and it did not improve: the root page at 3561 ms (call-62f116ce39ce).

---

Nothing says it is slow. There is no spinner, no toast, and no record anywhere that a look cost four seconds.
|||
The standing guard, req-call-answers-in-one-second, covers a DRIVER'S CALL. No row covered a person's look until this record wrote one.

---

They open the evidence form behind a state. It takes three seconds. They open another. Three seconds again.
|||
Measured 2026-08-15 at write-stories: /widget/details broke the one-second rule on all seven of its requests, between 2720 ms and 3468 ms. RE-MEASURED AT M8 and WORSE: 8284 ms (call-c39befb8e996), 3559 ms (call-12188eb5ed77), 3635 ms (call-b87c53b86a9d).

---

The waiting never appears as cost. The session's minutes are counted as judging, because judging is what the engineer was trying to do.
|||
FILLED AT M8, and the slide is now half wrong. The report exists: se_log_query takes a min_ms filter, described in the tool's own words as "the slowness mine over every door, one-second rule and all". Asking it costs one call and returns 936 standing mirror_slow records. What is still true is the second half — nobody reads it unasked, and no state demands it.

---

The engineer stops opening things. They adjudicate from the form they already have, and skip the two artifacts they would have checked.
|||
FILLED AT M8 AS A FINDING, because it cannot be filled as evidence. A person deciding to look less leaves nothing behind: no request, no record, no row. The 936 mirror_slow records measure the looks that HAPPENED, and this slide is about the ones that did not. It is unfalsifiable from the shipped system by construction, which is why the value prop's pass line is written against the SURFACE rather than against the person.

---

The rigor was not abandoned because it was hard. It was abandoned because looking cost more than the look was worth.
|||
FILLED AT M8, and one half passes while the other does not. vp-rigor-without-toil carries the pass line: every surface request inside a second, and no answer a host must move to disk. THE SECOND HALF HOLDS — the pull paginates and no answer breaks a host, proven repeatedly this record. THE FIRST HALF FAILS, and the M8 figures above are the proof: the surfaces are no faster than they were at write-stories, and one is slower.

## Notes

WHAT M8 SETTLED, and it answers a question this record asked out loud.

raid-asm-slow-surface-is-not-self-contention stands open, and the guess behind
it was that the test fan-out eating every core made the surfaces look slow.
`fanout-cap` landed to leave the engine a core. THE SURFACES DID NOT IMPROVE.
/widget/details answered in 8284 ms after the cap, against 2720 to 3468 ms
before it.

That is not proof the assumption is false — the 8284 ms sample was taken WHILE
a battery ran, which is the contention case rather than the clean one. What it
does prove is that the cap alone does not hold the rule, so the profile the
assumption schedules is still owed.

ONE FIGURE HERE IS NOT A SURFACE AT ALL and is worth naming: /mcp POST at
33461 ms and 12337 ms. That is the lane's own door, not a page, and it is a
larger breach of req-call-answers-in-one-second than anything the story is
about.

THE LAST SLIDE IS THE POINT AND IT IS THE ONE NOTHING MEASURES.

The first four slides are measured. A person deciding to look less is not,
and it leaves no record at all.

That is why the value prop's criterion is written against the SURFACE
rather than against the person. A surface that answers inside a second
cannot produce the last slide.
