---
id: se.law-whitelist-guards
kind: decision
statement: "GUARDS ARE WHITELISTS, NEVER BLACKLISTS. A guard names the ONE state it accepts, positively, and treats everything else as failure. It must never enumerate the ways things can go wrong, because the case nobody enumerated is the case that gets through. This is the same shape the state machine already uses: the legal transitions are listed and everything not listed is illegal by construction. Owner ruling, 2026-07-25, made after the SECOND failure of this exact shape - a close guard that checked for conflicts let a merge through that had refused for a different reason, and committed trunk's own pending changes under the close's name. Apply to every design, not only this one."
provenance:
  iteration: i5d-close-merge-split
  ai_involvement: agent-drafted
  adjudicated_by: owner
  channel: chat
breaks_if_removed: "Failures reach production through the branch nobody thought to blacklist. Witnessed twice in one day: a ship that reported success while merging nothing, and a close that fabricated a single-parent commit because the merge had been declined for an unlisted reason."
applies_to: every guard, check and refusal in the engine and in any design
---
