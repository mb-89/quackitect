---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: opt-work-is-a-file-in-the-working-tree
type: "[[option]]"
statement: hold each piece of work as its own text file in the working tree, its frontmatter carrying place, status, difficulty and dependency
cluster: the-work
found_by: prior-art
source: the vault-and-plugin pattern, where a folder of markdown files with frontmatter is queried as a table; and req-every-artifact-is-readable-text, which already demands text a person can open
---

## Mechanism

ONE FILE PER PIECE OF WORK, in the tree, beside everything else the record
holds. The frontmatter carries the fields; the body carries the guidance and
the evidence. A person opens it in any editor and changes it without the
system running.

WHAT IT COSTS HERE. Every read of what a position owes is a folder listing
plus a parse, and the count grows with the record. Two shipped trackers
rejected exactly this shape, and their reasons are the cost: a large project
puts thousands of these files into the tree, and version control makes each
one a merge surface.

WHAT IT BUYS THAT NOTHING ELSE DOES. The work is legible and editable with no
software at all, which is the one property the corpus already demands of
every artifact it keeps.
