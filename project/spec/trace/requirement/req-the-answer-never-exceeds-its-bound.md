---
minted_in: i27
id: req-the-answer-never-exceeds-its-bound
type: "[[requirement]]"
statement: The engine shall keep every lane answer within a declared size bound, serving anything larger by reference with an offset and a limit.
kind: quality
fitness_candidate: true
characteristic: interaction-capability
verify_method: test
breaks_if_removed: The host moves the answer to disk and the caller works blind, so a refusal's reason becomes unreadable exactly when it is needed.
breaks_how_badly: crippling
refines:
  - uc-quality-interaction-capability
source_refs:
  - uc-take-a-step
  - "measured: 236KB on 2026-08-11, 240KB the same window, 281KB on 2026-08-13"
  - "owner ruling 2026-08-11, stated twice: the pull never overflows, it paginates"
priority: must
---

## Scenario

- Source: any caller at the lane.
- Stimulus: a call whose natural answer exceeds the bound.
- Artifact: the serving engine.
- Environment: normal operation, any host.
- Response: an answer within the bound, carrying a reference to the rest.
- Response measure: no answer exceeds the declared bound, on any call,
  on any host.

## Detail

IT IS GETTING WORSE AND MECHANICALLY SO. The form payload carries every
template's text and every box for every field, so an answer grows with
the field COUNT regardless of what was filled.

THE RECOVERY IS CHEAP ONLY WHILE THE QUESTION IS CHEAP. Did it sign is
answerable from the evidence file. A REFUSAL offers no such door: its
reason sits inside the payload nobody can read.

## Both halves, on the owner's ruling of 2026-08-13

- SPLIT THE SOURCES so guidance, forms and templates come in chunks
  small enough to pull whole, with sub-indexing where a file must split.
- KEEP THE MECHANISM as the floor that guarantees no answer can overflow
  whatever the sources look like.

Not one instead of the other. Pagination alone still assembles the whole
thing and then cuts it. Splitting alone has no answer for a chunk that
is still too big, or a caller who legitimately wants many at once.

## The cheapest half first

A SUBMIT'S ANSWER NEEDS ALMOST NOTHING - whether it signed, and what
refused it if it did not. Serving the whole form back on a successful
submit is the largest single waste in the payload.

## Behaviour

No model wanted. One bound, checked at one seam.
