---
unreachable_refs:
  - cand-the-program-route
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: el-change-reporter
type: "[[element]]"
statement: Answers what a vehicle made its own, by comparing the vehicle's content against the engine version it was cloned from and naming every path that differs.
kind: new
realization: make
group: the-bootstrap
implements:
  - fn-run-a-governed-walk.report-what-the-vehicle-changed
source_refs:
  - opt-the-copys-changes-are-derived-on-every-update
  - raid-dec-serve-the-overlay-and-report-the-drift
  - raid-dec-a-copy-is-a-clone-that-keeps-its-history
  - cand-the-program-route
  - vp-the-engine
---

## What it does

IT ANSWERS ONE QUESTION: what did this vehicle make its own. The answer is a
list of paths with, for each, what the engine shipped and what the vehicle now
holds.

THE COMPARISON IS DERIVED, NEVER DECLARED. Nothing is maintained by hand, so
the answer cannot silently stop being true. That is the whole reason the
derived option was picked over a declared list the vehicle's owner keeps.

THE BASE IS LOCAL, WHICH IS WHY THIS IS CHEAP. The version the vehicle was
built from is a commit in the vehicle's own repository, so the comparison needs
nothing of the engine's.

THIS PARAGRAPH SAID THE OPPOSITE UNTIL 2026-08-18, and it was wrong in a way
worth recording. It read: "the winning design makes a vehicle a CLONE that
keeps the engine's commits... under a vehicle sharing no commit with its engine
this element could not run at all."

THE OWNER REPLACED THE CLONE WITH A COPY and the conclusion did not follow the
premise across. A COPY HAS ITS OWN ROOT COMMIT, and that commit is the engine's
content exactly as it was vendored. The base is still local and still exact.
What changed is WHICH commit to name, never whether one exists.

SO THE ELEMENT DECLARED ITSELF IMPOSSIBLE under the design that was actually
chosen, and stood that way through the whole build. Realizing it is what caught
that.

## Why it is not part of el-engine-delta

[[req-overlay-drift-reported]] HAS THREE CLAUSES AND THEY ARE TWO ACTS, and the
two acts happen at different moments against different things.

- CLAUSE ONE is resolution-time. An overlay entry naming an identity the loaded
  version no longer provides is reported as unresolved rather than silently
  defaulted. That is [[el-engine-delta]]'s, and `flow-divergence-report` carries
  it.
- CLAUSES TWO AND THREE ARE THIS ELEMENT'S. What the vehicle changed relative to
  what it received, and that report making an arriving update decidable.

THE TWO COMPARISONS HAVE DIFFERENT OPERANDS. `el-engine-delta` compares an
overlay against a loaded method. This element compares a whole tree against a
commit. Collapsing them would put a repository operation inside the compiler.

## The framing is part of the element, not of whoever prints it

WHAT DID YOU MAKE YOUR OWN, never how far have you wandered. A vehicle's owner
changing things is the entire value proposition, so a report phrased as damage
would make the product argue with its own promise.

IT IS CARRIED HERE BECAUSE IT IS A PROPERTY OF THE ANSWER rather than of a
surface. Two surfaces showing the same report must not be able to disagree
about what it means.

## What crosses its boundary

IN: `flow-method-sources` and `flow-repository`, both crossing the system edge.

OUT: `flow-vehicle-inventory`, to [[el-update-runner]]. That is this element's
one interface, and it is [[if-change-reporter-to-update-runner]].

THE INVENTORY IS ALSO AN ANSWER IN ITS OWN RIGHT. A vehicle's owner can ask
this question without taking any update, which is why the element stands apart
from the one that consumes it.

## The realization concept

MAKE, AND IT IS MOSTLY A REPOSITORY QUERY. A diff against a known commit, then
a filter that drops what the engine itself moved, then the framing.

WHAT IS GENUINELY NEW is deciding which commit counts as "the version it was
built from" once a vehicle has taken several updates. That question belongs to
the update mechanism and is answered on [[if-change-reporter-to-update-runner]].
