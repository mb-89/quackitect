---
minted_in: i15-the-database-our-own-reader-over-obsidia
type: "[[experiment]]"
statement: Can el-query-evaluator's declarative AND-filter over frontmatter answer a structured query against the real trace corpus (spec/trace) in under one second, measured as wall-clock walk-plus-read-plus-parse-plus-filter time?
probes:
  - raid-risk-i15-query-latency-unmeasured-at-real-scale
timebox: 45 minutes
form: script
chunk: none
faked: the filter evaluator itself — a minimal regex-based frontmatter parser and a two-field AND predicate (kind==risk, status==open) stand in for the real filters.and/or evaluator; the corpus walked and read (spec/trace, 768 .md files at measurement time) is not faked, and no cache or index sits in front of it
fallback: if over one second, reopen raid-dec-i15-query-answers-via-declarative-view-spec with opt-cache-corpus-read-invalidated-by-file-stat (cand-fast-path-plus-blocking's stat-invalidated cache) already on record
verdict: holds
measured: 31 ms wall-clock, 768 files walked, read and frontmatter-parsed, 40 matched — 2026-08-16, se_run on this session's container
folds_to: raid-risk-i15-query-latency-unmeasured-at-real-scale — status moves open to mitigated, 31 ms measured against the 1000 ms bound is a 32x margin, comfortably absorbing the throttled-hardware discount raid-asm-the-target-machine-is-many-throttled-cores names
promote: none
source_refs:
  - rank-unknowns, the seeded pick
---

## Setup

`se_run`, one throwaway `node -e` script, from the project root:

- Walk `spec/trace` recursively for `*.md` (`fs.readdirSync` with
  `withFileTypes`).
- For each file, read it whole and pull the frontmatter block between the
  first two `---` lines with a regex, then split it into `key: value` pairs
  with a second regex per line.
- Apply an AND filter over two fields: `kind === "risk"` and
  `status === "open"`.
- Time the whole walk-read-parse-filter loop with `Date.now()` before and
  after.

No cache, no index, no memoisation — the same shape
raid-dec-i15-query-answers-via-declarative-view-spec commits to: a fresh
read of the corpus on every call.

## Result

2026-08-16: 768 files, 40 matched, **31 ms** wall-clock for the whole
walk-read-parse-filter loop.

The one-second bound (req-call-answers-in-one-second) is 1000 ms. 31 ms
is a 32x margin — even a throttled machine running ten times slower than
this container would land at roughly 310 ms, still comfortably under the
bound.

The corpus measured here (768 files) is more than double the ~328 the
earlier probe and the standing guidance both cite, so the margin holds
against a bigger corpus than the one everybody has been assuming.
