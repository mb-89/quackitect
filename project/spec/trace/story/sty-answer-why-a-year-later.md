---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: sty-answer-why-a-year-later
type: "[[story]]"
statement: Someone asks why a decision was made a year ago, and the answer is found by clicking rather than by asking whoever is still around.
actor: stk-engineer-driving-agents
refines:
  - vp-the-ledger
priority: should
---

## Deck

A year on. A reviewer asks why the product refuses to run two agents at once. Nobody in the room was there when it was decided.
|||
The decisions stand as register nodes: project/spec/trace/raid/ carries kind `decision` entries, landed at i1's record-adrs state.

---

The engineer opens the trace graph. They filter to the proposition the constraint serves, and the layout redraws around it.
|||
The graph and its filter pills: engine/traceui.ts, exercised by the tsp-trace-graph-view suite — battery 1087/1087, 2026-08-11.

---

One requirement carries the rule. They click it, and the details pane names its statement, its type and its file.
|||
The click-to-detail path: `clickable` and `data-detail` in engine/traceui.ts; the details pane per guidance/craft/ux.md "Every element answers for itself".

---

They click the path. The file opens in the editor, with its own frontmatter saying which use case it derives from.
|||
A real instance: spec/trace/requirement/req-autonomy-gates-every-hop.md, frontmatter `refines: uc-set-the-autonomy` with per-step derives lines.

---

That use case names the story it generalizes. The story is a deck, and its evidence side is filled — a reference to the run where the failure actually happened.
|||
This very fill: the decks' evidence halves landed at i1's fill-story-evidence, this record, 2026-08-11.

---

Four clicks from the question to the run record. Nobody was asked, and nothing was reconstructed from memory.
|||
The chain is drawn, not narrated: machines/trace-schema.md defines the edges, engine/trace.ts loads them, and each hop above is one of them.

---

The gate that blessed it is one more click away, with the rounds as they were filled and the hand that pressed the thumb.
|||
A standing example: spec/iterations/i1-prove-a-bases-equivalent-live-table-can-/evidence/gate-implementation.md — rounds filled, blessed 2026-08-11.

---

The question was answered by the record, a year after everyone who made the decision had moved on. That is the whole point of keeping one.
|||
The record survives its people by construction: every call in .se/calls.jsonl, every node on trunk, every gate hash-bound.
