---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-asm-the-isolation-rule-means-the-same-on-every-platform
type: "[[raid]]"
kind: issue
statement: A check shaped like the 2026-07-25 incident looks for symlinks, and on Windows the structure that actually destroys a neighbour is a junction - which an unprivileged user can create and a symlink-shaped check does not see.
owner: the owner
trigger: already true - reproduced on this machine on 2026-08-18
status: open
probed: 2026-08-18
breaks_how_badly: fatal
how_likely: expected
impact: A copy carrying a junction destroys data outside its own tree when an ordinary git command runs, with exit code 0 and no warning. The check that would have been written from the original incident report looks for the wrong structure on the platform this product actually runs on.
source_refs:
  - req-nothing-a-copy-does-reaches-its-source
  - raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours
  - sty-nothing-i-do-reaches-what-it-came-from
place: i40-every-write-path-is-guarded-the-pool-s-b
---

## What it said before, and why the kind changed

IT WAS RECORDED AS AN ASSUMPTION: that a check catching escapes on one platform
catches them on the other. It was probed on 2026-08-18 and it did not survive.

AN ASSUMPTION THAT FAILS BECOMES AN ISSUE, because it has already happened.
The id is kept and the kind is changed, per [[meth-assumption-probing]].

## Probe

RUN, on this machine, on 2026-08-18. Three throwaway repositories, one
structure each, and one control.

Each probe made a git repository with a worktree, put a neighbouring directory
beside it holding one file, placed one link structure inside the worktree
pointing at that neighbour, and then ran the exact command from the original
incident: `git worktree remove --force`.

| structure inside the worktree | exit code | the neighbour's file survived |
| --- | --- | --- |
| junction | 0 | NO |
| hardlink | 0 | yes |
| none - control | 0 | yes |

AND A SEPARATE RUN ESTABLISHED WHAT AN UNPRIVILEGED PROCESS CAN CREATE on this
machine, which is the half that makes the finding sharp.

| structure | created without elevation |
| --- | --- |
| junction | YES |
| directory symlink | NO - "your permissions are insufficient" |
| hardlink to a file | YES |

## What this establishes

THE DAMAGE IS LIVE ON THE PLATFORM WE RUN ON. `git worktree remove --force`
recursed through a junction and deleted the target's contents. Exit code zero,
no warning, nothing in stderr.

THE VECTOR IS THE ONE THAT IS EASY TO MAKE. A junction needs no elevation. A
directory symlink - the structure the original incident used, and the one a
report of that incident teaches you to look for - is REFUSED to an ordinary
user on this machine by default.

SO A SYMLINK-SHAPED CHECK WOULD HAVE PASSED THIS TREE and the data would still
have been destroyed. That is the whole issue, and it is why the entry is graded
fatal rather than crippling.

AND THE HARDLINK IS NOT THE VECTOR HERE, which is worth recording because it
was the more intuitive suspect. Deleting one name of a hardlinked file leaves
the other name; the file survived in every run.

## What now rests on something known false - the fallout

- `req-nothing-a-copy-does-reaches-its-source` names its forbidden structures
  as a list. The list is right and the ORDER of danger is wrong: it reads as
  symlink-first, and on Windows the junction is the one that fires. The row's
  detail table needs the platform split, and its verification cannot be one
  check run on one platform.
- `sty-nothing-i-do-reaches-what-it-came-from` names the force-removal command
  in its fifth slide, which is now demonstrably the right command to run. What
  the story does NOT say is which structure to plant, and a demonstration that
  plants a symlink on Windows would pass while proving nothing.
- `raid-dec-an-import-is-read-only-and-a-vendored-copy-is-yours` is
  STRENGTHENED rather than damaged. Its own wording already refused to name a
  mechanism, on the grounds that "a rule naming one forbidden mechanism only
  invites the next one". This is that sentence coming true within one session.

## What is still not established

POSIX WAS NOT RUN. Everything above is Windows. The original incident is the
only evidence for the POSIX side and it is a report rather than a run here.

THE REMAINING HALF NEEDS A MACHINE THIS ONE IS NOT, which is
[[raid-debt-cloud-validation-needs-a-machine-this-one-cannot-make]]. It is
scheduled rather than unprobed: the probe is written above and needs only a
host to run on.

AND ONLY ONE COMMAND WAS TESTED. `git worktree remove --force` destroys through
a junction; `Remove-Item -Recurse -Force` in a separate run did NOT. Which
other commands traverse is unenumerated, and that is the argument for the rule
naming the direction of writes rather than a list of commands.
