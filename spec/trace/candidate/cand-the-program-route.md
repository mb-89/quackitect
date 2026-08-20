---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: cand-the-program-route
type: "[[candidate]]"
name: The program route
statement: the copy owns every file outright, and upstream's later work arrives as a transformation that runs on whatever the copy now holds
picks:
  - "[[opt-a-clone-that-keeps-its-history]]"
  - "[[opt-the-copys-changes-are-derived-on-every-update]]"
  - "[[opt-an-override-is-recut-rather-than-maintained]]"
  - "[[opt-the-tree-names-what-not-where]]"
  - "[[opt-override-by-declared-identity]]"
  - "[[opt-the-override-merges-into-what-it-changes]]"
  - "[[opt-the-update-arrives-as-a-program]]"
  - "[[opt-the-bound-travels-with-the-act]]"
  - "[[opt-two-overlays-one-shared-one-personal]]"
---

## Why this one

IT BETS ON THE ONE MECHANISM THE SURVEY FOUND THAT REFUSES THE USUAL CHOICE.
Roughly a hundred products were read and every one makes the copy pick: hold a
reference you cannot edit and receive updates, or hold a copy you own and never
receive another. Codemods are the exception, and i16's own probe measured why —
a copy that merely reordered a file hit a merge CONFLICT on an upstream change
to a line it never touched, needing a person to settle it, while the same change
shipped as a program applied with no conflict at all.

BOTH HALVES ARE WEAKER THAN THEY FIRST READ, and the gate of 2026-08-18
corrected them. The merge lost nothing: the run printed `upstream change
landed: True` and `copy's own edit kept: True` beside `merge exit: 1`, so the
cost is one human resolution rather than lost work. And the program arm was a
text substitution checked for its own effect, so no failure mode was available
to it. It DEMONSTRATES that a what-not-where change is indifferent to
restructuring. It does not MEASURE it.

WHAT IT TRADES AWAY IS PAID UPSTREAM, EVERY TIME. Somebody has to hand-write a
migration per breaking change, forever. That is why the mechanism is rare, and
it is the reason to doubt this line rather than any doubt about whether it
works.

AND IT RESTS ON SOMETHING THE PROBE DID NOT TEST: a migration expressible as a
text substitution. The interesting ones are exactly the ones it faked.

## How it works

THE COPY IS AN ORDINARY CLONE THAT KEEPS ITS HISTORY, and from that moment owns
every file in it without qualification. It edits whatever it likes, wherever the
file sits.

AN OVERRIDE STILL EXISTS, and it is smaller than a file. It names the artifact
it replaces by that artifact's own stable identity rather than by where either
file sits, and it states only the keys it changes, which the machine merges into
the received artifact key by key. The copy's own layer is two layers — one
committed and shared by everybody who clones it, one machine-local and never
committed — resolved in that order.

UPSTREAM'S LATER WORK ARRIVES AS A TRANSFORMATION. Not a file, not a diff: a
program that reads what the copy currently holds and rewrites it. The diff is
left unstaged for a person to read, because the mechanism does not claim the
result is right.

THE SEAM THAT MAKES THIS WORK is that the program names WHAT to change and
never WHERE. That is why it is indifferent to how the copy has restructured a
file, and it is the property this iteration's probe measured directly.

OVERRIDES ARE DISPOSABLE RATHER THAN DURABLE, re-cut against the current
upstream on each update instead of nursed across them. And the write jail's
bound becomes a property of the act, so producing a tree is bounded by the tree
it is producing rather than by a constant — which is what lets the CREATE
VEHICLE button exist at all.

WHAT STAYS is the lane, the walk and the trace corpus.

### Two questions, two mechanisms

RUNNING INSIDE ITS OWN COPY, the system finds its method by walking up from its
executable, exactly as the predecessor does. Nothing is recorded and nothing can
go stale, because the answer was never stored anywhere.

DRIVING A TREE THAT CARRIES NO METHOD, the tree records WHICH copy drives it and
at what version, never where that copy sits. That is
[[opt-the-tree-names-what-not-where]].

AND A TREE WITH NO SUCH RECORD IS NOT A DRIVEN PROJECT. The system refuses to
come up in it, and names the record it looked for and did not find. Three states
rather than two: no record, refuse and say what was sought; a record resolving to
nothing on a machine that has never seen the named copy, refuse naming the
identity; a record that resolves, come up.

## Repaired 2026-08-18, on the owner's go

THIS LINE WAS GATED OUT AND IS BACK. It picked
[[opt-the-executable-finds-its-own-home]] on the row above, which records
nothing, and [[req-the-system-runs-in-a-tree-that-is-not-its-own]] is priority
must and binds resolution to a recorded pointer. A must gates whatever a
candidate scored, and this one had dominated every rival on the table.

THE REPAIR IS ONE PICK AND NOTHING ELSE MOVES, which is why it was worth making.
Three of this line's other picks already pay the identity pin's price. Its
producing act is bounded by the tree it produces, so the record has a writer.
Its resolution already matches by stable identity, so the namespace exists. Its
updates already go in order, one version span at a time, so a version is already
part of the model.

AND IT STAYS A DIFFERENT DESIGN. After the swap it differs from
[[cand-everything-declared]] on five of nine rows, and four of those are the
payment axis: upstream hand-writing a migration per breaking change against the
copy's owner declaring every edit before making it. That is the opposite answer
to the question the chart exists to ask, not a wording difference.

THE PREDECESSOR'S OWN MECHANISM WAS NOT COPIED, DELIBERATELY. v1 keeps this
pointer in a machine-local data home keyed by a hash of the absolute path. Move
the vehicle and it resolves to a layer-less path, is silently skipped, and a
machine-global pointer answers instead — a wrong answer rather than an absent
one. Recording an identity rather than a location has no local path to go stale.

## What it costs

THE PRICE IS PAID UPSTREAM, EVERY TIME, AND FOREVER. Somebody writes a migration
by hand for every breaking change. That is a permanent tax on making changes at
all, and it is why the mechanism is rare rather than obvious.

BUILD IS THE LARGEST OF THE FOUR. Identity-keyed resolution, key-level merging,
a two-layer overlay, a migration runner with a two-phase split, and a change to
how the write jail is bounded. Only the last of those is small.

THE WORST CASE THAT DECIDES VIABILITY is a migration that cannot be written as a
text substitution — one needing to understand structure rather than match text.
The probe here faked exactly that, so this candidate's central claim is
established only for the easy half of the space.

THE FAILURE MODE THAT DECIDES is a migration that runs, succeeds, and produces
something wrong. Nothing here refuses; the diff is left for a person, and a
person who does not read it has no signal at all.

AND A SECOND COST FALLS ON THE COPY. Updates must be taken in order, one version
span at a time. A copy that skips several cannot catch up in one step, which the
source domain enforces as a hard requirement rather than as advice.

THE RECORDED IDENTITY ADDS A THIRD, and it is small here because the machinery
is already present. A first run on a machine that has never seen the named copy
has to RESOLVE the identity, which means a lookup and something to hold the
result. That is work this line does not otherwise need.

AND IT INHERITS ONE UNMADE DECISION. What a copy's identity actually IS has not
been decided. A copy produced today is a folder with a name, and two people
could produce copies with the same name. Whether identity is a name, a content
hash, or something a person assigns is a real question this iteration has not
answered, and it now blocks two candidates rather than one.

MAKE, REUSE OR BUY: all make. Nothing off the shelf does this for a corpus of
markdown method artifacts, and the two products that do it for code are tied to
their own package ecosystems.

## What it leans on

THAT THE INTERESTING MIGRATIONS ARE EXPRESSIBLE AS PROGRAMS. This is the
candidate's load-bearing belief and the probe did not test it. A trigger exists
and is cheap: write one migration that must reorder a document's sections rather
than rename a token, and see whether it can be written at all.

THAT SOMEBODY UPSTREAM WILL KEEP WRITING THEM. The tax is permanent and falls on
whoever maintains the source. A source that stops writing migrations does not
degrade gracefully — it silently stops delivering, and no copy learns.

AND THAT AN AI AGENT CAN CARRY THE JUDGMENT WHERE A PROGRAM CANNOT. One vendor
has shipped exactly that, handing the decision to an installed coding agent when
a change cannot be expressed deterministically. One vendor, one release, and no
independent account. It is the nearest thing to this product's own architecture
that anybody has shipped, and it is unproven.
