---
id: se.adr-mcp-attest
kind: decision
statement: "Attest over MCP is PER-SESSION. The owner attests ONCE when the connection opens, via one console command or one phone tap over the ask lane. The server holds the attestation in memory for the session, so no key is passed per tool call. Nothing is stored at rest: the session state dies with the process, which is stronger than a bearer token that could leak or replay. On a build swap (req-mcp-server.5), the session ends and one re-attest is required, a single tap. If the dogfood rebuild friction proves real, the recorded mitigation is a re-exec handoff. It carries the attestation across the exec IN MEMORY, never disk, keeping the session alive while serving only fresh code. Rejected: bearer-token-in-a-file, which authenticates the transport rather than the actor, sebot's model, and key-as-a-tool-argument, the conservative first draft; the session model is strictly simpler for the owner and loses nothing. The stateless CLI channel is unchanged, key-per-call."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_type: adr
v1_kind: architecture
v1_decided_in: i0018_mcp_apply
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
---

## Rationale (not load-bearing)
The MCP server's resident session is the home the stateless CLI never had for attest state. Re-attest frequency: near-zero for normal project use (the binary ratchets only on engine updates), frequent only when developing the engine itself - the case the re-exec mitigation targets.
