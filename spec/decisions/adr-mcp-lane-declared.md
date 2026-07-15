---
id: adr-mcp-lane-declared
type: adr
decided_in: i0022_engine_laws
adjudicated_by: user
statement: The CLI block activates when the workspace declares MCP as the agent lane.
class: review
killer: false
kind: architecture
provenance:
  class: schema-default (review)
  killer: schema-default (false)
  kind: agent-proposal at i22 M4
  adjudicated_by: grant-covered at i22 M4; the morning review confirms
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
