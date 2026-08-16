---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-no-iterations-are-visible-without-a-reachable-remote
type: "[[raid]]"
kind: risk
statement: Once the container reads which iterations exist from git rather than from disk, an implementation that queries the REMOTE rather than local refs makes an offline machine see nothing to work on, where today the folders answer offline.
owner: the driving agent
trigger: the first session on a machine with no network, and any change to how the container resolves the iteration list
status: open
impact: A person on a train or behind a failed network opens the container and is told there is no work. Today the folders on disk answer that question with no remote involved, so this is a capability the change can remove rather than a gap it leaves.
breaks_how_badly: corrosive
how_likely: plausible
source_refs:
  - i28-the-cloud-runs-from-its-seed-alone-a-fre
  - raid-asm-git-answers-open-without-a-worktree
---

## Where it came from

THE HOSTILE FAQ AT M1 PRESSURE-TEST, 2026-08-15. The question was plain: what
happens when git is not reachable. The design as written did not answer it.

## Why it is not obviously fatal

LOCAL BRANCHES ARE STILL GIT. `refs/heads/it/*` lives in the local clone, so
reading the list needs no network at all. Everything already fetched answers
offline exactly as the folders do today.

WHAT DOES NEED THE NETWORK is learning about a seed another machine pushed
since the last fetch, and pushing a claim when entering one.

## So the real shape of it

CORRECTED 2026-08-15, by the owner, against an earlier ruling this entry had
contradicted. The first version of this entry said entering offline was
impossible. That is wrong and it was already settled before this iteration
opened.

THE OWNER'S RULING, restated: work starts offline. "You can start work on an
iteration even if you're offline. You can then not claim it. That's clear
because you're not online, but this will fail gracefully and warn and you will
still be able to do it. This means that you risk desync, but that's fine."

SO OFFLINE IS A SUPPORTED MODE RATHER THAN A DEGRADED ONE.

- READING THE LIST is local, provided the implementation reads local refs.
- ENTERING succeeds. The claim is attempted, fails, WARNS, and the walk
  continues unclaimed.
- THE DESYNC RISK IS ACCEPTED. Two machines may enter the same iteration while
  one of them is offline, and that is a cost the owner has taken knowingly.

## The mitigation

READ FROM LOCAL REFS, NEVER FROM THE REMOTE, when answering what exists. A
fetch refreshes the local refs; it is not part of the question.

WARN, NEVER REFUSE, when a claim cannot be pushed. The warning says the
iteration is unclaimed and that another machine may take it. It does not stop
the walk, and it does not pretend the claim landed.

AND SAY HOW OLD THE ANSWER IS. Where the last fetch is old, the container says
when it last heard from the remote rather than presenting a possibly stale list
as complete.

## What would falsify the mitigation

An implementation that shells out to the remote to list branches. That is the
version of this design that breaks offline work, and it is easy to write by
accident.
