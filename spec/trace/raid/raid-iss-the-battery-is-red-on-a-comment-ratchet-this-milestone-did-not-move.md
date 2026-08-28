---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-iss-the-battery-is-red-on-a-comment-ratchet-this-milestone-did-not-move
type: "[[raid]]"
kind: issue
statement: The full battery is red at the requirements gate. Comment lines carrying a date or an owner attribution stand at 207 in the test tree against a ceiling of 204, and this milestone wrote no file there.
owner: the maintainer
trigger: the next gate that runs the battery, and any attempt to land work while the ratchet stands above its ceiling
status: open
impact: A gate cannot tell a red it caused from a red it inherited, so every later gate either carries this one forward or spends the time re-deciding that it is not theirs. Left standing it also disarms the ratchet in practice, because a check that is always red stops being read.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - "measured 2026-08-26 at i63/gate-requirements: 1861 tests, 1859 pass, 2 fail, both in deliverable/tests/comment-rule.test.ts"
  - req-red-is-never-carried
---

## What the run actually said

THE BATTERY RAN WHOLE, because 96 distinct files would have run piecemeal
since the last one and the suite became the cheaper call.

- 1,861 tests, 1,859 passing, 2 failing.
- Both failures are the comment-attribution ratchet over `deliverable/tests`.
- The count stands at 207 against a ceiling of 204.

WHAT IS GREEN, and it is the half that matters for this milestone. The
conformance sweep passed over 3,102 nodes in 1,394 ms, with markers green and
the widget guard green. Preflight passed. The formatter passed.

## Why it is not this milestone's red

THIS MILESTONE WROTE NO FILE UNDER `deliverable/tests`. What it wrote is
corpus nodes under `spec/trace/` and evidence forms under the record's own
folder, and the check that reads those is the sweep, which is green.

THE RATCHET WATCHES TWO TREES since the 2026-08-25 overhaul, which is the
change that made the test tree's own count visible. The offenders it lists are
spread across more than twenty test files, none of them touched here.

## Why it is graded expected rather than plausible

THE CONDITION ALREADY HOLDS. The count is above the ceiling right now, in the
working tree, and nothing about waiting changes it.

## What closes it

EITHER THE THREE OFFENDING COMMENTS GO, or the ceiling is raised deliberately
by whoever owns that debt. The ratchet's own rule is that the count may fall
freely and may never rise, so raising it is a decision somebody has to make
out loud rather than a repair.

WHAT MUST NOT HAPPEN is the next gate reading a red battery and passing over
it without noticing that the red is older than the work being judged.
