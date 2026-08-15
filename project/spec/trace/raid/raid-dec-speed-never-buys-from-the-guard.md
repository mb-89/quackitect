---
minted_in: i12-performance-hold-the-one-second-rule-on-
id: raid-dec-speed-never-buys-from-the-guard
type: "[[raid]]"
kind: decision
statement: Speed is bought inside the guard, never from it.
owner: the adjudicator
trigger: a change in this record buys wall clock by removing a check, shortening an answer, or landing a fix with no before-and-after
status: decided
impact: Without this ruling the three cheapest wins in the record all destroy something. Each would show as pure gain in the wall clock and pay for it somewhere nothing measures.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - req-call-answers-in-one-second
  - i12-performance-hold-the-one-second-rule-on-
  - raid-asm-battery-timings-measure-work
---

## Why it was forced

Three goal conflicts were named at draft-vision, and each one has an
obvious cheap answer that looks like progress.

- Halve the battery by running less of it.
- Stop the pull overflowing by sending less of the form.
- Skip the measurement detour and fix what the ranking already names.

All three buy wall clock. All three pay with something the wall clock
does not show.

## Rejected options

THIN THE BATTERY. Rejected. The saving is real and the cost is invisible:
the guard stops proving what it proves today, and nothing in the run
output says so. v1 faced the same choice and chose a bounded worker pool
over a thinner test set.

CUT THE ANSWER. Rejected. A truncated answer is worse than a slow one,
because a slow answer announces itself and a cut one does not. The
standing ruling is that the pull PAGINATES, and paging keeps the whole
answer reachable.

FIX ON THE RANKING AS IT STANDS. Rejected. The ranking is derived from
contended durations, so a fix chosen from it is a guess wearing a
measurement's clothes. The detour costs one reporter argument.

## Consequences

Every later state in this record is bound by this.

- A change that lowers the case count owes an explanation, not a
  celebration.
- A smaller pull answer must stay complete and reachable by page.
- No performance fix lands without a before-and-after taken from a
  scoped run that records its timings.

A state that buys speed the cheap way is contradicting a ruled conflict.
It is not making a fresh trade-off, and it does not get to re-argue this
without superseding the entry.
