---
id: adr-global-ratchet
decided_in: i0009_contract_attestation
type: adr
adjudicated_by: human
statement: One global quack binary in the user-local bin serves every workspace, ratcheting forward only. The engine self-checks at startup against the workspace's vendored source. A newer binary runs as-is. An older one rebuilds itself via the Windows rename dance and re-execs. The launcher stays dumb, doing only an existence check and bootstrap build. This was chosen over launcher-side version logic, which is batch parsing, brittle, and per-platform, and over versioned binary slots, a state the owner explicitly declined; incompatibilities are handled ad hoc.
depends_on: []
class: review
killer: true
---
## Rationale (not load-bearing)
Owner ratchet rule, 2026-07-04. Ship-a-zip stays viable: vendored engine source in the repo (non-.quack home: product/engine-go for the dogfood repo, tools/engine/ for vehicles) + launcher bootstrap build. Kill-criterion from M3 red-team: rename dance failing on a real console → fall back to build-next-launch (stale by one command, still forward-only).
