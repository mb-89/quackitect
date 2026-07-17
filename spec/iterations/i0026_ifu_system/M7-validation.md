# M7 - Validation (i0026_ifu_system)

## Meets the need -> i26-m7-meets-the-need

The documentation need is served better:
- IFU appears in the Pong deck title.
- IFU appears in the guide table rows.
- IFU map explains where workflows live.
- The M8 check can fail missing use-case coverage.

## Killer use-cases demonstrated -> i26-m7-killer-use-cases

Demonstrated workflows:
- A reader can use chapter 2's derived documents table to find deck-style documents.
- A reader can use chapter 10.3's guide table to open IFU rows.
- The owner can edit markdown deck files directly.
- The engine can compute missing use-case coverage from IFU deck source.

## Consistency swept -> i26-m7-consistency-swept-everything

Updated or checked:
- deck manifest source.
- guide rows.
- document overview renderer path.
- guide table renderer path.
- coverage dispatcher.
- prompt bless-preflight rule.
- engine bless-preflight guard.
- IFU glossary term.
- verify output framing.
- cold-start budget measurement retry.
- MCP build-swap re-attestation wording.
- weak-model delegation prompt guidance.
- terminal reset prompt guidance.
- trace nodes and connection edges.

## Acceptance obtained -> i26-m7-acceptance-obtained-sign

Agent acceptance under the standing grant: the work matches the owner's stated IFU model. M8 remains the owner-facing handoff.

## Validation gaps captured -> i26-m7-validation-gaps-captured

Gaps:
- The first IFU map is broad. Later iterations can split it into task-specific decks.
- The coverage check uses ID mention, not semantic proof that the slides teach the workflow.
- Weak-model delegation policy remains in backlog.
- README LLM link behavior and details-pane depth are open book-review findings.

## Milestone review -> i26-m7-gate

Verify: validation evidence covers the changed surfaces. Validate: the IFU system is usable enough for M8 handoff. Red-team: a user may still prefer shorter IFU decks. That becomes future authoring work, not a blocker for the mechanism. Verdict: PASS.
