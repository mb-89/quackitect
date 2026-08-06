---
id: req-newcomer-one-command
type: "[[requirement]]"
statement: When a newcomer runs the setup script on a fresh computer, the install path shall deliver the desk's greeting with exactly 1 command run by the person and 0 files edited by hand.
kind: quality
verify_method: demonstration
breaks_if_removed: Install quality decays one manual step per release and nobody counts.
refines:
  - uc-install-quackitect
source_refs:
  - uc-install-quackitect step 2
  - uc-install-quackitect guarantee
  - stk-newcomer
  - ".se/req-mine-sebots.md: the person's dial and the manual path (the checklist bar)"
priority: could
---

## Scenario

## Scenario

- Source: a newcomer holding the product folder.
- Stimulus: runs the one setup script.
- Artifact: the install path, from bare folder to front desk.
- Environment: a fresh computer with an editor and a shell, no prior install.
- Response: the panel draws, the engine answers, and the desk greets with the walkable doors.
- Measure: exactly 1 command run by the person, 0 files edited by hand, and 0 questions to answer before the greeting.
