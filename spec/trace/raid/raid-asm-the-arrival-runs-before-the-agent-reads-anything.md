---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: raid-asm-the-arrival-runs-before-the-agent-reads-anything
type: "[[raid]]"
kind: assumption
statement: A host fires its SessionStart hooks and waits for them before the agent's first turn, so an arrival wired there has completed by the time the agent acts.
owner: the owner
trigger: the first host that runs SessionStart hooks concurrently with the first turn, or skips them on resume
status: open
impact: "The agent's first act would race the arrival: it would find no lane, follow the card, and perform the five acts by hand while the hook did the same thing underneath it. Two arrivals at once is the one case req-arriving-twice-changes-nothing was written for."
breaks_how_badly: crippling
how_likely: conceivable
probe: "HOLDS ON THIS HOST, probed 2026-08-18 on the i17 arrival, and the ordering evidence i35 could not get is now in hand. The hook fired on a real cloud session and its seven step lines were sitting ABOVE the agent first turn, in the transcript, before anything was read. That is the ordering the entry asked for: the agent could not have raced it, because the output was already there to read. WHAT IS STILL NOT ESTABLISHED is the resume case named in the trigger - this was a startup, not a resume."
probed: 2026-08-18
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
