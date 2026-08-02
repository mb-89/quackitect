---
kind: voice-row
row: ste-dictionary
statement: Every content word is in the approved list or defined in the glossary.
tier: one
brief: must@write
refusal: must@write
note: should@write
answer: should@write
guidance: must@write
record: should@review
document: should@review
---

# STE dictionary

The controlled-vocabulary check. A token is legal when it is one of:

- a word in the basic list (NGSL, 2,809 words, about 92% coverage of
  general English, Creative Commons and lemmatised)
- a term defined in our own glossary
- skipped by shape: a code span, a path, an identifier, a number

Everything else is an undefined term and gets reported.

## Why this is tier one

It is a Set lookup per token after lemmatising. No language processing, so
it costs microseconds and can refuse at write time.

## The noise problem, which is the real work

92% coverage means 8% of tokens fall through — roughly 80 flags on a
thousand-word document before anything filters. Nearly all of that is
inflection, proper nouns, code and paths. v2's `engine/termlint.ts` carried
a NOISE set for the same reason and only ever looked at abbreviations.

Suppression is what decides whether this check is used or ignored. Build it
with the check, not after.

## record, document

`review` rather than `write`, because a long text has many terms and a
writer mid-record should not be stopped for each one.

## What still needs the licensed half

Two rules need the licensed dictionary, and a frequency list cannot supply
either. Both are approved and unapproved PAIRS.

- Synonym blocking. STE approves "make sure" and refuses its synonyms.
- One part of speech per word.

That becomes its own row when we have it.
