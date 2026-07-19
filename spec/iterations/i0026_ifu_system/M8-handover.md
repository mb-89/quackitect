# M8 - Handover (i0026_ifu_system)

## Docs complete -> i26-m8-docs-complete-match

The visible docs match the surface:
- Pong is titled as an IFU.
- Guide rows include IFU in the title.

## Packaged and versioned -> i26-m8-packaged-versioned

`quack ship` packages product/ with the fresh book and report. It runs immediately after this gate's bless, per the ship rule.

## Configuration baselined -> i26-m8-configuration-baselined

The engine was rebuilt and the golden root re-baselined after the Go changes.

## Handover accepted -> i26-m8-handover-accepted

The owner accepts the IFU mechanism pass as built. The content pass (real user-story decks, per the HANDOVER.md critique) is planned for the next iteration together with the carried book review findings.

Closeout verification on the resume machine surfaced a real regression: `quack status` had grown past the one-second warm-cache bound (2.6 s live; the graph reached 2401 nodes). Fixed in the bugfix lane inside this iteration:

- Red observed for `test-status-fast` and `test-responsive-status` before the fix.
- Cause: per-call re-work inside the coverage rules. `iterOf` recomputed a path split per node per rule and scope. `attestEvents` re-parsed the whole append-only ledger per `tests-red` scope.
- Fix: both memoized per process. `saveEvents` writes through the memo. No semantic change.
- Result: warm `StatusMap` 1180 ms -> 581 ms on a 2013 desktop, under the bound with margin below the reference machine (a 2025 mid-range laptop, per the responsiveness guide). Live `quack status` 2610 ms -> 1904 ms.
- The full battery re-ran at the fixed build: 220 verdicts, all green.

## IFU use-case coverage -> i26-m8-ifu-usecase-coverage

The executed check is `coverage:ifu-usecases`. It reads `kind: ifu` deck manifests and requires every loaded use case ID to appear in at least one IFU deck source.

## Milestone review -> i26-m8-gate

Prepared for owner review. Do not ship until the owner accepts M8.
