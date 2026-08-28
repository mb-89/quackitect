---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-dec-one-editor-is-widened-rather-than-a-second-written
type: "[[raid]]"
kind: decision
statement: The token editor is built by widening the existing table editor rather than writing a new one, so that understanding one editor means understanding all of them.
owner: the owner role
trigger: the first change to the widened editor that nobody wants to make, and any proposal for a second editor doing a job the first already does
status: open
impact: Going the other way splits the cell machinery in two, and the divergence shows up later as two surfaces that disagree while both keep working.
breaks_how_badly: corrosive
how_likely: conceivable
source_refs:
  - i63-work-tokens-become-the-unit-of-work-and-
---

## What already fits

THE EXISTING TABLE EDITOR IS ROWS-ARE-NODES AND COLUMNS-ARE-FRONTMATTER, which
is the token editor's data model with no translation. It writes straight
through with no second copy, resizes columns by dragging their edge, offers a
constrained column's source as a chooser, and keeps a value that is no longer
offered rather than blanking it.

## What genuinely does not exist

FOUR THINGS HAVE NO PRECEDENT ANYWHERE IN THE TREE, and saying otherwise would
promise reuse that is not there.

- Grouping rows into buckets, and folding a bucket by its header.
- Two panes side by side.
- Dragging a row from one pane to the other.
- A plus that mints a token from a template.

## The counter-cost, said once

A WIDGET THAT ACCUMULATES SPECIAL CASES EVENTUALLY BECOMES THE THING NOBODY
DARES CHANGE. That is real, and it is the usual reason people argue the other
way.

IT DOES NOT WIN HERE. Nineteen editors already stand, so learnability is the
scarce thing, and the failure this system has measured is divergent copies
rather than an overgrown widget.

## Why it is graded conceivable

THE DECISION PROVES WRONG ONLY IF the widened editor becomes both unchangeable
and load-bearing at the same time. Either alone is recoverable.

## Rejected options

WRITE A NEW EDITOR FOR TOKENS. REJECTED. It splits the cell machinery in two,
and the divergence shows up later as two surfaces that disagree while both keep
working. That is the failure this system has actually measured.

BUILD ON THE LARGEST EXISTING EDITOR INSTEAD. REJECTED. It carries the most
pointer machinery of the three, but its data shape is not rows-are-nodes, so
every cell would need translating.

EXTRACT A SHARED WIDGET AND HAVE BOTH USE IT. REJECTED for this round as more
work than widening one, though it is the honest answer if a second editor ever
is needed. It is also what the cross-surface drag will force anyway, since a
gesture spanning two surfaces cannot live inside either.

## Consequences

A CHANGE TO THE WIDENED EDITOR REACHES EVERY SURFACE THAT USES IT. The blast
radius of a cell-level change grows with each adopter.

ANYTHING GENUINELY REUSABLE MUST BE BUILT AS A WIDGET, not as a special case,
because the ruling is that one editor taught is every editor taught.

THE SURFACE REFUSAL ALREADY GUARDS THE NEGATIVE HALF. A module that starts
emitting widget markup without being registered is refused. This decision adds
the positive half: widen the first one.

THE COUNTER-COST IS ACCEPTED AND NOT DENIED. If the widened editor does become
unchangeable, extracting the shared widget is the recorded way out.

## One thing to find out first

FILTER, FOLD AND SCROLL CODE EXISTS ACROSS SEVEN SURFACE FILES. Whether that is
one mechanism or seven copies is not known. If it is several, this round folds
them into one rather than adding an eighth.
