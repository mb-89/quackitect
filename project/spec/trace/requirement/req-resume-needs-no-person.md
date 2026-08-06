---
id: req-resume-needs-no-person
type: "[[requirement]]"
statement: "When a person returns to the product after an absence, the panel shall give them the position, the open work and the position, the open work and the pending notes with zero questions to another person."
kind: quality
verify_method: demonstration
breaks_if_removed: "Resume requires finding a colleague; the absent-owner case fails."
refines:
  - uc-resume-after-an-absence
source_refs:
  - uc-resume-after-an-absence step 2
  - uc-resume-after-an-absence step 6
  - ".se/req-mine-sebots.md: The person's dial and the manual path"
priority: should
---

## Scenario

## Scenario

- Source: a person returning after an absence, or a fresh agent starting.
- Stimulus: needs to know the position, the open work and everything pending.
- Artifact: the panel — panel, evidence forms, decision graph, inbox.
- Environment: no session running; nobody else available to ask.
- Response: they assemble the answer by reading the panel.
- Response measure: zero questions to another person.
