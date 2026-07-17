# M5 — Prove the riskiest unknowns (i0025_clean_state)

## riskiest assumptions validated -> i25-m5-riskiest-assumptions-validated

Spike A, the status storm (b10's diagnosis - done here):

- The caller was the driving agent's own wait loops. Overnight background waiters polled `quack status` every 20 to 30 seconds for hours; one crashed session's waiter alone explains thousands of dispatches.
- Each poll executed the never-cached suite live (~9 selftests), multiplying the cost.
- Root cause class: the agent polled a JUDGMENT surface for a MECHANICAL condition. The right poll target is a file (the verdict store, an output artifact), not a command that computes a board.

Fix direction, two halves:

- agent side: wait loops poll file state, never `status` (bakes into the agent guidance at M7's sweep).
- engine side: nothing owed. `status` is priced correctly for its purpose; the misuse was the caller's.

Spike B, fail-at-end sizing: the M3 feasibility already sized both candidates inside the runner loop. No further spike needed. The verdict cache pre-empts the crash-survivability concern.

## design is buildable -> i25-m5-design-is-buildable

All eleven steps are afternoon-or-smaller inside known seams:

- the runner loop (b1)
- fixture home naming (b2)
- the marker scan loop (b3)
- voiceStatementFindings' caller (b4)
- the card render (b5)
- a byte-exact sweep (b6)
- glossary files (b7)
- a veto mint and a hook re-home (b8)
- evidence reading plus hand-offs (b9)
- this very diagnosis (b10)
- a rule mint (b11)

## spike results recorded -> i25-m5-spike-results-recorded

The diagnosis lands in this doc and closes b10's question half. The guidance half lands at the M7 consistency sweep. No scratch artifacts. The evidence was the call log aggregate, already consumed at the retro.

## Review Verdict -> i25-m5-gate

Verify: the storm's arithmetic matches the observed 2355 (hours of 20 to 30 second polling). Validate: the two real unknowns are answered; everything else was pre-sized. Red-team: the self-diagnosis could flatter the engine; countered by the honest note that the never-cached suite multiplied the cost and that a cheaper engine surface remains available if polling ever becomes legitimate. Verdict: pass.
