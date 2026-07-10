---
id: i17-b13-perf-slice
statement: The battery renders the real book at most once (a shared bookOnce memo every real-book test uses), test-status-fast asserts against one pre-warmed run instead of cold subprocess spawns, and lint caches its AST derivation within a run.
milestone: M4
class: review
killer: false
parent: i17-m4-build
depends_on: [i17-b12-perf]
---
