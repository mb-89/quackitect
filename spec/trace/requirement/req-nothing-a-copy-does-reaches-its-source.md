---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: req-nothing-a-copy-does-reaches-its-source
type: "[[requirement]]"
statement: When the system performs any operation that changes a file system, it shall resolve that operation inside a tree it was pointed at, and never inside a tree it was copied from.
kind: constraint
verify_method: test
breaks_if_removed: A copy can destroy the thing it came from, which has already happened in this house - a dependency link and a routine cleanup command deleted a repository's working tree and its history on 2026-07-25.
breaks_how_badly: fatal
refines:
  - uc-vendor-and-overlay
source_refs:
  - uc-vendor-and-overlay ext 1a
  - uc-vendor-and-overlay ext ANY STEP
  - raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours
  - sty-nothing-i-do-reaches-what-it-came-from
  - stk-vehicle-owner
priority: must
weighs_against:
  - req-desk-states-the-folder-rule > — a copy reaching back into its source damages a tree nobody was working in; an unstated folder rule costs one person one confusion
---

## Detail

THE RULE NAMES THE DIRECTION OF WRITES, NEVER A MECHANISM. That generalisation
is deliberate and it is the law's own wording: a rule naming one forbidden
mechanism only invites the next one. On 2026-07-25 the mechanism was a symlink;
it could as easily have been a junction, a mount or an install script.

AND IT CAME TRUE WITHIN ONE SESSION. Probed on 2026-08-18, on Windows: the
junction is the structure that fires, and it is the one an ordinary user can
create. The symlink - the mechanism of the original incident - is refused
without elevation on that platform. The full reproduction is on
[[raid-asm-the-isolation-rule-means-the-same-on-every-platform]], which is now
an ISSUE rather than an assumption because the probe did not survive.

SO A COPY IS A COPY BY VALUE, ALWAYS. Nothing in a produced tree may point
outward by any mechanism, and the parent is never a dependency: a copy that
cannot reach where it came from still runs completely. That is goal 1 and it
ranks above everything else here.

Four facets bind, and they fail independently while sharing one concern and one
verification method.

| facet | what binds |
| --- | --- |
| the spawn | When the system produces a copy of itself, that copy shall contain no symlink, junction, hardlink, mount point or install step whose target resolves outside the copy's own tree. |
| the platform split | The check for that shall be written PER PLATFORM rather than once. Probed 2026-08-18: on Windows a junction carried `git worktree remove --force` out of the tree and destroyed a neighbour's file at exit code 0, while an unprivileged user could not create a directory symlink at all. A symlink-shaped check passes that tree. |
| the run | While the system runs from a copy, every write, move, delete and link it performs shall resolve inside that copy's own tree. |
| the driven tree | Where the system has been pointed at another product, writes on that work's behalf shall resolve inside that product's tree, and nowhere else. |
| the count | The number of operations resolving outside both trees shall be zero, measured over a run rather than asserted. |

## Why the driven tree is not an exception

A PRODUCT THE SYSTEM WAS POINTED AT IS THE SUBJECT OF THE WORK, not a
bystander. Somebody named it on purpose, which is exactly what a tree the
system was COPIED FROM never had.

SO THE RULE IS ABOUT CONSENT AS MUCH AS DIRECTION. Two trees are legal targets:
the one the system runs from, and the one it was pointed at. Everything else is
outside.

## What this does not forbid

CHANGING ANYTHING INSIDE THE COPY. A copy's owner may edit, delete or rebuild
every file it carries, including the ones the source wrote. Nothing here is a
seal, and the requirement this one replaces was read as one.

SENDING SOMETHING BACK ON PURPOSE. Information may travel to the source through
a door the source opened, as a proposal somebody reads and decides on. What is
forbidden is an OPERATION reaching it. The owner's own line, 2026-08-18: "if I
have a process that analyzes the changes and pushes them back as notes as
design input to the vendor, that's okay."
