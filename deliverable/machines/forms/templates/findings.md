---
id: template-findings
statement: Findings with answers — nothing stands unanswered.
editor: findings
line_pattern: ^- .+ => .+
line_help: every line is `- <finding> => <answer>`
---

# findings

The attack produces findings; the defense answers every one. The editor
is a table of pairs — a new row appears as the last one fills. Stored as
`- <finding> => <answer>` per line.

- The answer is a fix, a rebuttal, or an accepted risk with its reason.
- A finding without an answer blocks the verdict — that is the point.
- No findings is a legal result and a claim like any other:
  `none => the attack found nothing`.
