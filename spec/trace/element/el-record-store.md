---
minted_in: i1
id: el-record-store
type: "[[element]]"
statement: Holds the records — what exists is read from the folders on trunk, and a closed one is folded into a single file and read back at a recorded commit.
kind: existing
realization: make
group: the-record-life
implements:
  - fn-run-a-governed-walk.hold-the-work
  - fn-run-a-governed-walk.land-the-work
  - fn-run-a-governed-walk.close-a-record
  - fn-run-a-governed-walk.keep-the-archive
satisfies: null
source_refs:
  - cand-thin-worktree
  - raid-dec-thin-tree
  - raid-dec-git-is-the-list-of-iterations
  - raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed
  - req-record-status-comes-from-the-record
  - req-archive-shows-it-as-it-closed
  - req-archive-lists-every-closed-record
---

## What it does

The record life's substrate is ONE TREE. What OPEN records exist is answered by
the folders standing on trunk, so a clone that has trunk has every open record.

A CLOSED RECORD HAS NO FOLDER, so folders cannot answer for it. The archive
reads closed records from the FOLDED FILES, which stay on trunk when their
folders go.

EVERY CLOSED RECORD FOLDS, THE OLD ONES INCLUDED (owner ruling, 2026-08-26,
correcting an earlier one the same day). The aim is that NO old iteration keeps
a folder. Putting the old ones into version control means folding them too.

THE OLD ONES CARRY NO WORK TOKENS, because work tokens did not exist when they
were walked. Their folded files hold what they held: evidence forms, machines,
the route. The format has to survive that absence rather than assume the field.

SO THERE IS ONE SHAPE FOR THE ARCHIVE, NOT TWO. That is simpler than the
two-shape world an earlier ruling described, and it is the newer answer.

## The one inference presence supports, and it runs one way only

A FOLDED FILE MEANS CLOSED. That direction is safe and it is the whole of what
shape tells you.

THE REVERSE IS NOT TRUE. A folder does not mean open — it can be PLANNED, or
seeded, or half-walked (owner, 2026-08-26). Anything not folded is something
else, and which something else is the status field's answer rather than the
filesystem's.

SO THE RULE IS ASYMMETRIC ON PURPOSE. Reading closed off a folded file is one
fact the shape genuinely carries. Reading OPEN off a folder is an inference the
filesystem cannot support, and it is the one
[[req-a-records-own-status-decides-whether-it-is-open]] was written against.

THE DECISION IS STILL THE STATUS FIELD'S. Folded-means-closed is an INVARIANT
the archive can rely on, not the procedure that answers the question. The
procedure reads status, every time, from whichever shape holds the record.

THAT REQUIREMENT STAYS, and its motivation is written in its own file rather
than being unclear. Observed 2026-08-16: i28 carried `status: shipped` and its
worktree still stood. The survey left it out and the container's list kept it
in. Two readers, one record, opposite answers, and nothing said so.

IT IS NOT AN ARCHIVE RULE. It is about a shipped record standing in the open
list, which the fold neither causes nor cures. Six sites decide openness by
asking the filesystem today, and the fold gives them a second wrong thing to
ask rather than a first.

AN OPEN RECORD IS NEVER IN THE ARCHIVE AND NEVER ONLY IN VERSION CONTROL, so no
extra flag is needed to keep the two apart.

[[req-archive-lists-every-closed-record]] asks for every closed record and zero
live ones, and the folded files answer it directly.

THIS PARAGRAPH USED TO SAY FOLDERS ANSWER FOR EVERYTHING. Under i34 that was
true. i63 makes it false for closed records, and leaving it would have had one
element contradict itself eight lines apart.

Closing refuses loose ends, then FOLDS the record. Every evidence form and every
settled piece of work goes into one file, the folder leaves the working tree,
and the commit holding the pre-fold state is recorded where a reader finds it.

THE FOLD IS LOSSLESS, and that is a demand rather than a preference.
[[req-archive-shows-it-as-it-closed]] is a must graded fatal, and it asks for
zero states omitted and zero bytes differing. So a form goes into the folded
file VERBATIM. A summary, a rendering or a truncation fails that row outright.

THE ARCHIVE READS BOTH SHAPES. The folded file answers the ordinary question.
The recorded commit answers anybody who wants the original folder, file by file,
which is how the pre-fold shape stays reachable after a format change.

THIS PARAGRAPH SAID THE OPPOSITE UNTIL i63. It read "leaves the folder where it
is", which was true under i34 and is the reverse of what i63 chose. One file,
two answers, and the newer one is right.

THE SAME MISTAKE HAPPENED AT i6 and is recorded here because it repeated. That
time it read "the substrate is git branches" while the section below recorded
i34 removing exactly that.

## What the fatal must demands of the fold's shape, beyond losslessness

GOING IN VERBATIM IS A PROPERTY OF WHAT ENTERS. The row is about what comes
OUT, and it asks for four things rather than one.

- EVERY STATE DRAWN AS IT FINISHED, with the walked route visible.
- EVERY EVIDENCE FORM shown exactly as it was filled, zero bytes differing.
- EVERY GATE showing its rounds, its verdict, and the blessing hand with the
  day.
- A SUSPECT MARK shown beside a bless whose input moved, never in place of it.

SO THE FOLDED FILE MUST BE SEPARABLE BACK, per state, byte for byte. A
concatenation is not separable on its own: the boundary between two parts has to
be something the content cannot produce, or the parts have to carry their
lengths. Which of the two is the build's choice; that one is needed is not.

THE ROUTE AND THE MACHINE FILES GO IN TOO. Drawing every state as it finished
reads the record's machine files, and those sit in the folder that leaves. A
fold that carries only the evidence forms answers the second demand and fails
the first.

THIS IS WRITTEN AS A DEMAND ON A DESIGN THAT DOES NOT EXIST YET. Nothing here
claims the shape is chosen.

## The format is the designer's, and two constraints are lifted

OWNER RULING, 2026-08-26: find a good format, and there is no preference. It
goes into version control either way.

TWO THINGS ARE NO LONGER DEMANDED OF THE FOLDED FILE.

- IT NEED NOT BE HUMAN READABLE. Nobody opens it directly.
- IT NEED NOT BE HUMAN EDITABLE. Editing a closed record is refused anyway.

WHY THOSE FALL AWAY. A closed record is reconstructed rather than opened, so
what a person meets is the reconstruction and never the file.

ONE THING IS DEMANDED HARDER INSTEAD. THE WHOLE ITERATION MUST BE
RECONSTRUCTABLE FOR BROWSING — the owner wants to browse an archived iteration
and see the whole statement stream. That is the same demand the fatal must
makes, arriving from the person rather than from the corpus, and the two agree.

SO THE TRADE IS EXPLICIT: readability of the FILE is given up, and readability
of the RECONSTRUCTION is what replaces it. A format that cannot be turned back
into a browsable iteration fails, whatever it costs to store.

## It resolves a record's content, whichever shape that record is in

ASKING FOR A RECORD'S CONTENT IS THIS ELEMENT'S JOB and nobody else's. An open
record answers from its folder. A closed one answers from its folded file, or
from the recorded commit where the original shape is wanted.

THE CALLER NEVER KNOWS WHICH. That is the whole point of putting the resolution
here: the fold's format is known in one place, so changing it touches one place.

FOURTEEN ENGINE FILES CURRENTLY BYPASS THIS, building a record path themselves
and reading the disc, at 33 sites. That is a boundary this element already draws
and the code does not respect, and it is filed as
[[raid-iss-fourteen-files-reach-past-the-record-store-and-touch-its-substrate]].

IT IS A CROSSED BOUNDARY RATHER THAN A MISSING ELEMENT. Naming it that way
matters: a missing element would have to be invented, and a crossed boundary is
routed through the element that already stands.

## How the list is read

THE LIST READS FROM TRUNK and it reads in ONE batched call. Asking git once per
iteration measured 1004 ms over 33 branches against 58.7 ms batched
([[raid-dec-git-is-the-list-of-iterations]]). That measurement is why the read
is batched; since i34 it reads directories rather than refs, and the reason for
batching is unchanged.

## What moved away from it, and then came back

THE WORKTREE WAS TAKEN OFF THIS ELEMENT ON 2026-08-15, on the reasoning that a
tree hangs off a live claim and so belonged to the claim ledger.

THAT REASONING IS GONE WITH THE LEDGER (owner ruling 2026-08-16). i34 retires
the machine-locking specification whole and removes worktrees with it, so
there is no tree to hang off anything and no second element to own one.

WHAT THIS ELEMENT OWNS NOW is the record's folder on trunk, from the seed that
mints it to the close that folds it away.

IT DOES NOT WRITE A PIECE OF WORK. The work store does that, and it hands its
work over at close. Closing is a record-level act, which is why the fold lives
here and not there.

Boundary: the interfaces the element matrix mints for its flows.

Realization: git supplies isolation and history; the store logic is ours.
