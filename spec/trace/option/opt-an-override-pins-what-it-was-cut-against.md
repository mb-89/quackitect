---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-an-override-pins-what-it-was-cut-against
type: "[[option]]"
statement: each override records the version of the thing it was written against, and the machine refuses when that thing has moved since
cluster: the-bootstrap
question: how a stale override is caught
found_by: prior-art
source: AOSP repo manifest base-rev (github.com/GerritCodeReview/git-repo/blob/main/docs/manifest-format.md), patch-package version-stamped filenames (github.com/ds300/patch-package)
---

## Mechanism

THE OVERRIDE CARRIES A STAMP naming the upstream state it was authored
against. Before applying it, the machine compares that stamp with what upstream
now is, and stops if they differ.

AOSP's repo TOOL DOES THIS DELIBERATELY. Its `base-rev` attribute "adds a check
against the revision to be extended. Manifest parse will fail and give a list
of mismatch extends if the revisions being extended have changed since base-rev
was set." Its stated purpose is to "prevent patch branches hiding newer
upstream revisions".

patch-package DOES A WEAKER VERSION by putting the version in the filename, so
a patch is visibly bound to the release it was cut against.

WHAT IT BUYS, AND IT IS THE FAILURE MODE NOTHING ELSE CATCHES. An override that
still applies cleanly can still be WRONG, because the thing it overrides has
changed underneath it for a reason the copy never saw. Every other mechanism in
the sweep is silent about this: if the patch applies, the update passes.

SO IT ANSWERS THE SILENT-STALENESS HAZARD rather than the silent-loss one. Loss
is loud in most systems. Staleness is loud in almost none.

WHAT IT COSTS. Somebody must re-stamp after every deliberate review, and AOSP's
own documentation warns the mechanism "is misleading if branches are used as
base-rev" — the stamp has to name something immutable or it says nothing.

AND IT PRODUCES NOISE IN PROPORTION TO UPSTREAM'S PACE. Every upstream touch of
an overridden artifact raises a question, whether or not the change matters to
the override. A copy tracking a fast-moving source pays that constantly.

IT COMPOSES RATHER THAN COMPETES. It is a check ON an override scheme, so it
sits on top of a patch series, a mirror-and-overlay layout or an
identity-keyed replacement equally well.
