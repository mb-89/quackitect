---
id: se.adr-phone-secret-machine-local
kind: adr
statement: The phone credential lives in ~/.se/<project>/phone.json (machine-local, never committed); the lane is strictly opt-in and silent without it; the agent never mints, logs, or enters the secret.
provenance:
  iteration: i8-phone-lane
  ai_involvement: agent-drafted
  adjudicated_by: agent
  channel: chat-grant
breaks_if_removed: The credential could land in the committed tree or the call log, and the agent could be pushed to mint or type a secret it must never handle.
---

## Decision

Config home = layout.seDir(root)/phone.json (the same machine-local, fence-exempt, never-committed home as toll/offer/calls). Shape: { enabled, topic, answer_topic, token? }. Absent or enabled:false -> the lane is fully silent. The agent reads it; it never writes the secret to a log, an evidence doc, or a commit; pairing (populating it) is the owner's physical act.

## Rejected

- product.json in the repo: a secret in the committed tree, refused by req-phone-config-secret.
- Env var: works but scatters the credential across shell state; the machine-local file is the one home already trusted for secrets.
