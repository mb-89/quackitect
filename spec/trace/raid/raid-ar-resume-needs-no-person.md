---
minted_in: i1
id: raid-ar-resume-needs-no-person
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-resume-needs-no-person at risk — the response hinges on el-record-store.
owner: the adjudicator
trigger: any change to el-record-store, or to the scenario on req-resume-needs-no-person
status: open
impact: the position must derive from files alone; state held only in memory breaks the resume
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-resume-needs-no-person
  - el-record-store
---

Walked at evaluate-architecture by agent. The scenario's response forms
at el-record-store; the tradeoff on the verdict line is what a wrong turn there
costs. The damage grade inherits from the requirement it protects.

PROBED 2026-08-10 (exp-kill-and-resume): five engine restarts in one
session, each resuming the walk from files alone — 28 signed states
fast-forwarded, worst 15.2 seconds, plus one context compaction survived
the same way. The hinge holds today. The OS-kill-mid-write and host-swap
variants stay deferred with the POSIX probe.