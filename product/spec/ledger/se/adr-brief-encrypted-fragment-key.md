---
id: se.adr-brief-encrypted-fragment-key
kind: decision
statement: "The hand-off brief is ONE self-contained page holding ciphertext plus an inline decryptor, published to a static store, with its key carried only in the URL fragment - which browsers never transmit. The host therefore stores bytes it cannot read. Probed live: the stored object contains none of the brief's words, and it still serves as text/html so it renders rather than downloads. Rejected: plaintext at rest (defeats the purpose); the key in a query parameter (reaches the host and its logs); the key in a second message (two retained messages to correlate, no gain); a separate decryptor script (an extra fetch and a wider surface). HONEST LIMIT: this protects against the HOST, not against whoever holds the ntfy topic - the link and its key travel through a relay that retains for about twelve hours, which is the possession model the owner already ruled as accepted risk."
provenance:
  iteration: i8d-phone-brief
  ai_involvement: agent-drafted
  adjudicated_by: agent
  channel: chat-grant
breaks_if_removed: Either the owner decides on a truncated sentence instead of the evidence, or the ledger's content sits in plaintext on a third-party host.
---


