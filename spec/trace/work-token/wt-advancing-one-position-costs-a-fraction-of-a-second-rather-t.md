---
id: wt-advancing-one-position-costs-a-fraction-of-a-second-rather-t
type: "[[work]]"
statement: "Advancing one position costs a fraction of a second rather than several. A profiler traced the cost to the status message: it recomputes the entire path to the destination every time one is sent, even for a position whose own checks do nothing at all. The toll measured almost identical across three consecutive hops, which is the tell that it belongs to the packet and not to the work."
place: i41-green-is-computed-once-and-right-the-dia
ready_when: ready when the per-step cost is measured again, and a profiler already named the chain
source: note-5e44e4827de3
---

## Why it stands

Advancing one position costs a fraction of a second rather than several. A profiler traced the cost to the status message: it recomputes the entire path to the destination every time one is sent, even for a position whose own checks do nothing at all. The toll measured almost identical across three consecutive hops, which is the tell that it belongs to the packet and not to the work.

## When it comes back

ready when the per-step cost is measured again, and a profiler already named the chain
