---
minted_in: i27
id: opt-confine-the-root-to-the-bound-tree
type: "[[option]]"
statement: hold the bound tree as a capability and resolve every path beneath it, so a path naming another tree cannot be expressed at all
cluster: cluster-the-walk
question: which tree a path resolves to
found_by: prior-art
source: "capability-based confinement — openat2 RESOLVE_BENEATH (Linux 5.6+), openat(O_RESOLVE_BENEATH) (FreeBSD 13+), and cap-std's Dir handle; https://github.com/bytecodealliance/cap-std/blob/main/README.md"
---

## Mechanism

The caller never names an absolute location. It holds a HANDLE to one
directory, and every open resolves beneath that handle. Escape is not
refused after the fact - it cannot be named.

cap-std implements this in one system call where the kernel supports it,
and the README states the reason plainly: RESOLVE_BENEATH catches the
error early rather than taking chances with user content inside the Dir.

WHAT IT COSTS HERE. Every path must pass one resolver, and the resolver
becomes the deepest and quietest point in the engine. We have no kernel
enforcing it, so the confinement holds only while no code path bypasses
that seam - which is exactly the hole SE-C-134 already has with se_run.

WHAT BREAKS IN TRANSLATION. A kernel handle survives a process; ours is a
variable. And the engine resolving the path is loaded from trunk while
resolving into the record's tree, which is the standing open assumption
raid-asm-engine-serves-from-the-bound-tree.
