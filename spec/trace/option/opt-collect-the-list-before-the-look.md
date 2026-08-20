---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: opt-collect-the-list-before-the-look
type: "[[option]]"
statement: What the next surface will need is collected while the person is still reading the current one, so the expensive read never happens at the moment somebody is waiting for it.
cluster: the-record-life
found_by: contradiction
source: "TRIZ separation IN TIME, on: reading the iteration list from git makes the answer correct and makes the container slower"
---

## Mechanism

THE ENGINE ALREADY KNOWS WHAT IS REACHABLE. Every pull computes the route and
the offered doors, so the set of things somebody might look at next is in hand
before they look.

- PEEK: the current surface fetches only what it must show. For the container
  that is an id and a goal line per iteration.
- COLLECT: while that surface is being read, what the reachable next states
  need is gathered in the background.
- ARRIVE WARM: choosing a door finds its data already there.

## The contradiction it breaks

MOVING THE OPEN TEST FROM THE DISK TO GIT makes the answer correct and makes
drawing the container slower. Measured over 33 branches: 12.6 ms from the
disk, 58.7 ms batched from git, 1004 ms unbatched.

THE SEPARATION IS IN TIME. Both demands were assumed to apply at one moment —
the moment the container draws. They never did. The read has to be finished by
then; it does not have to start then.

## What it sheds

THE WHOLE QUESTION OF WHETHER THE READ IS FAST ENOUGH. An operation that
completes before anybody asks has no latency budget to fit inside, so the
one-second rule stops applying to it rather than being satisfied by it.

IT ALSO SHEDS THE PRESSURE ON BATCHING. Batching remains the right
implementation and stops being load-bearing, because a slower correct read
would still arrive warm.

## What it costs

WORK DONE THAT NOBODY USED. Collecting for doors nobody takes is wasted, and
on a small corpus the waste may exceed the saving.

IT NEEDS AN INVALIDATION. Something must notice when a collected answer has
gone stale, which is a cache with all a cache's problems — and
raid-asm-git-answers-open-without-a-worktree's whole point was that the disk
was a cache pretending to be the truth.

AND IT IS NOT NEEDED FOR CORRECTNESS. The batched read already sits inside the
budget at today's count, so this is an option for when the count grows or for
surfaces batching cannot rescue.

## Where it came from

THE OWNER, 2026-08-15, before the TRIZ pass reached it independently: "if I
enter a state, while I'm at the state, we can already collect all the
sub-states that I can enter. Like in video games, where stuff is preloaded and
streamed, so it seems like you never have to wait."

It is also note-c8e5a398b943, which parks the general version for the
performance work.
