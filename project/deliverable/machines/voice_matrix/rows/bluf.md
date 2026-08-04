---
kind: voice-row
row: bluf
statement: The verdict in one sentence, before any options or reasoning.
tier: two
brief: none
refusal: must@write
note: should@review
answer: must@review
guidance: should@review
record: must@review
document: must@review
---

# BLUF

Bottom line up front. The method card holds the depth:
`project/deliverable/machines/methods/bluf.md`.

## brief

Struck. A brief is one line, so it is all bottom line.

## refusal

`must@write`, and it is the one cell here a machine can check cheaply. A
refusal's shape IS bluf. It leads with the clause and carries the expected
and got beneath it. The check is that the four named fields are present and
non-empty, which the lane already enforces.

## Why the rest is tier two

Deciding whether a first paragraph states the verdict needs to understand
the text. A lint can flag a missing summary section in a long document; it
cannot judge whether a sentence is the bottom line.

So the honest cells are `review`, where a person or an agent reads it.
