---
id: se.q-global-ratchet
kind: question
statement: "Re-derive under v2 ground: version ratchet under RUNME/npm"
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
v1_source: adr-global-ratchet
v1_statement: One global quack binary in the user-local bin serves every workspace, ratcheting forward only. The engine self-checks at startup against the workspace's vendored source. A newer binary runs as-is. An older one rebuilds itself via the Windows rename dance and re-execs. The launcher stays dumb, doing only an existence check and bootstrap build. This was chosen over launcher-side version logic, which is batch parsing, brittle, and per-platform, and over versioned binary slots, a state the owner explicitly declined; incompatibilities are handled ad hoc.
status: open
---

## The ported question

version ratchet under RUNME/npm

## v1 ruling (NOT ported — context only)

One global quack binary in the user-local bin serves every workspace, ratcheting forward only. The engine self-checks at startup against the workspace's vendored source. A newer binary runs as-is. An older one rebuilds itself via the Windows rename dance and re-execs. The launcher stays dumb, doing only an existence check and bootstrap build. This was chosen over launcher-side version logic, which is batch parsing, brittle, and per-platform, and over versioned binary slots, a state the owner explicitly declined; incompatibilities are handled ad hoc.
