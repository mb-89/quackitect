---
minted_in: i27
id: opt-overlay-the-shared-layer-under-each-record
type: "[[option]]"
cluster: cluster-the-walk
question: how shared method reaches a tree
found_by: prior-art
statement: mount shared method as one read-only lower layer under every record's own writable layer, so a change to the shared layer is visible everywhere at once and no record's writes touch it
source: "OverlayFS — lowerdir read-only, upperdir writable, copy-on-write, native performance after open; https://docs.kernel.org/filesystems/overlayfs.html"
pruned_because: "the repository lives on the Windows filesystem and WSL reaches it over 9p/drvfs, which overlayfs is documented to refuse for some lower filesystems; and requiring WSL breaks req-setup-floor-editor-shell"
---

## Mechanism

One shared layer, read-only, holding method. One private layer per record,
writable, holding that record's work. The union is what the walk sees.

A change to the shared layer is visible to every record at once, with no
copying and no fan-out pass. A record's write goes to its own layer by
copy-on-write and cannot reach anyone else.

THAT ANSWERS BOTH HALVES OF req-shared-change-reaches-without-unlanded-work-
reaching AT ONCE, which nothing else on this chart does. Propagation is free
because there is one copy; isolation is free because writes go up, never
down.

## Why it is pruned

THE FILESYSTEM SEAM. The repository sits on the Windows filesystem and WSL
reaches it through 9p/drvfs. OverlayFS restricts which filesystems may be a
lower layer - the kernel list carries "filesystem of lowerdir is not
supported" - and overlay over VirtioFS is an open issue on the virtio-fs
tracker. Primary confirmation for drvfs specifically was NOT found, so this
is a strong expectation rather than a settled fact, and it is one cheap probe
away from being either.

MOVING THE REPOSITORY INSIDE WSL does not fix it. Every Windows-side surface
- the editor, the panel, Windows git - then reaches the tree over \\wsl$\,
which is slow and is a second resolution seam. That trades this record's
problem for another instance of it.

THE INSTALL COST. `wsl --install` is one command and needs virtualisation,
administrator rights and a reboot. req-setup-floor-editor-shell demands the
setup complete on a computer holding only an editor and a shell. A hypervisor
is not that.

## What survives the pruning

THE SHAPE, and we can have it with git alone. Sparse-checkout keeps shared
method OUT of the record's tree entirely, so there is one copy to change and
nothing in the tree to resolve wrongly - the same division overlay draws,
without a platform dependency. That is raid-dec-thin-tree, decided at i1 and
measured unbuilt on 2026-08-14.

RECORDED RATHER THAN DROPPED. A dead end is evidence nobody pays for twice,
and the next person to reach for overlay should meet the filesystem seam and
the install cost before spending a day on it.
