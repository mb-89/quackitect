---
minted_in: i1
id: req-answer-recorded-with-question
type: "[[requirement]]"
statement: When a person's direct question is answered, the engine shall record the question and its answer as two separate fields in one log entry.
kind: functional
verify_method: test
breaks_if_removed: The answer lives only in chat and a lost turn erases it.
breaks_how_badly: crippling
refines:
  - uc-research-and-record-an-answer
source_refs:
  - uc-research-and-record-an-answer step 5
  - uc-research-and-record-an-answer ext 5a
priority: must
---

## Detail

## Detail

- The question and the answer are separate fields of one entry.
- The chat prints the same recorded text verbatim. No second version is composed.
- Source links ride the recorded copy.
- A chat turn lost mid-work leaves the recorded copy standing.
