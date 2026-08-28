---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: opt-the-door-is-the-default-and-the-way-round-it-is-recorded
type: "[[option]]"
statement: The door is what a caller reaches for first, a named narrow case keeps its own path, and anything else going round the door is a recorded exception.
cluster: cluster-the-door-regime
found_by: prior-art
source: v2 at ref v2, product/spec/ledger/se/adr-io-lane-default.md — engine-mediated file IO is the DEFAULT, editor tooling remains the lane for a single interactive edit, and a byte-safe scripted edit stays the recorded exception
---

## Mechanism

Three tiers rather than two. The door is the default. One narrow case is
exempt by name rather than by application. Everything else that goes round is
recorded one departure at a time.

THIS EXACT DECISION WAS ALREADY ADJUDICATED ONCE, in the predecessor, for
file IO. Its loser is on the record with its reason, which is the rarest thing
a prior-art sweep can find.

- THE REJECTED OPTION was universal mediation with the direct path retired
  altogether.
- WHY IT LOST — "Universal loses on edit latency and harness ergonomics. The
  walk lives in editor tools for one-line changes, and forcing a manifest per
  edit taxes every step for corruption the single-edit lane has never caused."
- WHAT WOULD REVERSE IT is written down too — "if a single-edit corruption
  incident lands, the named corrupter class spreading beyond shell
  round-trips, universal mediation returns as the ruling's recorded fallback."

WHAT IT COSTS HERE. The middle tier is where the argument goes. A named
narrow case is one line of the rule and one line of judgment; getting it wrong
means either a tax on ordinary work or a hole nobody counts.

WHAT DOES NOT TRANSFER. That ruling was about the AGENT's edits, and this
record governs the ENGINE's own reach. The shape transfers; the latency
argument does not, because no person is waiting on an engine-internal write.
