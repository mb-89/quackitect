---
id: quackitect
self_hosting: true
---

# What this product declares about itself

This file is the product's own declaration. It travels with the repository,
so any machine that clones this repo reads the same answer.

## self_hosting

Quackitect is SELF-HOSTING. It works on itself.

So its records get NO worktree, and they walk on trunk. A change to the
method lands where the walk is standing, and it applies to the walk that made
it.

WHY THE EXCEPTION IS SAFE AND HAS EXACTLY ONE MEMBER. A product never works
on Quackitect. Only Quackitect works on itself, and a vehicle working on
itself is the one case where the machine under the walk and the machine being
changed are the same machine.

WHY IT IS DECLARED HERE RATHER THAN CONFIGURED. A property a product asserts
about itself belongs to the product, in a file the product commits. Session
state is host-local and does not travel; this does.

REINTRODUCING WORKTREES IS FLIPPING THIS BACK. Set `self_hosting: false` and
records take a worktree again. Nothing else has to change, because the
declaration acts in exactly one place.

## What this is not

It is not the autonomy dial. That is per-session, set at launch, and
deliberately never committed.

It is not a rigor setting. A change's size is judged per record, at its
kickoff.
