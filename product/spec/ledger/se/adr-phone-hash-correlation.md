---
id: se.adr-phone-hash-correlation
kind: adr
statement: The offer base_hash IS the correlation id carried out in the action and matched on the way back; a tap binds only when its id equals the live offer hash, and stale/duplicate/mismatched taps are idempotently ignored.
provenance:
  iteration: i8-phone-lane
  ai_involvement: agent-drafted
  adjudicated_by: agent
  channel: chat-grant
breaks_if_removed: Either a second secret must be minted and mapped, or a tap could bind the wrong or an expired gate.
---

## Decision

The unguessable offer hash doubles as the correlation id (no second secret). INBOUND loads the live offer via Gate.current(); a tap blesses only if its id === offer.base_hash, then calls Gate.bless(hash, {channel: phone, adjudicated_by: owner}); a dismiss action calls Gate.dismiss(). A cursor over answered-ids makes duplicates and already-honored taps no-ops; no live offer or a mismatch is ignored. This realizes the inherited adr-answer-authenticity (possession of the correlation id = authenticity, accepted risk).

## Rejected

- A separate minted correlation token mapped to the offer: a second secret to store and expire for zero benefit; the hash already binds unforgeably to the exact offered state.
