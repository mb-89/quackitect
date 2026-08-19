---
id: raid-ar-a-bound-run-resolves-no-commit-newer-than-its-rewind-point
type: "[[raid]]"
kind: risk
statement: The architecture leaves req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point at risk — the response hinges on el-benchmark-guard.
owner: the adjudicator
trigger: any change to el-benchmark-guard, or to the scenario on req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point
status: open
impact: the ceiling rests on git merge-base and se_git does not offer it, so the exact primitive is unreachable through the lane; the fallback is deriving ancestry from log or rev-parse, which is more code for a weaker answer
breaks_how_badly: fatal
how_likely: <!-- the likelihood grade — the words live in meth-likelihood-scale, graded at the register review -->
source_refs:
  - evaluate-architecture, the scenario walk's verdict
  - req-a-bound-run-resolves-no-commit-newer-than-its-rewind-point
  - el-benchmark-guard
---

Walked at evaluate-architecture by agent. The scenario's response forms
at el-benchmark-guard; the tradeoff on the verdict line is what a wrong turn there
costs. The damage grade inherits from the requirement it protects.