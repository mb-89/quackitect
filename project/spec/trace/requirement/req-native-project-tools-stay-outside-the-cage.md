---
minted_in: i36
id: req-native-project-tools-stay-outside-the-cage
type: "[[requirement]]"
statement: When a caged session starts, the system shall expose the se lane and permitted web discovery while exposing zero native tools that can read, change, search, or execute against the project.
kind: quality
characteristic: security
verify_method: test
breaks_if_removed: Project work can bypass the lane and disappear from the audit trail.
breaks_how_badly: fatal
measure: The live tool inventory contains zero native project tools and retains the permitted native web-search tool when the harness provides it.
refines:
  - uc-quality-security
source_refs:
  - ref-agent-harness-portability-2026-08-19
priority: must
weighs_with:
  - req-mirror-stays-on-the-machine ! — one is which tools a caged session can see, the other is which network addresses the mirror answers; different boundaries
weighs_against:
  - none
---

## Scenario

- Source: an agent entering a caged session.
- Stimulus: the host registers every tool visible to the model.
- Artifact: the session tool inventory.
- Environment: each supported harness launch path.
- Response: the lane remains available and native project tools remain unavailable.
- Response measure: zero native project tools; native web search remains visible when supported.
