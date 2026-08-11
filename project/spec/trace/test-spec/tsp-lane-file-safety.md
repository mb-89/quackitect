---
id: tsp-lane-file-safety
type: "[[test-spec]]"
statement: No lane act destroys committed work and every artifact stays readable text, verified by test over the file and git lanes.
method: "test"
verifies:
  - "req-no-agent-act-destroys-work"
  - "req-every-artifact-is-readable-text"
  - "req-repo-search-carries-intent"
  - "req-lane-fixes-what-machines-fix"
files:
  - "tests/files.test.ts"
  - "tests/patchguard.test.ts"
  - "tests/search.test.ts"
  - "tests/roots.test.ts"
  - "tests/gitlane.test.ts"
  - "tests/lintfix.test.ts"
---

## Scope

The destructive-act boundary: compare-and-swap writes, hash-guarded
deletes, the git allowlist that forbids history rewriting, the
no-binary law, and the search lane's recorded intent.

## Approach

Component level, fault-based: each case forces the illegal act and
asserts the typed refusal, or performs the legal act and asserts the
guard held (CAS mismatch, create-over-existing, push, rebase, clean).
The intent-on-search claim is DEFINED here ahead of its case; it lands
as a named case in search.test.ts asserting the log record carries the
stated intent.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps: CAS: write demands the disk hash; null
creates; create-over-existing refused; se_git laws: no push, no rebase,
allowlist only, restore unstages only; no binary file lives under
project/.
