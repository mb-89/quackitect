---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: fn-run-a-governed-walk.resolve-the-view
type: "[[function]]"
cluster: the-account
statement: resolve the standing position down to what each widget shows, so that whatever draws it derives nothing
satisfies:
  - req-panel-shows-the-machine
  - req-controls-draw-from-their-spec
  - req-filter-draws-only-what-serves
inputs:
  - flow-position
  - flow-trace-graph
  - flow-filter
outputs:
  - flow-view-model
controls:
  - the filter, which decides what is resolved at all
source_refs:
  - raid-the-surface-repeats-a-computed-view-behind-a-guard
  - opt-the-surface-is-a-dumb-repeater
---

## Rationale

RESOLVING IS NOT DRAWING, and the two fail differently. A view resolved
correctly and drawn badly is unusable. A view drawn beautifully from a wrong
resolution is worse, because it looks right.

THE FLOW BETWEEN THEM HAD NO OWNER, which is how this function was found.
[[flow-view-model]] was minted with an interface carrying it from
[[el-view-resolver]] to [[el-mirror]], and both elements implemented
[[fn-run-a-governed-walk.show-where-it-stands]]. A flow whose two ends sit
inside ONE function can never close, because closure is a relation between two
functions. The check said so, and it was right: the structure was missing a
node, not the flow.

WHY IT IS ITS OWN FUNCTION RATHER THAN A PART OF SHOWING. The element's whole
discipline is that a widget may not reach around the model — a field the model
does not carry is a gap in the model, never an invitation to derive one on the
far side. That discipline is only checkable if resolving is answerable
separately. Folded into showing, there is no boundary for a widget to reach
around.

## What it does not own

THE DRAWING IS [[fn-run-a-governed-walk.show-where-it-stands]]. That function
consumes this one's output and puts it in front of a person. It still consumes
raw flows too, because the page has parts that resolve on the far side yet.
Narrowing it to the view model alone is finished work, not a claim to make now.

THE PAINT CLASS CROSSES THIS BOUNDARY DELIBERATELY. It is a decision about what
a green means rather than a rendering, and one place deciding it is why two
surfaces agree.
