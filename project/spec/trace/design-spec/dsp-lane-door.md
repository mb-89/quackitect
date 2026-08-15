---
minted_in: i1
id: dsp-lane-door
type: "[[design-spec]]"
statement: the typed tool lane, carried by one registry of verbs with schemas, clauses and remedies
realizes:
  - "el-walk-engine"
files:
  - "project/deliverable/engine/tools.ts"
  - "project/deliverable/engine/mcp.ts"
  - "project/deliverable/engine/errors.ts"
  - "project/deliverable/engine/discipline.ts"
  - "project/deliverable/engine/promptlayer.ts"
  - "project/deliverable/engine/params.ts"
  - "project/deliverable/engine/bound.ts"
  - "project/deliverable/engine/bin/se-mcp.ts"
  - "project/deliverable/engine/bin/se-manual.ts"
---

## Responsibility

Every agent act enters through one door. The door validates arguments
against schemas, refuses with a typed clause and an executable remedy,
and logs the call. The lane rules steer shell use back into lane verbs.

## Interface

The MCP server surface: one tool per verb, schemas generated from the
registry. The prompt layer places the standing sources into the host.

## Rationale

One registry feeds the tool list, the refusals and the warnings, so
feed-forward and feedback cannot drift apart.
