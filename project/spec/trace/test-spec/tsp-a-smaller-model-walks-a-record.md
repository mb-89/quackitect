---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: tsp-a-smaller-model-walks-a-record
type: "[[test-spec]]"
statement: A cheap model drives a record from what the machine's own pulls say alone, stopping cleanly at the first state that needs judgment it cannot supply, verified by demonstration on a real walk.
method: demonstration
demonstrates:
  - sty-a-smaller-model-walks-a-record
verifies:
  - "none — demonstrates: sty-a-smaller-model-walks-a-record carries the edge; uc-walk-a-record-on-a-smaller-model has no requirements of its own, since nothing in the mechanics differs from an ordinary walk"
files:
  - none — the procedure below is the definition; the observed run is the evidence
---

## Scope

A record walked start to gate by a model chosen for its price rather than
its judgment. Nothing in the mechanics differs from an ordinary walk
([[uc-walk-a-record-on-a-smaller-model]]); what is under test is whether a
model that infers nothing can still complete it from the pull's own words.

## Approach

System level, driven end to end by a genuinely cheaper/smaller model than
the one this record was otherwise walked on — not merely a capable model
asked to act as if it were smaller. OWED: this test-spec is minted with its
procedure defined; no such run has been performed. The gap is named at
[[raid-issue-smaller-model-demo-owed]] rather than hidden.

## Procedure

- Start the walk on the smaller model with a record queued. Observe: every
  mechanical pull is followed exactly from what it says, with no invented
  action filling a gap the pull left open.
- Hit a name in an answer that does not resolve. Observe: the model hunts
  for it with a list, a glob and a read rather than guessing.
- Reach a refusal. Observe: the model follows the printed remedy rather
  than reasoning about why it was refused.
- Reach a state that needs judgment the model cannot supply. Observe: the
  model reports the waiting step plainly and stops, rather than producing
  a plausible but ungrounded answer.
- Across the whole run, observe: the model's own account of what happened
  (signed, refused, blessed) matches the machine's own record at every
  point checked.
