---
minted_in: i8-se-help-a-logged-keyword-search-over-the
id: raid-debt-checklist-panel-lacks-owed-state
type: "[[raid]]"
kind: debt
statement: The checklist editor's panel UI (engine/editors/checklist.ts) has no third visual state for an owed box - a person clicking in the panel cannot see or set one, and an owed line already on disk renders indistinguishable from a genuinely unchecked box.
owner: the owner
trigger: the owner reviews the panel's checklist rendering and decides the visual state and the ref-entry affordance
status: open
looked: 2026-08-14
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
