---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-an-undeclared-change-refuses
type: "[[option]]"
statement: the machine compares what the copy holds against what it received, and refuses to proceed while any difference is not declared with a reason
cluster: the-bootstrap
question: how a copy's own changes are represented
found_by: prior-art
source: "dpkg-source --abort-on-upstream-changes (manpages.debian.org/unstable/dpkg-dev/dpkg-source.1.en.html), yocto-check-layer common.test_patches_upstream_status (docs.yoctoproject.org/contributor-guide/recipe-style-guide.html)"
---

## Mechanism

THE CHECK RUNS AT A MOMENT THAT MATTERS and stops everything until the record
is true. Two systems do it, at two different levels, and they are the only two
found.

DEBIAN CHECKS THE CONTENT. On build, dpkg-source re-extracts the pristine
upstream, applies every declared patch, and diffs against the working tree. A
non-empty diff means changes nobody declared, and the build FAILS. Its
`--abort-on-upstream-changes` exists, in its own words, "to ensure that all
changes were properly recorded in separate quilt patches".

YOCTO CHECKS THE METADATA. Its layer-compatibility script carries a test that
verifies every patch file in a layer carries an upstream-status tag, and
passing it is required for the compatibility badge. That is the only case found
where the REASON, not just the change, is machine-enforced.

WHAT IT BUYS. The inventory cannot rot. Every other declared-authorship system
in the sweep decays at exactly the rate its humans decay — Chromium's field is
checked for FORMAT only and can lie without failing anything.

AND IT CONVERTS A CONVENTION INTO A MECHANISM, which is the difference between
a rule and a habit.

WHAT IT COSTS. It refuses work at an inconvenient moment, by design. Somebody
who edited a file in a hurry cannot finish until they have said why, and that
is the point rather than a side effect.

IT ALSO NEEDS A PRISTINE COPY OF WHAT WAS RECEIVED, kept beside the working
tree, or the comparison has nothing to compare against.

AND IT MUST NOT BE CONFUSED WITH SEALING. Nothing here forbids a change. The
copy may alter anything it likes. The machine only refuses to let the change
be SILENT, which is the opposite of a lock.

## The half this one does not carry

THIS SAYS THE MACHINE REFUSES WHILE A DIFFERENCE IS UNDECLARED. It says nothing
about what a declaration has to LOOK like to be worth having, and an open text
field fills with "needed for our use case" within a month.

[[opt-a-deviation-names-a-reason-from-a-closed-set]] IS THE OTHER HALF, taken
from building regulation rather than from software. It gives the declaration a
fixed vocabulary, a pointer running both ways between the change and its reason,
and something with standing to reject.

TAKING ONE WITHOUT THE OTHER FAILS IN A NAMED WAY. This alone is a gate nothing
meaningful can satisfy. That alone is a vocabulary nothing enforces.
