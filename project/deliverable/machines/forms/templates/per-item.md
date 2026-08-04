---
id: template-per-item
statement: Answer a known list — every source item gets its line and its answer.
editor: text
line_pattern: "^- .+: .+"
line_help: "every line is `- <item>: <answer>` — nothing in the source list stays unanswered"
---

# per-item

The source list is known before the work starts — the inbox notes, a
checklist, a set of requirements. This field answers it item by item.

One line per source item: `- <item>: <answer>`.

- Every source item appears. A missing line is a missing answer.
- An item with nothing to do still gets its line: `- <item>: nothing to do`.
