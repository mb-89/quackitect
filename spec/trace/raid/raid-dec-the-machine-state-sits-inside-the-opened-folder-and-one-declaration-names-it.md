---
minted_in: i9
id: raid-dec-the-machine-state-sits-inside-the-opened-folder-and-one-declaration-names-it
type: "[[raid]]"
kind: decision
statement: The machine-state folder sits inside the folder a person opens, and exactly one declaration says what it is, from which path resolution, the lane's read exclusion, the producing acts' exclusion and the editor's hide rule are all generated.
owner: the driving agent
trigger: any change to what the machine-state folder is called or which of its files are withheld
status: decided
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - req-the-machine-state-sits-in-the-folder-that-is-open
  - req-only-a-file-with-its-own-door-is-withheld
  - req-product-is-a-folder
  - cand-nothing-can-be-forgotten, the declared winner
---

## Rejected options

THERE IS NO MACHINE-STATE FOLDER AT ALL, and the repository carries the state.
[[opt-there-is-no-machine-state-folder-the-repository-is-the-state]]. It removes
four problems at once and costs the walk being readable as plain files, which is
a blessed outcome of this iteration. It also could not shrink to zero files: the
raw note and the reading both have to stay outside version control.

THE FOLDER IS DIVIDED BY WHAT EACH PART BELONGS TO, the machine or a record.
[[opt-divide-the-machine-state-by-what-it-belongs-to]]. Rejected because it does
not settle where the walk's own position falls, and a cell with an open question
in it is not a cell to build on.

EACH MECHANISM KEEPS ITS OWN ANSWER, which is what ships today. Rejected on
measurement rather than taste: the M2 gate found two copies already drifting,
and the exclusion split multiplies the patterns that can disagree.

## Consequences

FOUR CONSUMERS BECOME GENERATED ARTEFACTS, and generated artefacts need a check
that they are current. That check is new work this decision creates.

THE FOLDER MUST BE RECOGNISABLE FROM OUTSIDE, by a name a pattern can match.
That is a marker by another name, and the M2 comparison recorded that we claim
not to need one.

### The prior-art back-check

CURSOR SHIPS THIS SHAPE ALREADY. Its convention is a directory ignored except a
committed subdirectory, which is the tracked-folder-ignored-contents arrangement
working in a product with users.

WHAT THE ORIGINAL DOES BETTER: it is a convention its users already know, and
ours is derived from first principles. It also splits by SUBDIRECTORY, which is
geometry, where ours splits by file and needs a rule.

WHAT IT PAID THAT WE HAVE NOT: living with the convention long enough for the
split to be tested by real projects.

WHAT WE ONLY LEARNED BY CHECKING: this iteration's own vision justified the plan
by citing our gitignore line for the editor's folder, which ignores ONE FILE and
tracks the rest, the opposite of what was wanted. The analogy was wrong and the
plan was right.
