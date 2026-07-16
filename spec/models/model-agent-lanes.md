---
id: model-agent-lanes
type: model
kind: element-tree
statement: Where the agent's read and write lanes and the i24 guards live.
---

```mermaid
flowchart TD
  mcp_supervisor["mcp supervisor: parent proxy - drain, swap, notify"]
  engine_child["engine child: the served command surface"]
  query_tool["query tool: read-only MCP and console face"]
  query_evaluator["query evaluator: pinned Bases subset over the loaded graph"]
  apply_red_guard["apply red guard: refuses edits that strand a red record"]
  root_hasher["root hasher: pooled queries and references in the identity root"]
  voice_gate["voice gate: lint fails on a voice finding at zero debt"]
  scaffold_arming["scaffold arming: birth .mcp.json, explicit path, agent_lane mcp"]
  self_arming["self arming: first attested MCP session arms the lane"]
  delta_message["delta message: an empty region names region and fix"]
  mcp_supervisor -->|spawns and swaps| engine_child
  engine_child -->|serves| query_tool
  query_tool -->|evaluates via| query_evaluator
  engine_child -->|guards writes with| apply_red_guard
  engine_child -->|derives identity with| root_hasher
  engine_child -->|lints with| voice_gate
  engine_child -->|scaffolds via| scaffold_arming
  engine_child -->|arms via| self_arming
  engine_child -->|explains via| delta_message
  arg_guards["arg guards: unknown-id bless refusal, plan-first start"]
  adopt_honesty["adopt honesty: unique park slots, a truthful build line"]
  binary_budget["binary budget: size and cold start against budget nodes"]
  pager_noopen["pager no-open: a foreign workspace's render stays quiet"]
  engine_child -->|guards ids with| arg_guards
  engine_child -->|adopts via| adopt_honesty
  engine_child -->|bounds itself with| binary_budget
  engine_child -->|renders foreign via| pager_noopen
```

Placement rationale: the supervisor sits outside the engine child, so a swap never kills the served connection. The query face is a thin adapter over the one evaluator. Every guard attaches to the engine seam it protects.
