---
minted_in: i8
id: raid-debt-checklist-panel-lacks-owed-state
type: "[[raid]]"
kind: debt
statement: The checklist editor's panel UI (engine/editors/checklist.ts) has no third visual state for an owed box - a person clicking in the panel cannot see or set one, and an owed line already on disk renders indistinguishable from a genuinely unchecked box.
owner: the owner
trigger: the owner reviews the panel's checklist rendering and decides the visual state and the ref-entry affordance
status: open
looked: 2026-08-18
impact: A returning person reading a checklist field in the panel cannot tell an owed item from an unchecked one by looking - the distinction only shows in the raw markdown. The mechanism (engine/stateform.ts checklistItemStatus, the "- [owed] <item> - <ref>" line form) is fully functional for an agent writing it directly through a form fill; only the panel's own render/collect JS was not extended.
breaks_how_badly: abrasive
how_likely: expected
source_refs:
  - project/deliverable/engine/editors/checklist.ts
  - project/deliverable/machines/forms/templates/checklist.md
---

Found during i8's M8 sweep-consistency pass, surface class "panels and
form help." The owed-checkbox mechanism (owner ruling 2026-08-13) was
built and tested at the engine level this iteration; the panel's own
render function still checks only `"- [x] " + it` and shows every other
line as an empty, clickable checkbox - clicking one would overwrite an
owed line with a plain checked/unchecked toggle, silently discarding the
ref.

Not fixed here: ux.md's own rule is to stay very close to a drawing, and
none exists yet for a three-state control with a ref-entry field. The
right shape (a third click-state, how the ref gets typed or picked, how
an invalid ref is shown) is the owner's call, not one to improvise.
Closes when the panel gets its own sketch and the render/collect pair is
extended to match it.

## Swept 2026-08-15, at i12's retro: RE-ACCEPTED, and it is now load-bearing

WHEN IT WAS WRITTEN the owed state was rare. i12 wrote FIVE owed boxes in one
verification form and a sixth at its validation gate, and every one of them
renders in the panel indistinguishable from a box nobody has answered.

IT GETS HEAVIER AGAIN with the rule added to M7_50_verification this retro: a
spec owed against an open debt entry will arrive PRE-FILLED as owed. That
makes the owed state the normal case for those boxes rather than the
exception, and a panel that cannot draw it will be wrong on most of the list.

THE OWNER'S OWN WORDS AT THIS RETRO point the same way: "the checklist should
take a verdict — it could take an optional verdict, I think we already have
an editor for that." Whether that editor exists is unchecked and is the first
question when this is picked up.

## Swept 2026-08-18, at i16's onboard-retro: RE-ACCEPTED, and its first question is answered

THE TRIGGER HAS NOT FIRED. It waits on the owner reviewing the panel's
checklist rendering and deciding the visual state, and no such sitting has
happened.

THE ENTRY'S OWN FIRST QUESTION IS NOW SETTLED, so whoever picks this up does
not start with it. The owner asked whether an editor that takes a verdict
already exists. There are 19 editors under engine/editors and none is named for
a verdict, but engine/editors/compare-card.ts does exactly the job — it posts
each verdict as its own act from a button. So the affordance exists and the
question is whether the checklist reuses it, not whether it has to be invented.

The trigger stands unchanged.
