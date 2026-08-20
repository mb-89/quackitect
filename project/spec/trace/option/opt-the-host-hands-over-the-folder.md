---
minted_in: i9-se-and-the-corpus-move-the-machine-state
id: opt-the-host-hands-over-the-folder
type: "[[option]]"
statement: Take the product's root from whatever opened the system rather than searching for it, so the folder a person chose is the folder the system works on and no rule decides otherwise.
cluster: the-walk
question: how the product's root is decided
found_by: prior-art
source: "VS Code docs/editing/workspaces/workspaces.md — a folder becomes a workspace by being opened and nothing else, and the product documents having no concept of a project at all"
---

## Mechanism

SOMETHING OUTSIDE ALREADY KNOWS THE ANSWER. An editor holds a folder handle
because a person picked it. The system takes that handle and stops asking.

THERE IS NO SEARCH, NO MARKER AND NO CONFIG. The selection mechanism is the
act of opening, and the vendor's own documentation is blunt about it: you do
not have to do anything for a folder to become a workspace other than open it.

WHAT IT COSTS HERE. It has no precedent outside a graphical editor, and the
reason matters. The editor owns exactly one root and there is nowhere else to
be, so the question cannot be ambiguous. A process started from a terminal has
no such handle and a working directory that wanders, so this option needs a
second answer for that case or it has no answer at all.

The same documentation concedes reduced capability when no folder is open,
which is the shape of that gap in the vendor's own product.

WHAT IT BUYS HERE. Nothing to configure, nothing to explain, and no way to
land in a tree nobody chose. Walking up can put a system inside a repository
the person never opened; this cannot.

THE HONEST NOTE. After this iteration's collapse the machine-state folder sits
at the root of the opened folder, so testing for it IS a marker check under
another name. This option and the walk-up option are one directory-walk apart
rather than opposites.
