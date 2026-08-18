---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-the-tree-names-what-not-where
type: "[[option]]"
statement: the produced tree records WHICH copy drives it and at what version, never where that copy sits, and the location is resolved fresh on every machine
cluster: the-walk
question: how a tree carrying no method finds the copy that drives it
found_by: prior-art
source: "Corepack packageManager (github.com/nodejs/corepack); Copier _src_path (copier.readthedocs.io/en/stable/configuring/); cruft .cruft.json (cruft.github.io/cruft/); Gradle wrapper distributionUrl (docs.gradle.org gradle_wrapper); Bazelisk .bazelversion (bazel.build/install/bazelisk)"
---

## Mechanism

THE COMMITTED RECORD CARRIES AN IDENTITY AND A VERSION, and no path at all.
Resolving that identity to something on disk happens per machine, at run time,
through a cache the tree knows nothing about.

FIVE SYSTEMS AGREE ON THE SHAPE, and they are the only mechanisms in a
thirty-five system sweep that survive all three moves cleanly.

- Corepack records a package manager name, version and integrity hash inside
  the project's own manifest.
- Copier records the template it came from as a remote address plus the commit,
  and warns never to edit that file by hand.
- cruft records the same two things for its own template lineage.
- The Gradle and Maven wrappers record a distribution URL, committed on
  instruction.
- Bazelisk records a bare version string, and Bazel's install page says to
  check it into version control for reproducibility.

WHY IT SURVIVES WHAT THE OTHERS DO NOT. There is no local path to go stale. A
colleague cloning onto a machine whose directory layout nobody here has ever
seen gets the same answer, because the answer was never about this machine.

AND IT IS THE ONLY MECHANISM THAT SURVIVES A COLLEAGUE'S CLONE, which is
exactly the case the owner named: a machine with the copy installed and no
knowledge of where it came from.

WHAT IT COSTS. A first run on a new machine has to resolve the identity, which
means a download or a lookup, and something must hold the resolved result.
Every one of the five accepts a machine-local cache for that.

THE CACHE IS NOT A CONTRADICTION OF THE ISOLATION RULE, and the distinction is
worth keeping sharp. A cache holds REGENERABLE data and can be deleted without
loss. The thing this product refuses to write outside its tree is a RECORD OF
IDENTITY, which cannot be regenerated. The sweep found the same split
everywhere: roughly thirty-five systems keep caches outside the tree, and not
one keeps the identity question's answer there.

WHAT IT DEMANDS THAT THIS PRODUCT DOES NOT YET HAVE. An identity for a copy
that means something on a machine which has never seen it. A copy produced by
this product today is a folder with a name, and two people could produce copies
with the same name. Corepack pairs a name with a version and an integrity hash;
Copier names a remote repository. Either is a real decision this iteration has
not made, and it is the question this option hands to record-adrs.

AND ONE VARIANT NEEDS NO RESOLUTION AT ALL. Where the copy and the driven tree
are on the same machine and the copy is already running, the identity only has
to distinguish it from other copies. That is a much smaller problem than the
general one, and it may be all this product needs.
