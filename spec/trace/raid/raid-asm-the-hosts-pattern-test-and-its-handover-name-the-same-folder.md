---
minted_in: i9
id: raid-asm-the-hosts-pattern-test-and-its-handover-name-the-same-folder
type: "[[raid]]"
kind: assumption
statement: The host feature that decides whether to start the product and the host feature that says which folder it opened are assumed to name the same folder, on every host and in every workspace shape.
owner: the driving agent
trigger: before any candidate taking both host features is built, and again the first time a workspace holding several folders is opened
status: open
impact: If they disagree, the lane comes up rooted in a folder nobody chose, and nothing says so. The candidate that takes both calls this its worst failure mode and leaves it unprobed.
breaks_how_badly: crippling
how_likely: plausible
probe: "FALSE, AND FOR A REASON THE ENTRY DID NOT ANTICIPATE. There is no handover to disagree with. The editor never names a folder to the extension: it computes which folder matched, then discards that identity before the extension host is told, and hands over the whole workspace instead. Read from the editor's own source and its published API surface, not from a blog."
probed: 2026-08-19
source_refs:
  - cand-the-folder-answers-for-itself, which takes both features and names the seam
  - the composition of that candidate at run-candidates, 2026-08-19
---

## Probe

OPEN A WORKSPACE HOLDING SEVERAL FOLDERS, where only one carries machine state.
Assert that the folder the activation pattern matched is the folder the handover
offers, and that a mismatch refuses rather than binding.

IT COSTS ONE EDITOR SESSION and it is the only way to settle it. Reading the
host's documentation gives what each feature does alone and says nothing about
whether they agree.

## Why it is an assumption rather than a risk

BOTH HALVES ARE THE HOST'S, and neither is ours to fix. If they disagree we do
not get to change it; we get to detect it or not.

THE CANDIDATE THAT TAKES BOTH SAYS SO IN ITS OWN TEXT. "The pattern test decides
WHETHER we start; the handover decides WHAT we hold. They are separate host
features and nothing forces them to agree."

## What makes it worse than it looks

THE FAILURE IS SILENT. A lane rooted in the wrong folder answers every call
successfully, against the wrong tree. Nothing refuses, nothing warns, and the
first sign is work landing somewhere unexpected.

ONE CANDIDATE ALREADY CLOSES IT, and that is a real difference between lines
rather than an argument for one. Stating the tree and acknowledging it back
turns the disagreement into a refusal.

## What the spike found, 2026-08-19

THE ASSUMPTION IS FALSE, AND THE SHAPE OF THE FALSITY IS NOT THE ONE THIS ENTRY
PREDICTED. It assumed two host features each name a folder, and that they might
name different ones. Only one of them names a folder, and it names it to itself.

WHAT THE EDITOR ACTUALLY DOES. Its activation check walks the open folders,
finds the first that contains the named file, and activates. The matching
folder is in scope on that line and is not passed on. The activation result
carries one field, the event string.

FOR A PATTERN WITH A WILDCARD IT IS WORSE. The folder is never computed at all.
One search runs across every folder and returns a boolean.

WHAT THE EXTENSION RECEIVES. The whole workspace, as a list of folders. Its
context object carries no activation event and no folder. Every published type
and every proposed one was checked: the activation event appears nowhere in the
API surface.

THE CONCRETE FAILURE THIS PREDICTS. In a workspace of several folders where the
second carries the marker, an extension that reaches for the first folder roots
itself in the wrong one and nothing complains.

## What survives, and it is most of it

THE STATING HALF IS IMPOSSIBLE ON THIS HOST. A launcher, a hook or a command
line still knows its root and can state it. The editor cannot.

THE ACKNOWLEDGING HALF SURVIVES, REBUILT AS A SELF-CHECK. The extension runs
the same content test the host ran, once per open folder, and counts carriers.

- Nought carriers. Refuse. Activation claimed one exists, so something moved.
- One carrier. Bind to it, and echo it where a person reads it. It is
  necessarily the folder that fired the event, because nothing else could have.
- Two or more. Refuse. Ownership is ambiguous, so ask the person.

IT DOES NOT LEARN THE TRIGGER. It makes the trigger irrelevant: the only case
where the trigger's identity matters is the ambiguous one, and that case
refuses. The loudness the design was bought for holds.

## Two silent failures found on the way

A SEVEN-SECOND TIMEOUT KILLS WILDCARD ACTIVATION, and the only trace is a log
line. A pattern with no wildcard avoids the search path entirely, which makes it
the safer form. It reverts to searching anyway under a remote authority or on
the web build.

ADDING THE FIRST FOLDER RESTARTS EVERY EXTENSION rather than firing the
folders-changed event.

## What the spike could not settle

WHICH FOLDER FIRED THE EVENT WHEN TWO CARRY THE MARKER. Not observable from
inside an extension, and the information does not survive the early return.

WHETHER A RUNNING EDITOR BEHAVES AS THE SOURCE READS. This was read at the
default branch rather than a shipped tag, and no editor was opened. One session
is still worth spending, now aimed at the timeout and the remote path.
