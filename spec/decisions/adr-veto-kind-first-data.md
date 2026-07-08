---
id: adr-veto-kind-first-data
type: adr
adjudicated_by: human
statement: A kind-first data layout (logs/<slug>, notes/<slug>) is scrapped: it scatters one workspace across kinds and breaks the one-delete amnesia test (i9 M3 axis A5b).
class: review
killer: false
---
## Rationale (not load-bearing)
The data home could group by kind first, then workspace: logs/<slug>, notes/<slug>.
That scatters one workspace's state across many top-level kind folders.
The amnesia test wants one delete to forget a workspace fully.
A kind-first layout needs a delete in every kind folder, so a stray folder survives.
Workspace-first, <slug>/<kind>, keeps one deletable directory per workspace.
