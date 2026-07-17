# M4 — Decide the architecture (i0025_clean_state)

## chosen architecture stated -> i25-m4-chosen-architecture-stated

`cand-fail-at-end-collect` wins: the runner loop collects and reports at the end. The verdict cache keeps providing crash-surviving partials, unchanged.

Deciding ADR: [adr-fail-at-end](../../decisions/adr-fail-at-end.md).

## choice traced to the weighted criteria -> i25-m4-choice-traced-to

Pugh, datum `cand-fail-at-end-journal`:

- simplicity (0.4): +1 - no new artifact
- crash survivability (0.25): 0 - the verdict cache already covers both
- report fidelity (0.35): 0 - both report everything once

Weighted: +0.4. Collect wins on simplicity with nothing conceded.

## views chosen -> i25-m4-views-chosen-model

No new views. The touched elements live inside blocks the existing models already allocate:

- `model-engine-layers` covers the battery, lint, and scanner bands
- `model-agent-lanes` (i24) covers the card render and the lanes

Rejected kinds recorded: context / sequence / state - a debt drain changes no structure worth a new diagram.

## structuring method considered -> i25-m4-structuring-method-considered

Skipped, recorded: no elements are being grouped or ordered.

## ADR recorded and traced -> i25-m4-adr-recorded-and

One ADR, addressing req-battery-fail-at-end. The derived check computes live.

## architecture model ready -> i25-m4-architecture-model-ready

The build fills blocks the existing diagrams already sanction; the conformance lint holds it to that. No new element is planned; one found mid-build returns here first.

## Review Verdict -> i25-m4-gate

Verify: the Pugh runs on an honest datum. The ADR traces. Validate: minimal decision surface for a minimal-architecture iteration. Red-team: the strongest objection is that no-new-views under-documents b5's card change. Answered - the card render is an allocated block in model-agent-lanes. b5 changes its content, not the structure. Verdict: pass.
