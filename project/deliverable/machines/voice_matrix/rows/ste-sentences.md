---
kind: voice-row
row: ste-sentences
statement: Active voice and simple tenses, with length capped by the kind of text.
tier: two
brief: none
refusal: must@review
note: should@review
answer: should@review
guidance: must@review
record: should@review
document: should@review
---

# STE sentences

ASD-STE100's core sentence rules, minus its dictionary.

- Active voice, with narrow exceptions.
- Simple tenses. No present perfect: write "we received", not "we have received".
- One thought per sentence.
- 20 words for a procedure, 25 for description. `voice.md` asks for 15,
  which is tighter, and the tighter number wins where both apply.
- Imperatives in procedures. An instruction is a direct command.

## brief

Struck. A brief is one line of 90 characters, already capped, and it is a
fragment rather than a sentence.

## refusal

A refusal is read under load by someone whose walk just stopped. It is the
strongest case for active voice and a simple tense in the whole system.
`review` rather than `write` only because tense detection needs a tagger.

## guidance

THE HARDEST BINDING IN THE ROW, deliberately. State guidance and tool
descriptions are read on every visit, by every agent, forever. A tense that
makes a reader pause here is paid for thousands of times.

It stays at `review` rather than `write` for one mechanical reason. This row
is tier two, so the cell waits on a part-of-speech tagger. The word cap is
tier one and could refuse at the write today, but a cell carries ONE word, so
moving it would drag the tagger checks to the write with it.

SPLITTING THE COUNTABLE HALF into its own tier-one row is what would let the
cap refuse immediately. Worth doing when the cap is what keeps being broken.
Not worth a second row before then.
