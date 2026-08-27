---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: opt-work-lives-in-the-version-control-object-store
type: "[[option]]"
statement: hold each piece of work as a versioned object under its own reference rather than as a file the working tree shows
cluster: the-work
found_by: prior-art
source: "git-bug's README, which says in as many words that it embeds issues as objects in a git repository, not files"
---

## Mechanism

THE WORK IS STORED THE WAY THE HISTORY IS STORED, under references of its
own. It travels on push and pull like anything else, it is versioned for
free, and the working tree never shows it.

WHAT IT BUYS. The tree stays the size of the product. Thousands of pieces of
work cost nothing a person browsing the folders has to step over, and the
clutter objection that two shipped trackers raised does not apply.

WHAT IT COSTS HERE, and it is the one thing that matters. The work stops
being readable without the system. A person cannot open an work token in an
editor, and the corpus's standing demand that every artifact be readable text
would have to be answered another way — by an export, or by a rule that this
one kind of thing is exempt.

IT IS A REAL OPTION ANYWAY. The demand is that a person can READ it, and a
system that renders the object into text on request satisfies that reading
without keeping a file.
