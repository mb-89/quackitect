---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: raid-dec-i15-query-answers-via-declarative-view-spec
type: "[[raid]]"
kind: decision
statement: answer-a-structured-query evaluates the pinned subset's declarative YAML view-spec (filters.and/or, a field list) fresh against the loaded corpus on every call, with no cache and no separate storage layer.
owner: the driving agent
status: decided
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - req-trace-view-derived-from-files
  - req-query-is-deterministic
  - opt-declarative-view-spec-evaluated-in-process
  - cand-explicit-and-safe
---

## Rejected options

- Pipeline query language over an index (opt-pipeline-query-language-over-index) — a real parser and a live index cost more to build than the pinned subset needs today.
- Embedded relational store with SQL (opt-embedded-relational-store-with-sql) — scored worst on the front's own axes (req-trace-view-derived-from-files: 1/5) for creating a second source of truth with an unverified sync path.
- Scripting API over a loaded index (opt-scripting-api-over-loaded-index) — trades a closed grammar's built-in validation for an unbounded surface.
- Stat-invalidated cache (opt-cache-corpus-read-invalidated-by-file-stat, the query half of cand-fast-path-plus-blocking) — real, and only just behind on the front; not chosen because it adds a correctness argument (every write goes through the lane, with no exception) the fresh-read shape does not need.
- Obsidian CLI as external evaluator, closed-regex grammar, and the other query-side options on cluster-the-query's row — recorded in full on the option nodes each names.

## Consequences

Every query answer is provably derived from the files at the moment it runs — no separate index can drift from them, and no cache-invalidation correctness argument is owed. The cost is paid on the other side: no query is faster than a fresh walk of the corpus, unmeasured at real scale (~328 files) as of this decision. If that scale forces a cache or index later, this decision is the one to reopen, and cand-fast-path-plus-blocking's own record is where that design already stands.
