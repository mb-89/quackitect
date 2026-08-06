---
id: req-refusal-carries-remedy
type: "[[requirement]]"
statement: "When the system refuses a call, the engine shall answer with a typed refusal carrying the clause, the expected, the got, and an executable remedy."
kind: interface
verify_method: test
breaks_if_removed: "A refusal strands the agent; recovery becomes guesswork instead of one corrected call."
refines:
  - uc-take-a-step
source_refs:
  - uc-take-a-step ext 3a
  - ".se/req-mine-v2.md: errors and refusals"
  - ".se/req-mine-v1.md: refusals and honesty"
priority: should
---

## Detail

## Detail

Every refusal carries four parts:

| part | content |
| --- | --- |
| clause | the stable id of the rule that fired |
| expected | what the rule wanted |
| got | what arrived |
| remedy | the corrected call, ready to send |

Both sides of the boundary: the engine owns the refusal's shape; the driving agent consumes the remedy as its next call. Zero refusal paths return an untyped error.
