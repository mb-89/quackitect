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
