---
minted_in: i1
id: req-filter-draws-only-what-serves
type: "[[requirement]]"
statement: When the person filters the trace, the engine shall redraw the view with only nodes serving the filter and zero empty levels drawn.
kind: functional
verify_method: test
breaks_if_removed: The person hunts one node in a thousand-node field; empty levels imply holes that are not there.
breaks_how_badly: corrosive
refines:
  - uc-trace-a-decision-to-its-origin
source_refs:
  - uc-trace-a-decision-to-its-origin step 1
  - uc-trace-a-decision-to-its-origin step 2
  - uc-trace-a-decision-to-its-origin ext 2a
priority: should
weighs_against:
  - req-desk-greets-walkable >
---

## Detail

## Detail

| rule | outcome |
| --- | --- |
| node serves the filter | drawn |
| node outside the filter | not drawn |
| level empty under the filter | absent entirely, never drawn empty |
