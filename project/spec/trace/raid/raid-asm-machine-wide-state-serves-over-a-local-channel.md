---
minted_in: i27
id: raid-asm-machine-wide-state-serves-over-a-local-channel
type: "[[raid]]"
kind: assumption
statement: The claim ledger, the note inbox and the call log can be served from one process over a local channel, at a cost the walk does not notice.
owner: the maintainer
trigger: the first satellite that has to read one of the three
status: open
impact: The core cannot own what must be one thing, and core-and-satellite loses the property it was chosen for.
breaks_how_badly: fatal
how_likely: conceivable
probe: holds — 144 microseconds per crossing against a one-second budget, for the call log (exp-channel-cost)
probed: 2026-08-14
source_refs:
  - cand-core-satellite
  - el-core
  - if-core-satellite
  - req-call-answers-in-one-second
---

The core's whole premise, and until now it was written only inside the
candidate.

## Where it is already stated and where it was not

[[cand-core-satellite]] lists it under what the line leans on: "THAT THE
SHARED STATE CAN BE SERVED OVER A LOCAL CHANNEL. The mirror is a server
today, so it is the natural core. Nothing says the note inbox and the claim
ledger can live behind it, and no probe has been run."

[[if-core-satellite]] says the same at the interface: "WHAT IT LEANS ON: that
machine-wide state can be served over a local channel at all."

Neither is a register entry, so nothing brought it to a review and nothing
could rank it. That is what this node fixes.

## Why the mirror does not settle it

The mirror already serves over HTTP, so one of the four is proven. The other
three are not, and they differ in ways that matter.

- The call log is append-heavy and written on every single call.
- The claim ledger pushes to a git remote, so its latency is a network's.
- The note inbox is read at a retro and written whenever a stray lands.

An assumption that holds for a read-mostly surface says nothing about a
write-on-every-call one.

## Probe

Stand up the smallest core that serves the call log over a local channel.
Drive it from a second process at the rate a real session produces, and
measure the per-append cost against a direct file write.

The threshold is [[req-call-answers-in-one-second]]. If an append across the
channel costs a measurable share of that budget, the log stays with the
satellite and the core owns only what can afford the hop.

The claim ledger is probed the same way and separately, because its cost is
dominated by the remote rather than by the channel.
