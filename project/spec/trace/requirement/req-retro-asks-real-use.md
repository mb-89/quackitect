---
id: req-retro-asks-real-use
type: "[[requirement]]"
statement: When a retro opens, the engine shall ask what came back from real use since the previous retro and shall store every answer as a note before draining begins.
kind: functional
verify_method: demonstration
breaks_if_removed: Feedback from real use evaporates and the retro judges notes without field evidence.
refines:
  - uc-drain-the-inbox
source_refs:
  - uc-drain-the-inbox step 2
priority: should
weighs_against:
  - req-comparison-carries-both-sides >
---
