---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: raid-dec-stray-log
type: "[[raid]]"
kind: decision
statement: A stray is captured as a log entry where it lands — never routed through a queue before it is written.
owner: the maintainer
trigger: strays observed dying unrecorded, or an inbox growing past what retros drain
status: decided
impact: Wrong, capture costs a routing decision and people stop capturing.
breaks_how_badly: corrosive
how_likely: conceivable
source_refs:
  - opt-the-stray-is-a-log-entry
  - cand-thin-worktree
  - req-open-notes-stay-visible
---

Capture is one cheap act; judgment is deferred to the retro. The inbox is
the one capture surface, and the retro is the one place notes are routed.

## Rejected options

- [[opt-triage-queue-in-front]] — routing at capture time, which taxes the
  moment the stray appears.
- [[opt-one-store-for-what-happened]] — folding strays into the event log,
  where nothing pends and nothing is drained.

## Consequences

- The inbox may grow between retros, and that is the design.
- A note carries no routing decision at birth.
