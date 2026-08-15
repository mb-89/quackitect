---
minted_in: i3-the-walk-s-feedback-loop-the-reading-cre
id: raid-asm-an-omit-is-authored-honestly
type: "[[raid]]"
kind: assumption
statement: A field marked as not-asked at a change size was marked because that size genuinely cannot answer it, not because the question was inconvenient. The engine cannot tell the two apart, and nothing checks it.
owner: the maintainer
trigger: the next row that gains an omit, or the first form that felt too short to sign honestly
status: open
impact: A question that mattered stops being asked, silently and for good. Unlike a struck state, which is visible as a gap in the walk, a dropped field leaves a form that looks complete.
breaks_how_badly: corrosive
how_likely: conceivable
probe: "unprobed. Two rows carry an omit and both were authored in the same hour as the mechanism, so they are not independent evidence."
probed: "2026-08-13"
source_refs:
  - "engine/machine.ts, EvidenceField.omit — absent means asked everywhere"
  - "engine/rigor-matrix.ts rowState, the column filter"
  - "machines/rigor_matrix/rows/M1_10_draft-vision.md, three fields omitted at minor"
  - "machines/rigor_matrix/rows/M1_30_frame-delta.md, two fields omitted at minor"
---

## The claim

Before 2026-08-13 a rigor cell could only keep a state or strike it. "Keep it
but ask less" was prose in a note, and the trim was a judgment the walker made
fresh each time.

The owner ruled that the trim must be mechanical. It now is: the row names the
sizes that do not ask a field, and the engine drops it.

That moves the judgment from the walker to the row author, once, where it can
be reviewed. That is the gain.

## What the engine can and cannot catch

It catches three mistakes:

- An omit naming something that is not a change size.
- A field omitted at every size, which means nothing ever asks it.
- A work state trimmed to zero fields, which is striking the state quietly.

It cannot catch the one that matters: a field dropped at a size that could
have answered it.

## Why the default is the mitigation

Absent means ASKED EVERYWHERE. A key nobody wrote never deletes a question, so
the failure needs a deliberate wrong edit rather than an oversight.

That is why this is `unlikely` rather than `plausible`.

## Probe

At the next retro, take every row carrying an omit and ask one question of
each dropped field: could an iteration of that size have changed the answer?

Where the answer is yes, the omit is wrong and comes off.

Where a row's omit was added to make a form shorter rather than because the
size cannot answer it, that is the failure this entry names, and it is the row
author's mistake rather than the mechanism's.
