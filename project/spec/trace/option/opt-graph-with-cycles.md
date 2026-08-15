---
minted_in: i1
id: opt-graph-with-cycles
type: "[[option]]"
statement: hold the walk as a graph of nodes and edges that permits cycles, with the position carried in a shared state object
cluster: cluster-the-walk
found_by: prior-art
source: "LLM Workflows: Patterns, Tools & Production Architecture, https://www.morphllm.com/llm-workflows"
---

## Mechanism

The workflow is a directed graph. Nodes do work, edges route, and cycles are
first-class so an agentic loop is expressible rather than a special case. A
state object threads through every node and carries whatever the walk needs
to know.

This is the shape LangGraph ships, described in the source as the most used
framework for LLM workflows in 2026.

WHAT IT WOULD COST HERE. Cycles are already drawn, so the shape is not new.
What differs is where the position lives: a shared mutable state object,
rather than a token set on a machine instance. The token model is what makes
a fan and a busbar expressible, and a single state object would have to grow
one back.
