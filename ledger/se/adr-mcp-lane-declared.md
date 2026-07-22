---
id: se.adr-mcp-lane-declared
kind: decision
statement: The CLI block activates when the workspace declares MCP as the agent lane.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_type: adr
v1_decided_in: i0022_engine_laws
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
v1_kind: architecture
v1_provenance_class: schema-default (review)
v1_provenance_killer: schema-default (false)
v1_provenance_kind: agent-proposal at i22 M4
v1_provenance_adjudicated_by: grant-covered at i22 M4; the morning review confirms
v2_amendment: lane declaration moves to v2 config shape
---

## Rationale (not load-bearing)
q-cli-steering ruled A: block the bare CLI on the agent channel. The block cannot
be unconditional - the harness's MCP approval is outside the engine, and an
unconditional block strands the walk the moment it ships (the chicken-and-egg
found at M4). Resolution: the OWNER declares the lane in spec/project.toml
(`agent_lane = "mcp"`); with the declaration set, piped ledger commands refuse
with a pointer at the MCP tools; without it, they pass as today. The declaration
is git-tracked owner intent - editing it is as visible as editing the contract.
Tripwire: the M7 demo must show the refusal live WITH the harness lane working.
Shapes go-guard-cli.

## v2 amendment (applied at mint)

lane declaration moves to v2 config shape
