---
minted_in: i5-engine-hygiene-one-version-source-every-
id: req-an-empty-live-source-names-itself
type: "[[requirement]]"
statement: When a form field's live source resolves to no items, the engine shall render text naming that source in place of the empty control.
kind: functional
verify_method: test
breaks_if_removed: A wired-up field over an empty source is indistinguishable from a field nobody wired up, so the offer that resolves to nothing is invisible.
breaks_how_badly: corrosive
measure: 1 rendered line naming the source, for a field whose source returns zero items.
refines:
  - uc-take-a-step
source_refs:
  - "engine/stateform.ts: resolveSource throws on an unresolved $name, which is the typo case only"
  - "note-306a7034f873: a per-item field over an empty source falls through to a plain textarea"
priority: should
---

## Detail

TWO FAILURES LOOK THE SAME TODAY, and only one of them is already caught.

| case | today | wanted |
| --- | --- | --- |
| the source name is a typo | throws, naming the resolver | unchanged |
| the source resolves and returns nothing | renders as a plain field with no offer | says so, naming the source |

THE SECOND IS THE DANGEROUS ONE because it reads as a design decision. A
reader sees a field with no options and concludes the field was never meant to
have any.

THE SAME SILENCE ONE CLASS WIDER, named here so the fix is not scoped too
narrowly: a dependency matrix over no functions draws an empty grid, and a
comparison over an empty pool reports every pair settled. This row governs the
form field, and the wider family is left out of this record deliberately.

## Behaviour

None wanted.
