# M2 - Inputs (i0026_ifu_system)

## Inputs captured -> i26-m2-inputs-captured-context

Sources:
- Owner field input from this chat.
- Existing Pong deck: `spec/man-deck-pong.md`.
- Existing guide row: `spec/guides/guide-pong-walkthrough-deck.md`.
- Document overview: `spec/man-ch0-orientation.md`.
- Guide table renderer: `product/engine-go/book.go`.
- Loaded graph query: 87 existing use cases before i26.

New content input:
- `uc-find-ifu`.
- `uc-author-ifu`.
- `uc-ifu-coverage`.

## Stakeholder coverage -> i26-m2-stakeholder-coverage-no

- Newcomer: sees the Pong IFU as the first workflow route.
- User: sees the IFU map from the guide table.
- Owner: edits markdown deck sources in Obsidian.
- Agent: gets a deterministic M8 coverage failure when use cases are not linked.
- Maintainer: keeps one deck renderer and one guide table.

## Prior art checked -> i26-m2-prior-art-checked

IFU/eIFU practice supports the term and the electronic delivery model. The lesson adopted here is discoverability and coverage, not regulatory formatting. Plain-language practice supports short workflow-specific content, clear headings, and testable understanding.

## Requirements verifiable -> i26-m2-requirements-verifiable-every

Every i26 requirement has at least one test edge:
- `test-ifu-system` verifies `req-ifu-markdown-source`.
- `test-ifu-system` verifies `req-ifu-discovery`.
- `test-ifu-system` verifies `req-ifu-usecase-index`.
- `test-ifu-system` verifies `req-ifu-coverage`.
- `test-bless-preflight` verifies `req-bless-preflight`.

## Requirements traced -> i26-m2-requirements-traced-every

Every i26 requirement refines a use case:
- IFU source and discovery refine IFU authoring and finding.
- IFU index and coverage refine IFU coverage.
- Bless preflight refines lawful walk.

## Review Verdict -> i26-m2-gate

Verify: context, roles, prior art, test edges, and requirement trace are recorded. Validate: the set covers both the user-facing IFU system and the process failure found during this session. Red-team: covering all use cases can make decks noisy. The design keeps this at M8 and on final slides only. Verdict: PASS.
