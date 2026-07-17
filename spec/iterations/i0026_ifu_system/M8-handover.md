# M8 - Handover (i0026_ifu_system)

## Docs complete -> i26-m8-docs-complete-match

The visible docs match the surface:
- Pong is titled as an IFU.
- The IFU map is a deck.
- Guide rows include IFU in the title.
- Chapter 2's derived documents table lists deck statements.

## Packaged and versioned -> i26-m8-packaged-versioned

`quack ship` packages product/ with the fresh book and report. It runs immediately after this gate's bless, per the ship rule.

## Configuration baselined -> i26-m8-configuration-baselined

The engine was rebuilt and the golden root re-baselined after the Go changes.

## Handover accepted -> i26-m8-handover-accepted

Pending owner review at M8.

## IFU use-case coverage -> i26-m8-ifu-usecase-coverage

The executed check is `coverage:ifu-usecases`. It reads `kind: ifu` deck manifests and requires every loaded use case ID to appear in at least one IFU deck source.

## Milestone review -> i26-m8-gate

Prepared for owner review. Do not ship until the owner accepts M8.
