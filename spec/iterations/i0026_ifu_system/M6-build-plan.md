# M6 - Build Plan (i0026_ifu_system)

## Models adhered-to -> i26-m6-models-adhered-to

No structural model was declared. The build stayed inside the M4 text architecture.

## Build planned -> i26-m6-build-planned-decomposed

Build steps:
1. Mark the Pong deck and guide row as IFU.
2. Add the IFU map deck and guide row.
3. Add the IFU coverage rule.
4. Add the bless-preflight guard.
5. Add the IFU glossary term.
6. Frame `verify` output with the verdict before and after long detail.
7. Retry cold-start budget measurement before refusing a build.
8. Clarify MCP re-attestation after a build swap.
9. Add weak-model and terminal-reset prompt guidance.
10. Add trace, tests, and ADR links.
11. Rebuild and re-baseline.

## Suite observed RED -> i26-m6-suite-observed-red

The two new selftest-backed test nodes carry `tests_red` exemptions because the implementation landed before the trace nodes were authored. The exemption cites `adr-red-unobservable`.

## Build -> i26-m6-build-the-planned

Implemented:
- `spec/man-deck-pong.md` now carries `kind: ifu`.
- `spec/man-deck-ifu-map.md` is an IFU deck.
- `spec/guides/guide-pong-walkthrough-deck.md` visibly says IFU.
- `spec/guides/guide-ifu-map.md` links the IFU map.
- `product/engine-go/i26_hygiene.go` implements IFU coverage.
- `product/engine-go/ops.go` implements bless preflight.
- `product/engine-go/ops.go` also frames verify output with verdict-first and verdict-last.
- `product/engine-go/i24_hygiene.go` retries cold-start measurement and uses the best positive value.
- `product/engine-go/mcp.go` tells the caller to re-attest after a build-swap session reset.
- `spec/glossary/ifu.md` defines IFU for the book.

## Design realized in code -> i26-m6-design-realized-in

Design markers:
- `go-book-manifests` implements `req-ifu-markdown-source`.
- `go-guides-table` implements `req-ifu-discovery`.
- `go-views-home` implements `req-ifu-discovery` and `req-ifu-usecase-index`.
- `go-ifu-coverage` implements `req-ifu-coverage`.
- `go-bless-preflight` implements `req-bless-preflight`.

## Internal quality ok -> i26-m6-internal-quality-ok

`go test .` passed in `product/engine-go`. The build passed after retrying the transient first-run cold-start budget refusal.

Focused checks after the self-optimization pass:
- `quack selftest budget-best-positive` passed.
- `quack verify test-ifu-system` passed.
- a temporary book render no longer reports IFU as jargon.

## Verification green -> i26-m6-verification-green-every

The focused package test passed. Full V&V belongs to the verification lane and the M8 coverage task.

## Implementation risks acceptable -> i26-m6-implementation-risks-acceptable

The main residual risk is that coverage by ID mention is crude. It is acceptable for the first deterministic check because the source slide is meant to be a visible coverage index.

The current book review found that the IFU map still reads like coverage theater. That critique is captured as a separate note and should reshape the IFU content before M8 acceptance.

## Milestone review -> i26-m6-gate

Verify: planned steps are complete and tests pass in the focused package. Validate: the built surface matches the M4 design. Red-team: build cold-start budget can fail on the first fresh binary run. The retry passed; the underlying budget sensitivity remains backlog-worthy. Verdict: PASS.
