---
id: req-walk-resumes-from-repo
type: "[[requirement]]"
statement: "When a new session opens the project, the engine shall serve the walk from its recorded position using the repository content alone."
kind: quality
verify_method: test
breaks_if_removed: "Every compaction or crash ends the iteration, and settled work gets re-litigated by the next session."
refines:
  - uc-stay-recoverable
  - uc-resume-after-an-absence
source_refs:
  - uc-stay-recoverable step 5
  - stk-agent
  - ".se/req-mine-v1.md: the ledger and truth"
  - uc-resume-after-an-absence step 1
  - uc-resume-after-an-absence step 2
  - uc-resume-after-an-absence ext 2a
  - ".se/req-mine-sebots.md: State — derived, append-only, on disk"
priority: must
---

## Detail

Zero state is carried from a prior session.

## Scenario

- source: a fresh session with no memory of prior work
- stimulus: the session pulls
- artifact: the walk position and its owed evidence
- environment: the prior session's context is gone: a compaction, a crash or a normal end
- response: the engine recomputes the position from the repository and serves the state with its guidance and owed reading
- response measure: facts required from outside the repository = 0; resumes serving the last recorded position = every resume
