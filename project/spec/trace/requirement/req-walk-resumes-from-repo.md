---
id: req-walk-resumes-from-repo
type: "[[requirement]]"
statement: When a new session opens the project, the engine shall serve the walk from its recorded position using the repository content alone.
kind: quality
fitness_candidate: true
verify_method: test
breaks_if_removed: Every compaction or crash ends the iteration, and settled work gets re-litigated by the next session.
breaks_how_badly: fatal
refines:
  - uc-quality-reliability
  - uc-resume-after-an-absence
  - uc-install-quackitect
source_refs:
  - uc-quality-reliability step 5
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

## Scenario

| part | value |
| --- | --- |
| source | A new agent session, carrying nothing from the one before it. |
| stimulus | It boots against a project whose previous session ended mid-walk — by compaction, by crash, or by the person closing the window. |
| artifact | The engine, reading the repository. |
| environment | Normal operation. No process from the prior session survives, and no in-memory state is available. |
| response | The engine serves the walk from its recorded position, hands over every document that position owes, and serves any handover written for the next session. |
| response measure | The walk resumes at the recorded position with 0 bytes carried from the prior session, and 0 settled decisions re-opened. |

The pass line is the response measure, and both halves of it matter. Resuming
at the right position while re-litigating settled work is still a failure.

## Detail

What the boot restores, and in what order:

- When the agent boots, the engine shall hand it every document the walk owes and shall place it at the standing position (the front desk on a fresh product) before any work state.
- Where a handover was written for the next session, the boot shall serve its content before the first step of new work.

Zero state is carried from a prior session.
