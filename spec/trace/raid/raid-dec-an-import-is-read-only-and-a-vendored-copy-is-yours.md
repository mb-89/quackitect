---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours
type: "[[raid]]"
kind: decision
statement: An IMPORT is read-only and nothing may reach it; a VENDORED copy is yours and you may change all of it. The direction of writes is the rule, never the mechanism.
owner: the owner
trigger: any new import or vendoring mechanism, before it is adopted
status: open
breaks_how_badly: fatal
how_likely: expected
impact: "A tool can destroy the thing it imports. Witnessed 2026-07-25 in v2: package.json declared the kb module as an npm file: dependency, npm implemented that as a symlink into the sibling benjamin checkout, and a routine `git worktree remove --force` followed the link and deleted benjamin's working tree and its .git. Losing another repository's history is unrecoverable, which is why this is graded fatal rather than crippling."
source_refs:
  - product/spec/ledger/se/law-imports-are-read-only.md at ref v2 — owner ruling 2026-07-25, read 2026-08-18
  - vp-vendoring
  - req-nothing-a-copy-does-reaches-its-source
---

## This is v2's law, brought forward rather than reinvented

IT WAS ALREADY DECIDED, once, precisely. `law-imports-are-read-only` at ref v2
is an owner ruling of 2026-07-25, minted in iteration i5d-close-merge-split and
adjudicated in chat. It is quoted here rather than paraphrased, because the
paraphrase is what went wrong.

> AN IMPORT IS READ-ONLY. Whatever mechanism implements it, anything declared
> as an import may only READ what it imports: resolve it by path, read its
> files, record its version. It may NEVER write into it, move it, delete it,
> build inside it, or create any filesystem structure through which another
> operation could reach it — no symlink, no junction, no hardlink, no mount, no
> install step that writes to the source. Only a VENDORED dependency may be
> modified, and only our own copy of it. The mechanism is not the rule; the
> DIRECTION OF WRITES is the rule, and any new import mechanism must be checked
> against it before adoption.

THE GENERALISATION WAS DELIBERATE and the node says so: "a rule naming one
forbidden mechanism only invites the next one."

## The two kinds, and why the distinction is the whole point

AN IMPORT is somebody else's thing, resolved where it lives. You read it and
you record its version. Nothing you do can reach it, and no structure you
create may let a later operation reach it either.

A VENDORED THING is YOUR OWN COPY. You may modify all of it, because modifying
it cannot touch anybody else's copy of anything.

A VEHICLE VENDORS. That is why a vehicle owning and changing everything it
carries is not in tension with this rule — it is the case the rule explicitly
permits.

## What v3 did to it, and why this node exists

`req-engine-folder-is-sealed` is v3's descendant of this law and it says
something different: that the engine resolves from inside its own folder and
writes zero files there.

TWO THINGS WENT WRONG IN THE TRANSLATION.

- THE FOLDER MOVED. The law protects the SOURCE — the thing upstream. The
  requirement protects the engine's own folder inside the copy, which is not
  the thing at risk.
- THE PERMISSION WAS LOST. The law's own sentence "only a VENDORED dependency
  may be modified, and only our own copy of it" is a grant. The requirement
  reads as a prohibition on a vehicle changing what it carries, which is the
  opposite of what was ruled.

THE OWNER RULED ON 2026-08-18 that req-engine-folder-is-sealed is removed. That
removal belongs at write-requirements, which is the state that may retire a
requirement, and it must sweep what points at it first.

## Rejected options

NAMING THE FORBIDDEN MECHANISMS AND STOPPING THERE — no symlinks, no
hardlinks. REJECTED by the original ruling and for its stated reason: a rule
naming one mechanism invites the next one. The npm `file:` protocol was not on
anybody's forbidden list when it deleted a repository.

FORBIDDING THE VEHICLE FROM CHANGING WHAT IT CARRIES. REJECTED, and this is
what v3 accidentally adopted. It answers the wrong risk: a vehicle editing its
own copy endangers nobody, and forbidding it makes the vehicle not
self-sufficient, which is goal 1 of this iteration's vision.

ALLOWING WRITES UPSTREAM WHERE THEY ARE "SAFE". REJECTED because safety here is
not judgeable in advance. The v2 incident was a routine `git worktree remove`,
which nobody would have flagged.

## Consequences

A VEHICLE MAY CHANGE EVERYTHING IT CARRIES. That is now a permission with a
citation rather than an open question.

NOTHING A VEHICLE DOES MAY REACH THE PARENT. Not through a write, and not
through any structure that lets a later operation follow a path outward.

SO THE SPAWNING MECHANISM IS CONSTRAINED, not only the running one. However a
vehicle comes into being, it must be a real independent copy. No link, no
mount, no install step that writes to the source.

AND THE WAY BACK IS ANALYSIS, NEVER PROPAGATION. The owner's words, 2026-08-18:
"if I have a process that analyzes the changes and pushes them back as notes as
design input to the vendor, that's okay." A change travels upward as something
somebody reads and decides on, never as a write that lands.
