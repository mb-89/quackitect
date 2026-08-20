---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: opt-walk-up-until-a-marker-is-found
type: "[[option]]"
statement: Find the product's root by starting where the caller is and walking up through the parent folders until a marker the system owns is found, refusing with the marker's name when none is.
cluster: the-walk
question: how the product's root is decided
found_by: prior-art
source: "git setup.c (the die() text names .git and the parent search); npm docs/lib/content/configuring-npm/folders.md; Cargo src/util/important_paths.rs; Black docs/usage_and_configuration/the_basics.md; uv docs/concepts/configuration-files.md"
---

## Mechanism

THE CALLER'S POSITION IS THE QUESTION AND THE ANCESTRY IS THE ANSWER. From the
working directory, look for the marker. Not there, look one level up. Repeat to
the filesystem root, then refuse and say what was looked for and where.

EVERY COMMAND-LINE TOOL IN THE SAMPLE DOES THIS, and npm wrote down why: the
command should still work when the person has moved into a subdirectory. git,
Cargo, Black, Ruff and uv all pay the same cost for the same benefit.

WHAT IT COSTS HERE. A search on every call, which git found expensive enough on
network disks to add a ceiling variable for. It also lands the system in
whatever repository happens to be above the caller, which is why git now
refuses to parse a config owned by somebody else.

WHAT IT BUYS HERE. The lane keeps working from anywhere inside the tree, and a
terminal whose working directory has wandered still resolves to the right
product. The machine-state folder is already the natural marker after this
iteration's collapse, so the marker costs nothing to introduce.

THE REFUSAL IS PART OF THE MECHANISM rather than an afterthought. Cargo names
the file it wanted, the directory it searched, and detects a mis-cased manifest
to tell the person to rename it. That special case exists because the
confusion was worth a special case.
