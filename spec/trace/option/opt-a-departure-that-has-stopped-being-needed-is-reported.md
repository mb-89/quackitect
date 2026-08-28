---
minted_in: i54-everything-exported-has-a-door-a-sweep-o
id: opt-a-departure-that-has-stopped-being-needed-is-reported
type: "[[option]]"
statement: A departure that no longer suppresses anything is itself reported, so the list shrinks as the code improves rather than only growing.
cluster: cluster-the-door-regime
found_by: prior-art
source: "the six-system comparison in this record's prior-art-one-door.md — Rust's #[expect] attribute warns when the lint it expects does not fire, and ESLint's reportUnusedDisableDirectives flags a disable comment that suppresses nothing"
---

## Mechanism

The guard tracks whether each departure actually did any work. A departure
that suppressed nothing on this run is reported as stale.

WHY IT IS THE FIRST THING TO TAKE FROM THE COMPARISON. Two of the six systems
have it, they arrived at it independently, and it is the only one of the three
missing capabilities that costs almost nothing to add: the guard already knows
which departures it consulted.

WHAT IT FIXES. A list with no expiry silts up, which is registered here as
raid-risk-an-exemption-registry-with-no-expiry-silts-up. Without it the only
force acting on the list is growth.

WHAT IT COSTS HERE. The guard must attribute each suppression to the entry
that caused it, which is bookkeeping the current widget guard does not do — it
computes a set difference and never learns which bullet mattered.

A CAVEAT WORTH CARRYING. A departure can be genuinely needed and still look
unused on a run that never reached the code it covers. Reporting is therefore
the right verb and refusing is not.
