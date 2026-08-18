---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: raid-asm-the-arrival-runs-before-the-agent-reads-anything
type: "[[raid]]"
kind: assumption
statement: "A host fires its SessionStart hooks and waits for them before the agent's first turn, so an arrival wired there has completed by the time the agent acts."
owner: the owner
trigger: "the first host that runs SessionStart hooks concurrently with the first turn, or skips them on resume"
status: deferred
defer_until: "the marker a first pull can read is built. This node's own probe field names that as the cheap probe and records that it does not exist, and req-arriving-twice-changes-nothing is the mitigation rather than the proof."
impact: "The agent's first act would race the arrival: it would find no lane, follow the card, and perform the five acts by hand while the hook did the same thing underneath it. Two arrivals at once is the one case req-arriving-twice-changes-nothing was written for."
breaks_how_badly: crippling
how_likely: conceivable
probe: "unprobed, deliberately. i35 opened it on 2026-08-17. The hook was invoked and its output observed, but nothing establishes ORDERING against the first turn. req-arriving-twice-changes-nothing is the mitigation, not the proof. The cheap probe is a marker the first pull can read, and it is not built."
probed: 2026-08-17
source_refs:
  - uc-arrive-on-an-unattended-machine
  - i35-the-cloud-run-s-findings-land-the-fix-fi
weighs_with: none
weighs_against: none
---

## Probe

THE MITIGATION EXISTS AND THE PROOF DOES NOT, and the two are worth keeping
apart.

req-arriving-twice-changes-nothing means a race costs duplicated work rather
than a corrupted lane: the port is probed before anything is spawned. That is
why this is rated crippling rather than fatal.

WHAT WOULD SETTLE IT: a host that reports hook completion, or an arrival that
writes a marker the agent's first pull can read.
