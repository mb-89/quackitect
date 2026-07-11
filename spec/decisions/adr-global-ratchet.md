---
id: adr-global-ratchet
decided_in: i0009_contract_attestation
type: adr
adjudicated_by: human
statement: One global quack binary in the user-local bin serves every workspace, ratcheting forward only — the engine self-checks at startup against the workspace's vendored source (newer binary runs as-is; older rebuilds itself via the Windows rename dance and re-execs), while the launcher stays dumb (existence check and bootstrap build only) — chosen over launcher-side version logic (batch parsing, brittle, per-platform) and over versioned binary slots (state the owner explicitly declined; incompatibilities are handled ad hoc).
depends_on: []
class: review
killer: true
---
## Rationale (not load-bearing)
Owner ratchet rule, 2026-07-04. Ship-a-zip stays viable: vendored engine source in the repo (non-.quack home: product/engine-go for the dogfood repo, tools/engine/ for vehicles) + launcher bootstrap build. Kill-criterion from M3 red-team: rename dance failing on a real console → fall back to build-next-launch (stale by one command, still forward-only).
