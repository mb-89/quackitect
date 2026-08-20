---
id: template-checklist
statement: Check off a known list — every item, deliberately.
editor: checklist
line_pattern: ^- \[(x| |owed)\] .+
line_help: every line is `- [x] <item>` checked, `- [ ] <item>` while it is not, or `- [owed] <item> — <ref>` addressed to an open raid entry
---

# checklist

The FORM supplies the items — its `items:` argument. A fixed list, or a
live source such as `$claim-specs` or `$iq_checklist`.

The editor shows one row per item with a checkbox. Stored as markdown
task lines: `- [x] <item>`.

CHECKING IS THE CLAIM. The field check refuses while any item stands
unchecked — an unchecked box is work still owed, said plainly. There is
no text to write; the deliberate click is the record.

A THIRD STATE, FOR WHAT CANNOT BE HONESTLY OBSERVED (owner ruling
2026-08-13). `- [owed] <item> — <ref>` stands in for a tick when an
unattended agent cannot check the claim. `<ref>` MUST name an OPEN entry
in the raid register (`spec/trace/raid/`) — a missing or
unresolved ref refuses exactly like an unchecked box. An owed item never
counts as checked, and it stays visible: the field check reports how
many are checked and how many are owed, naming the owed ones.
