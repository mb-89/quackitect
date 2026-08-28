---
form: define-actual
reopened: 2026-08-19T09:08:14.597Z — Draft vision was re-signed with fresh 2026-08-19 harness research; confirm the actual-state evidence still holds.
by: agent
signed_off: 2026-08-19T09:08:27.488Z
authors: agent
files: null
---

# Evidence form / define-actual

## current_situation

Iteration 36 has passed kickoff and drafted the vision.

The work is now defining the current harness reality before changing it.

## as_is

The stable baseline is self-hosting.

Witness: `project/product.md` says Quackitect works on itself on trunk.

The good current state is that the lane can recover.

Witness: today's boot reached the front desk after a valid `se_test` record was created.

The bad current state is that recovery is still too manual.

Witness: boot stopped at `boot/prepare_idle` because `record-inspect` found the latest test run had no `question` and no `scope`.

The host payload boundary is visible during normal work.

Witness: boot and i36 pulls repeatedly overflowed into host chat-session files.

The lane log did not reliably recover those oversized pull bodies.

Witness: `se_log_query` returned the same oversized pull response truncated, forcing host-file reads for proof prompts.

Failed calls are already useful signals, but the machine does not yet gather them into the active iteration automatically.

Witness: the onboard retro counted 136 rejected records in the window and `SE-C-133` appeared 83 times.

Route recovery is also part of the actual state.

Witness: after kickoff signed, `se_pull` tried `end` twice and refused with `SE-C-110`; `se_aim` to `iterations/i36/draft-vision` recovered the walk.

## follow_up

Use this actual state to log risks next.

The risk register should cover:

- boot metadata recovery hiding test-record defects
- host payload offload breaking read proofs
- failed calls staying local instead of becoming iteration work
- route remedies repeating a refusal

## anything_else

No solutions are claimed here; those belong in later states.
