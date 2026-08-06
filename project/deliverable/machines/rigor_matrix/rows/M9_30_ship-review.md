---
kind: matrix-row
name: ship-review
statement: "The ship review: dependency flips, divergence flags, upstream proposals."
state_kind: work
filled_by: agent
depends_on:
  - package
legal_tools:
  - se_file_read
  - se_file_write
  - se_file_patch
  - se_file_search
  - se_file_glob
  - se_file_list
  - se_log_query
  - se_answer
  - se_run
  - se_git
evidence:
  - name: review
    description: the dependency list with rulings; new asks answered
  - name: upstream
    description: proposals deposited, or none owed
major: full
minor: tailored
patch: none
product: full
specification: tailored
major_note: |
  Applies in full: dependency flips displayed, divergences flagged,
  upstream proposals deposited. Architecture moves shift dependencies
  more often than any other size.
minor_note: |
  Applies where dependencies moved: flips displayed, new asks answered,
  diverged deps flagged. With no dependency movement the sticky rulings
  carry it in one line.
patch_note: |
  Does not apply. Dependencies did not move for a behavior fix; sticky
  rulings hold. STRIKE PROPOSAL - owner adjudicates.

  ESCALATE: a patch that bumps a dependency is a minor - the dependency
  IS a requirement moving.
product_note: |
  STANDING ARTIFACT: the dependency rulings - sticky, recorded, honored.
  At rest every dependency has a ruling; diverged ones are flagged, not
  hidden.
specification_note: |
  DOCUMENT FORM: the dependency ruling list in the ship record; diverged
  deps flagged in the release notes.
---

## Guidance

Per [[meth-dependency-ship-review]]: display everything, ask only where no sticky ruling exists or the state changed; diverged deps ship flagged; upstream offers deposited, never pushed.
