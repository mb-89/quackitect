---
id: uc-watch-the-walk-live
type: "[[use-case]]"
statement: Watch the walk move in the panel without steering it, and keep your place while it moves.
actor: stk-engineer-driving-agents
trigger: the agent is walking and the engineer wants to see without interrupting
precondition: the panel is open beside the editor
guarantee: every update reaches the render, and nothing the reader did not touch moves
refines:
  - sty-watch-the-walk-live
priority: should
---

## Main scenario

1. The engineer watches the panel while the agent narrates and walks.
2. Every narration update changes the render — the checklist, the feed, the machine's colors.
3. The engineer holds a detail open on one thing while the walk moves elsewhere. Their place holds.
4. Afterwards they read the decision trail as branches off each point, briefs whole.

## Extensions

- 2a. The agent falls silent past the cadence's window. The toll warns once, then refuses the next quiet call — silence is never ambiguous.
- 3a. What the reader had open is genuinely gone. The pane says so in its place, never silently swapping content.
- 4a. A rendered script block fails to parse. That is a defect class of its own — one broken block kills every handler — and the machine checks it.
