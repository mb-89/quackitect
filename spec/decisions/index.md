---
id: index
statement: Git plus markdown is the only source of truth; a gitignored, 100%-rebuildable local index caches queries. No database is the source of truth.
depends_on: [state-model]
adjudicated_by: human
killer: true
---

## Rationale (not load-bearing)

Hash lookup, the dashboard, the backlog and the guide catalog are all queries; the honest position is git=truth, index=disposable cache.

Note: SQLite chosen for ACID; a crash mid-write cannot corrupt it.
