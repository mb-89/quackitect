---
id: req-walk-resumes-from-repo
type: "[[requirement]]"
statement: When a new session opens the project, the engine shall serve the walk from its recorded position using the repository content alone.
kind: quality
verify_method: test
breaks_if_removed: Every compaction or crash ends the iteration, and settled work gets re-litigated by the next session.
breaks_how_badly: fatal
refines:
  - uc-stay-recoverable
  - uc-resume-after-an-absence
  - uc-install-quackitect
source_refs:
  - uc-stay-recoverable step 5
  - stk-agent
  - ".se/req-mine-v1.md: the ledger and truth"
  - uc-resume-after-an-absence step 1
  - uc-resume-after-an-absence step 2
  - uc-resume-after-an-absence ext 2a
  - ".se/req-mine-sebots.md: State — derived, append-only, on disk"
  - uc-install-quackitect step 5
  - uc-resume-after-an-absence ext 3a
  - ".se/req-mine-sebots.md: Context discipline"
  - uc-resume-after-an-absence ext 6a
priority: must
---

## Detail

What the boot restores, and in what order:

- When the agent boots, the engine shall hand it every document the walk owes and shall place it at the standing position (the front desk on a fresh product) before any work state.
- Where a handover was written for the next session, the boot shall serve its content before the first step of new work.

Zero state is carried from a prior session.
