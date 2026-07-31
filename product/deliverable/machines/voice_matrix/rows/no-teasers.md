---
kind: voice-row
row: no-teasers
statement: Lead with the thing. No opener that rates the news before delivering it.
tier: one
brief: must@write
refusal: none
note: should@write
answer: must@write
guidance: should@write
record: should@write
document: must@write
---

# No teasers

`voice.md` calls this its most-broken rule and says outright that being
broken again means it wants a lint rather than another sentence. This row
is that lint.

The mechanical half is a banned-opener list matched against the first
sentence of a text or a section:

- rating the news: "the interesting part", "this changes everything"
- announcing the message: "two things here", "before I answer that"
- agreement preamble: "fair point", "good catch", "you're right to ask"

## Why tier one

A prefix match on the first sentence against a phrase list. No parsing.

## refusal

Struck. A refusal is four named fields with no opener to speak of.

## The half a lint cannot reach

Whether a first sentence carries information is judgement. The list catches
the recurring forms, which is where the rule actually breaks.
