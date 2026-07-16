# M1 — Frame the problem & vision (i0024_hygiene)

## vision & scope stated -> i24-m1-vision-scope-stated

Vision (Moore): FOR the driving agent and the owner, WHO lose time to file dumps, shell hazards, and a stale tool surface, THE i0024 hygiene iteration is a trust and lane upgrade THAT gives the agent a read query, a self-refreshing MCP surface, and a voice-clean, fully hashed spec, UNLIKE dev-time reload proxies and unhashed query pools that sit outside the trust chain.

Goal, actual, delta:

- Goal: every structured read is one filtered call. Every content input is hashed. Every authored statement obeys the voice.
- Actual, five gaps:
  - greps over edge files
  - a 566-finding voice debt
  - unhashed .base pools
  - a reconnect-bound tool surface
  - two unguarded defect classes
- Delta: the eight composed requirements. The scope list lives in iteration.md.

Out of scope:

- Obsidian CLI as a dependency (ruled out)
- q-notes-travel (parked)
- epochs (parked)

## problem agreed -> i24-m1-problem-agreed-the

The delta is real, and each half was observed live, not assumed:

- The owner asked for the query lane after watching four greps and a blown output cap in one session (2026-07-15).
- The owner asked for hot reload after the MCP surface needed a manual reconnect for one config fix.
- The voice debt (566) blocks arming the voice lane; the owner ruled the fix in.
- The .base trust hole and the two guard gaps are recorded defects with dates.

Worth solving now: the wave and the build both get cheaper with query and apply in hand. Ordering the query first pays inside this same iteration.

## Review Verdict -> i24-m1-gate

Verify: every M1 subcheck points at a concrete referent in this doc or the risk register. The research findings carry source links via the compose notes.

Validate: the frame answers the owner's actual asks from 2026-07-15 chat: query lane, hot reload, statement cleanup, plus the agreed cleanup seeds. Nothing here invents scope beyond the approved plan.

Red-team: the riskiest claim is reload feasibility on this harness. It rests on documentation, not a live probe. The M5 spike carries a kill-criterion: if the harness does not adopt list_changed live, reload ships console-first and the MCP half re-scopes. Second risk: the wave's size. The grant collection and roots-only triage price it. No override needed.

Verdict: pass. Ready for the gate bless.

## state of the art checked -> i24-m1-state-of-the

Two research passes ran at compose time (2026-07-15, harness research capability).

Query lane prior art:

- ckg-mcp exposes a pre-compiled knowledge graph over MCP for structural queries.
- Codebase-Memory serves a tree-sitter graph with a Cypher-like query_graph tool.
- Neo4j memory MCP servers return structured entities instead of file dumps.

Position: prior art proves the pattern (graph reads as MCP tools beat file dumps).
None runs on a hashed, pinned expression subset inside a zero-dependency ledger engine.
Our query reuses the pooled Bases evaluator the book tables already run on. One substrate, trust-chained.

Hot-reload prior art:

- mcpmon and reloaderoo are dev-time supervisor proxies. They restart a child, buffer in-flight messages, then emit list_changed.
- No found tool self-adopts a staged production binary mid-session.
- Claude Code honors list_changed mid-session (documented). Claude Desktop does not. A dead stdio server is never restarted by the client.

Position: the supervisor shape is proven; the staged-binary self-adoption is our extension.
The parent process must never exit. The swap waits for open replies.

Hygiene items: internal debt with in-repo precedent (the i11 evidence-hash wedge is the same trust class as the .base gap). No external scan needed.

## success is measurable -> i24-m1-success-is-measurable

Ch1 criteria, each checkable:

1. Voice: `quack lint` reports zero voice findings. Baseline today: 566.
2. Query: the three canonical agent questions answer in one call each. Edges by endpoint. Nodes filtered by type and state. Notes filtered by text. Baseline today: four greps and a blown output cap.
3. Trust: editing a pooled `.base` file flips its dependents suspect. Baseline today: silent.
4. Reload: after `quack build`, the new tool surface is callable in the same Claude Code session. Baseline today: reconnect required.
5. Birth: a fresh `start stubs` workspace connects MCP with zero hand edits.
6. Guard: an apply manifest that strands a red record is refused with the refresh pointer.
7. Ship: board fully green, backward-cumulative battery passing.

## top risks logged -> i24-m1-top-risks-logged

Four risks in the register:

- `raid-wave-fatigue`: the statement wave suspects cones everywhere. Mitigation: roots-only triage under the recorded grant.
- `raid-voice-meaning-drift`: a rewrite can change a blessed meaning. Mitigation: meaning-preserving splits, full collection review.
- `raid-reload-harness`: a dead stdio server is never restarted. Mitigation: the parent never exits, only the child swaps.
- `raid-query-authority-creep`: the read lane must not become a second truth. Mitigation: read-only, walk rules unchanged.
