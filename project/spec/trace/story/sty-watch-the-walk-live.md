---
id: sty-watch-the-walk-live
type: "[[story]]"
statement: An engineer leaves the agent walking, watches the panel tell the story live, and never loses their place while it moves.
actor: stk-engineer-driving-agents
refines:
  - vp-autonomy-range
priority: should
---

## Deck

The agent is three states deep in a walk I delegated. I want to watch
without steering: what it is doing, what it decided, what turned green.
|||
Lived on 2026-08-11: the owner watched the M8 walk from the panel and interjected from what it showed - "I see that you are now in sweep consistency."

---

The panel moves as the walk moves. Every narration update reaches the
render — the checklist ticks, the feed grows, the graph recolors.
|||
The narration rides every changing call (the toll, engine/toll.ts); the feed and its render are pinned by tests/feed.test.ts, green in the battery.

---

I have a detail pane open on one claim while the agent works elsewhere.
Nothing I did not touch resets, resizes or scrolls. My place is mine.
|||
The reader-keeps-their-place law in guidance/craft/ux.md, held by a registry with a test refusing anything unregistered.

---

The trail reads like a story afterwards: each point's updates branch off
it, the briefs readable, the colors carrying meaning from one palette.
|||
The decision graph in the record's decisions.jsonl, rendered by engine/bin/render-decisions.ts; colour is configuration, one palette file.
