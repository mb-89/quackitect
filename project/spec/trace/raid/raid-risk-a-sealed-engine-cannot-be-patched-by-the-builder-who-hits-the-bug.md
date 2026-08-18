---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-risk-a-sealed-engine-cannot-be-patched-by-the-builder-who-hits-the-bug
type: "[[raid]]"
kind: risk
statement: The seal that makes an update safe also means a builder who hits an engine bug cannot fix it in place, and nothing tells them what to do instead.
owner: the owner
trigger: the first builder outside this house who hits an engine defect that blocks their work
status: decided
breaks_how_badly: corrosive
how_likely: expected
impact: "A blocked builder with no sanctioned repair does the unsanctioned one: they edit the vendored folder. That silently converts their next update into a merge, which is the exact failure the seal exists to prevent. The seal does not stop the edit — it only makes the edit destructive later, and nobody is warned at the moment it happens."
source_refs:
  - req-nothing-a-copy-does-reaches-its-source
  - raid-dec-the-seal-outranks-the-overlay
  - "i16 pressure-test — the hostile FAQ question that had no clean answer"
---

## Where it came from

THE PR-FAQ AT i16's pressure-test, which asks the hostile questions before the
expensive walk. This one had no clean answer, so it folds back here rather than
being smoothed over in the FAQ.

THE QUESTION, in a builder's words: "You have sealed the engine so I cannot
edit it. I have just hit a bug in it that blocks my work. What am I supposed to
do this afternoon?"

## Why the obvious answers are not enough

WAIT FOR UPSTREAM. Honest, and useless to somebody blocked today. It also makes
adoption depend on our response time, which is a promise nobody here has made.

OVERRIDE IT IN THE OVERLAY. Works only where the bug is in a CARD. A defect in
engine CODE — a refusal, a lane verb, a resolver — is not a document an overlay
can replace, and req-overlay-resolution's scope is guidance, method cards and
rigor rows.

FORK. It is the thing this whole value prop exists to remove.

EDIT THE VENDORED FOLDER ANYWAY. This is what will actually happen, and it is
the dangerous one: it works today, breaks at the next update, and nothing warns
at the moment of the edit.

## What would reduce it, as options rather than a recommendation

- A DRIFT CHECK THAT LOOKS INWARD. The overlay drift report says what the
  builder's cards no longer resolve to. The mirror image — what in the engine
  folder no longer matches what shipped — would catch the edit at the next
  update and name it, instead of silently discarding it.
- A SANCTIONED PATCH LANE, where a builder's fix is recorded as a patch against
  a named engine version rather than as an edit. That is more machinery than
  this iteration should take on, and it is worth writing down as the shape a
  later record might build.
- SAYING SO PLAINLY IN THE ENTRY DOCUMENT. The cheapest of the three: the seal
  is a promise about updates, and the price is that engine defects go upstream.
  A builder who knows that at the start is not ambushed by it.

## Why it is a risk rather than an issue

NOBODY HAS HIT IT, because no builder outside this house has ever run the
engine. It becomes an issue the first time one does.

## DISCHARGED 2026-08-18 — the premise is gone

THIS RISK ASKED WHAT A BUILDER DOES WHEN A SEALED ENGINE BLOCKS THEM. Nothing
is sealed. The owner ruled on 2026-08-18 that a vehicle owns everything it
carries and may change all of it, so a builder who hits a defect fixes it, in
place, in their own copy, on the same afternoon.

THE HOSTILE FAQ QUESTION THAT RAISED IT NOW HAS A GOOD ANSWER, which is the
best outcome an entry like this can have.

WHAT THE QUESTION SURFACED IS STILL TRUE AND HAS MOVED, rather than being
dropped with the risk. The builder's fix now lives only in their copy, and
whether it ever reaches the parent is the OTHER half of this iteration — goal 4
of the vision, improvements travelling both ways. The owner's answer to that:
"if I have a process that analyzes the changes and pushes them back as notes as
design input to the vendor, that's okay."

SO THE FEAR WAS REAL AND POINTED THE WRONG WAY. It feared a builder who could
not fix their own copy. The live question is a builder whose fix cannot travel.

STATUS IS `decided` RATHER THAN DELETED, following the precedent of
raid-debt-the-bound-surface-demo-leans-on-two-open-records: the thing it waited
for was cancelled, so it carries no claim and blocks nothing, and it stays as
history.
