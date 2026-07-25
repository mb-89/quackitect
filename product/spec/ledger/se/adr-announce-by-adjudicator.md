---
id: se.adr-announce-by-adjudicator
kind: decision
statement: "A GATE IS PUSHED TO THE PHONE EXACTLY WHEN THE AGENT WOULD OTHERWISE WAIT FOR THE OWNER'S INPUT. That is the whole test. If the agent is going to bless the gate itself - an unattended run under a delegation - nothing is pushed, because the owner does not need traffic for a decision they are not making. If the agent is about to PARK on the gate and wait for a human, it always pushes, because the owner may not be at the machine and a wait nobody knows about is a stall. The test is not the configuration (which only says a phone exists), not whether a process happens to be running, and not who owns the decision in principle - it is whether this run is about to stop and wait. The pairing is therefore read at announce time rather than at process start. Owner ruling, 2026-07-25, restated after the agent twice paraphrased it imprecisely: both halves failed on one day - an unattended run was paused to avoid noise, and then a gate the agent parked on reached nobody. Rejected: inferring from configuration; always publishing."
provenance:
  iteration: i8d-phone-brief
  ai_involvement: agent-drafted
  adjudicated_by: owner
  channel: chat
breaks_if_removed: Either the owner is buzzed for decisions the agent is making anyway, or - the failure that actually happened - the agent parks waiting for a human who was never told, and the run stalls indefinitely.
---


