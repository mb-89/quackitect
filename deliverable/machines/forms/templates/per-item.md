---
id: template-per-item
statement: Answer a known list — the form names the items; every one gets its answer.
editor: per-item
line_pattern: "^- .+: .+"
line_help: "every line is `- <item>: <answer>`, and every named item appears"
placeholder: what happened to it, in a few words
---

# per-item

The FORM supplies the items — its `items:` argument. A fixed list, or
`$inbox` for the live pending notes. The template stays generic; the
arguments make it concrete.

The editor shows one row per item; the answer goes beside each. Stored
as `- <item>: <answer>` per line.

An item with nothing to do still gets its answer: `nothing to do`.
