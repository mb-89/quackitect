---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: nbr-parent-engine
type: "[[neighbour]]"
statement: The engine a descendant came from, standing in a repository the descendant has no path to.
direction: in
---

## Why this neighbour is new

THE PRODUCT HAS NEVER HAD AN ANCESTOR. product.md declares it
self-hosting and says so plainly - only Quackitect works on itself. Every
neighbour standing before this one is a tool, a person, a machine or a service.

THIS ONE IS THE SAME PRODUCT, EARLIER, SOMEWHERE ELSE. That is what makes it
strange to draw and worth drawing: the box in the middle and the box outside
are the same software, and the only thing separating them is lineage.

## Interface

INWARD, AND ONLY INWARD. Improvements the parent made after the descendant left
arrive as an UPDATE the descendant's owner runs. It is an act somebody
performs, never something that happens.

WHAT ARRIVES: the parent's own content at some later version, and enough
provenance to say where it came from.

WHAT DOES NOT ARRIVE: anything the descendant did not ask for, and anything at
a time the descendant did not choose.

## Nothing crosses the other way, and that is the point

NO WRITE, NO LINK, NO MOUNT, NO INSTALL STEP that resolves into the parent.
The rule names the DIRECTION OF WRITES rather than any mechanism, because a
rule naming one forbidden mechanism only invites the next one.
See [[raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours]].

ITS WITNESS IS NOT HYPOTHETICAL. On 2026-07-25 an npm `file:` dependency was
implemented as a symlink into a sibling checkout, and a routine
`git worktree remove --force` followed it and deleted that repository's working
tree and its .git.

WHAT MAY TRAVEL UP IS INFORMATION, THROUGH A DOOR THE PARENT OPENED. The
owner's own line, 2026-08-18: "if I have a process that analyzes the changes
and pushes them back as notes as design input to the vendor, that's okay."

SO THE ASYMMETRY IS NOT ABOUT TRUST. It is that a descendant's OPERATIONS never
reach the parent, while a descendant's PROPOSALS may - because a person at the
parent reads them and decides.

## What this neighbour is not

NOT A PEER MACHINE. [[nbr-peer-machine]] is another machine running this same
product with no lineage between them. A parent is where this copy came from.

NOT AN ORIGIN REMOTE. [[nbr-origin-remote]] is where a repository pushes and
pulls its OWN history. A descendant's origin is its own; the parent is a
different repository entirely.

NOT A DEPENDENCY. Nothing is resolved from it at run time. A descendant that
cannot reach its parent still works completely, which is the first goal of the
iteration that minted this node.
