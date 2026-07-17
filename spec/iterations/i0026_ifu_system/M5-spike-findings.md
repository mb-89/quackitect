# M5 - Spike Findings (i0026_ifu_system)

## Riskiest assumptions validated -> i26-m5-riskiest-assumptions-validated

The riskiest assumptions were:
- `kind` is allowed by strict load.
- markdown deck manifests already render as slides.
- guide rows can keep IFUs findable.
- source-text coverage is enough for M8.

Evidence:
- strict graph queries loaded `man-deck-ifu-map`, `guide-ifu-map`, and the new M8 coverage task.
- `go test .` passed after adding `ifuCoverageMissing`.
- the build passed after retrying the cold-start budget path.

## Design is buildable -> i26-m5-design-is-buildable

The build needs only small changes:
- add `kind: ifu` metadata.
- add guide rows.
- add an IFU map deck.
- add `coverage:ifu-usecases`.
- keep the bless preflight guard inside the active iteration.

## Spike results recorded -> i26-m5-spike-results-recorded

The spike result is adopted. The IFU map deck is the first coverage deck. The final slide is intentionally link-dense and the teaching slides stay short.

## Milestone review -> i26-m5-gate

Verify: assumptions were validated against live parser and package tests. Validate: no new document type is needed. Red-team: one IFU map deck can become a dumping ground. The M8 check will expose missing coverage, and future IFUs can split the map by workflow. Verdict: PASS.
