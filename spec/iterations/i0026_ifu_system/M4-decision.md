# M4 - Decision (i0026_ifu_system)

## Chosen architecture stated -> i26-m4-chosen-architecture-stated

The architecture is:
- markdown deck manifests remain the slideshow source.
- `kind: ifu` classifies a deck as an IFU.
- guide rows with `kind: ifu` make IFUs findable in chapter 10.3.
- the document overview lists decks as derived documents.
- `coverage:ifu-usecases` checks the source deck bodies at M8.

## Choice traced to weighted criteria -> i26-m4-choice-traced-to

The chosen architecture is candidate B from M3. It wins on renderer reuse and source editability. It also enables deterministic coverage without a new document type.

## Views chosen -> i26-m4-views-chosen-model

No structural model was needed. The design is a small extension to existing lanes:
- deck manifest source.
- guides table discovery.
- views-home derived-documents table.
- coverage rule dispatcher.
- bless write path.

## Structuring method considered -> i26-m4-structuring-method-considered

DSM or DMM methods were not useful. The parts are existing code lanes with low coupling. The split is obvious enough to record without matrix work.

## Architecture model ready -> i26-m4-architecture-model-ready

The architecture view is textual and direct:
- `book.go` owns deck and guide rendering.
- `coverage.go` dispatches `ifu-usecases`.
- `i26_hygiene.go` computes IFU use-case coverage.
- `ops.go` refuses bless shortcuts.
- markdown deck and guide files carry the authored IFU source.

## ADR recorded and traced -> i26-m4-adr-recorded-and

`adr-ifu-kind` records the decision. It addresses the IFU source, discovery, and use-case index requirements.

## Milestone review -> i26-m4-gate

Verify: the choice, criteria trace, view, structuring decision, and ADR are recorded. Validate: the design matches the owner's model of IFU as slideshow-guide. Red-team: the architecture relies on source text containing use-case IDs. That is acceptable because the final slide is explicitly the coverage index. Verdict: PASS.
