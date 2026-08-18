---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-the-update-arrives-as-a-program
type: "[[option]]"
statement: upstream ships not new content but a transformation that runs on whatever the copy currently holds, so the copy owns everything and still receives later work
cluster: the-bootstrap
question: how upstream's later work reaches a copy
found_by: prior-art
source: "Nx migrate (nx.dev/docs/features/automate-updating-dependencies), Angular ng update and update schematics (angular.dev/cli/update, angular.dev/tools/cli/schematics)"
---

## Mechanism

THE COPY OWNS EVERY FILE AND EDITS THEM FREELY. Upstream never sends a file.
It sends a MIGRATION — a program that reads what the copy holds now and
rewrites it.

TWO PHASES, KEPT APART DELIBERATELY. Nx splits them: one command bumps the
declared versions and writes a list of migrations without touching any source,
and a second command runs those migrations. Angular's is one command that
updates the packages and then runs whatever update schematic covers the version
span.

THE DIFF IS LEFT UNSTAGED FOR A PERSON TO READ. That is not an oversight. It is
the mechanism admitting it cannot promise the result is right, and Angular's
own documentation says a migration "aims to transform as much code as possible
automatically, but it may require some manual fixes by the project author".

WHY IT MATTERS MORE THAN ANY OTHER MECHANISM IN THE SWEEP. Roughly sixty
systems were read across five searches, and every other one makes the same
forced choice: hold a reference you cannot edit and receive updates, or hold a
copy you own and never receive another. This family is the only one that
refuses the choice.

SO IT IS THE ANSWER TO THIS ITERATION'S CENTRAL CONTRADICTION, and it answers
it by separation IN TIME. The copy's ownership is total at every moment.
Upstream's contribution is not content sitting beside the copy's content,
competing for precedence — it is an ACT that happens at update time and then is
over.

AND IT SURVIVES ARBITRARY RESTRUCTURING, which no diff-based mechanism does. A
program that says "wherever a rule names X, rename it to Y" works on a file the
copy reorganised completely. A patch against that file would have failed.

WHAT IT COSTS, AND THE PRICE IS PAID UPSTREAM, EVERY TIME. The author writes a
migration per breaking change, by hand. That is a permanent tax on making
changes, and it is why the mechanism is rare.

A SECOND COST FALLS ON THE COPY. Updates must be taken in order, one version
span at a time. Angular's tooling makes this a hard requirement rather than
advice, and a copy that skips several versions cannot catch up in one step.

THE FAILURE MODE WAS UNDERSPECIFIED AND IS NOW MEASURED. Nx's documentation
never states what a migration does when it meets a file the copy restructured,
so i16 ran it.

THE PROBE, in a throwaway repository with a real branch and a real three-way
merge. Upstream renames one identifier. Two copies: one that reordered the
file's sections and added a paragraph WITHOUT touching the changed line, and one
that reworded that very line.

| copy's edit | diff, merged three ways | program |
| --- | --- | --- |
| far from the change | CONFLICT | landed clean, kept the copy's edit |
| the same line | CONFLICT | landed clean, kept the copy's edit |

THE FAR CASE IS THE FINDING. That copy never touched the line upstream changed.
It only moved sections and added a paragraph, and the merge still conflicted,
because a reordered file reads to a line-based merge as delete-everything plus
insert-everything.

SO A COPY THAT RESTRUCTURES A FILE LOSES THE ABILITY TO MERGE ANY UPSTREAM
CHANGE TO IT, including changes to regions it never went near. The program route
is indifferent to layout because it names WHAT to change and never WHERE.

WHAT THE PROBE FAKED, so the result is not read wider than it earned: the
upstream change is one rename expressible as one substitution. A migration that
cannot be written that way — one needing to understand structure rather than
match text — is not covered by this run at all.

## The AI variant, which is new and directly relevant

NX 23 SHIPS PROMPT-BASED MIGRATIONS. Where a change cannot be expressed
deterministically, the migration hands the judgment to an installed coding
agent rather than failing or guessing.

THAT IS THIS PRODUCT'S OWN SHAPE. A method engine whose whole purpose is
driving an agent through governed steps is unusually well placed to receive an
update as a governed task rather than as a patch. The migration would be a
walk, and its evidence would be the record of what it decided.

IT IS ALSO THE LEAST PROVEN THING IN THIS NODE. One vendor, one release, and no
independent account of how it behaves. Recorded because it is the nearest thing
to our own architecture that anybody has shipped, not because it is
established.
