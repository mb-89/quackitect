---
minted_in: i9
type: "[[raid]]"
id: raid-asm-a-per-person-place-outside-every-project-exists-on-each-platform
kind: assumption
statement: "Every platform this system runs on is assumed to give one writable place that belongs to the person rather than to any project, which survives between sessions and which no checkout can reach into."
owner: the driving agent
trigger: "the first time this system runs on a platform nobody has tried. Its first trigger, before the consent record is designed, fell away with that record on 2026-08-19."
status: closed
probe: "holds on Windows, unprobed elsewhere. The probe this entry asked for was run in its own words - a directory was created outside every project, written, read back byte-identical, and removed. Three of the four properties hold here: it exists, it is writable without ceremony, and no checkout reaches it by path. Survival across a product update was not exercised. POSIX is unprobed for the plain reason that this machine is Windows, which says nothing at all about a POSIX host. The ephemeral host is untouched and is the sharp corner - a machine created for one run and destroyed has nothing that survives between sessions, by construction."
probed: 2026-08-19
impact: "NOTHING RESTS ON THIS ANY MORE. It was minted because the consent row demanded a record kept outside the folder it is about, and the owner struck that record on 2026-08-19. The probe result is kept because it cost real work and answers a question this system will ask again, not because anything standing needs it."
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - req-a-folder-is-driven-only-with-consent
  - "prior art, direnv: it keeps its allow record under the person's own data directory rather than in the tree"
  - "prior art, uv: project configuration in the tree, layered over user and system configuration outside it"
  - "the platforms this system already runs on: Windows here, and POSIX hosts for the unattended case"
---

## What is being assumed

FOUR PROPERTIES AT ONCE, and the entry is one assumption because losing any of
them costs the same thing.

- The place EXISTS on every platform we run on.
- It is WRITABLE without the person granting anything special.
- It SURVIVES between sessions, and across an update of the product.
- It is NOT REACHABLE by a checkout, so no tree can grant itself consent by
  carrying a file.

## Why it is an assumption and not a fact

TWO SYSTEMS WE COMPARED AGAINST DO THIS, so the shape is clearly possible. That
is evidence the pattern works, not evidence it works here.

WE RUN ON AT LEAST TWO PLATFORM FAMILIES AND HAVE CHECKED NEITHER for this. The
convention differs between them, and the unattended host is the case where a
per-person place is least likely to behave as expected, because the person may
not exist in the ordinary sense.

THE EPHEMERAL HOST IS THE SHARP CORNER. A machine that is created for one run
and destroyed has no place that survives between sessions, by construction. If
consent must be recorded there, either every run asks, or every run answers
itself, and the second is the failure wearing the first's clothes.

## Why it is graded corrosive rather than crippling

THE ITERATION DOES NOT FALL WITHOUT IT. Every other row stands, and the
collapse happens either way.

WHAT ROTS IS THE CONSENT GUARANTEE, quietly. A record that has nowhere to live
outside the tree ends up inside it, and a reader of the requirement would still
see the demand satisfied by a file with the right name in the wrong place.

## Probe

WRITE ONE BYTE AND READ IT BACK, on each platform, from outside any project.
Then delete the project it was written from and read again. The record must
survive.

THEN TRY TO REACH IT FROM A CHECKOUT and confirm the path jail refuses. A place
the tree can reach is not outside the tree in the sense this row means.

ASK THE EPHEMERAL CASE SEPARATELY, because it is the one where the honest
answer may be that there is no such place, and the design has to say what
happens then rather than pretending.

## Probe result, 2026-08-19 — HOLDS on Windows, UNPROBED elsewhere

THE PROBE THIS ENTRY ASKED FOR WAS RUN, in the words it asked for: write one
byte outside any project, read it back, then clean up.

- A per-person location exists and is set on this machine.
- A directory was created there, written, read back byte-identical, and
  removed.
- It sits outside every project tree, so no checkout reaches it by path.

THREE OF THE FOUR PROPERTIES HOLD HERE: it exists, it is writable without
ceremony, and it is not reachable from a tree. Survival across an update of the
product was not exercised, and that is the one this probe did not reach.

POSIX IS UNPROBED AND THE REASON IS PLAIN. This machine is Windows. The
variables a POSIX host would use are unset here, which is correct rather than a
finding, and says nothing at all about a POSIX host.

THE EPHEMERAL HOST IS STILL THE SHARP CORNER and no probe touched it. A machine
created for one run and destroyed has nothing that survives between sessions,
by construction, so the design still owes an answer for what consent means
there.

## Closed, 2026-08-19 — nothing needs the place any more

THIS ENTRY EXISTED TO SUPPORT A CONSENT RECORD KEPT OUTSIDE THE TREE. The owner
struck that record the same day: the folder answers for itself by carrying
machine state or not, so there is nothing to remember anywhere.

THE PROBE RESULT STAYS ON THE FILE and is worth keeping. A per-person place
does exist on this machine, is writable without ceremony, and cannot be reached
from a checkout. That is a useful fact about the platform even with nothing
currently needing it.

WHAT WOULD REOPEN IT. Any demand for state that belongs to the person rather
than to a project. None stands today.
