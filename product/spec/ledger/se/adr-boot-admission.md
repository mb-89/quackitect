---
id: se.adr-boot-admission
kind: decision
statement: "A session boots before it works: log onto the project, receive the contract (rules + voice) from the server, attest its hash. Admission gates the whole tool surface; next, boot and help stay legal."
provenance:
  adjudicated_by: owner
  channel: chat-session
  iteration: post-b6
  ai_involvement: owner-ruled-agent-transcribed
breaks_if_removed: agents work without ever reading the project rules; AGENTS.md silts up with project-specific guidance that belongs to the server; the admission grant of design section 7 has no mechanism
---

## Ruling (owner, 2026-07-22)

AGENTS.md says one thing: you work through the MCP server and do what
it tells you (first call se_loop_next, se_help when stuck). Everything
else - rules, voice, lanes, state - reaches the agent through the
server during boot. Voice guidance is project-specific and is served
from the project (brand/voice.md), never baked into AGENTS.md.

Mechanism: se_boot returns project + contract + hash; se_boot with
contract_hash attests and admits (hash-as-grant, one round-trip,
design section 7). SE-C-005 gates unadmitted calls; SE-C-006 refuses
stale hashes - editing the contract re-asks attestation. Admission is
per-session, per-shim, in memory: a reclaimed VM boots again.

The handover lives in the product (product/spec/handover.md,
gitignored) and is served inline on admission. se.emit.handover will
generate it (i2).

Supersedes the earlier there-is-no-boot-tool reading of section 6:
blocking stays an instruction (next instructs the boot), but the boot
itself is a tool.
