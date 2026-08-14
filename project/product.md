---
id: quackitect
self_hosting: true
---

# What this product declares about itself

This file is the product's own declaration. It travels with the repository,
so any machine that clones this repo reads the same answer.

## self_hosting

Quackitect is SELF-HOSTING. It works on itself.

The intent is that its records get NO worktree and walk on trunk. A change to
the method then lands where the walk is standing, and applies to the walk that
made it.

WHY THE EXCEPTION IS SAFE AND HAS EXACTLY ONE MEMBER. A product never works on
Quackitect. Only Quackitect works on itself, and a vehicle working on itself
is the one case where the machine under the walk and the machine being changed
are the same machine.

## THE ENGINE DOES NOT ACT ON THIS YET

Stated plainly, because a setting nothing reads is a trap.

`self_hosting` is a DECLARATION of a decided property. No code branches on it
today.

WHAT HAS TO LAND FIRST. A record can only walk on trunk once its content IS on
trunk. On 2026-08-14 i27's own content stood on its branch: nine evidence
files, four design specs, and the record's machines. Switching the resolution
first pointed the walk at a trunk that did not hold them, and four design
specs went invisible in one call.

MOVING IT IS CALLED LEVELLING, and the engine already has the decision logic:
`levelRecordTree` in `engine/supervisor.ts`. What it lacks is a real git
adapter behind its `GitLane` interface, and that belongs to the process chunks
that own a repository.

SO THE ORDER IS: build the adapter, level the record onto trunk, then let this
declaration steer `workRoot()`.

## What retired SE-C-134 instead

Not this file.

`session.laneRoot` sends every METHOD path to the machine root, whatever tree
is bound. A method write can no longer land in a tree that does not own it, so
the refusal had nothing left to prevent.

That change is independent of self-hosting and it is already live.

## What this is not

It is not the autonomy dial. That is per-session, set at launch, and
deliberately never committed.

It is not a rigor setting. A change's size is judged per record, at its
kickoff.
