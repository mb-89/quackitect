---
id: template-checklist
statement: Check off a known list — every item, deliberately.
editor: checklist
line_pattern: '^- \[[ x]\] .+'
line_help: "every line is `- [x] <item>` checked, or `- [ ] <item>` while it is not"
---

# checklist

The FORM supplies the items — its `items:` argument. A fixed list, or a
live source such as `$claim-specs` or `$iq_checklist`.

The editor shows one row per item with a checkbox. Stored as markdown
task lines: `- [x] <item>`.

CHECKING IS THE CLAIM. The field check refuses while any item stands
unchecked — an unchecked box is work still owed, said plainly. There is
no text to write; the deliberate click is the record.
