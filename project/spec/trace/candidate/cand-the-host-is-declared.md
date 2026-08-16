---
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: cand-the-host-is-declared
type: "[[candidate]]"
name: "The host is declared"
statement: "a declared image arrives able to run, the list is collected before the look, and the folder carries only the record"
picks:
  - "[[opt-the-environment-stands-the-product-up]]"
  - "[[opt-collect-the-list-before-the-look]]"
  - "[[opt-worktree-holds-only-the-record]]"
  - "[[opt-the-branch-is-the-record]]"
---

## Why this one

IT MOVES THE BOUNDARY RATHER THAN THE MECHANISM. Every other line improves how
the product stands itself up. This one asks whether standing itself up is our
job at all, and hands four of the entrypoint's seven steps to somebody else's
control plane.

IT IS THE ONLY LINE THAT SHRINKS THE ENTRYPOINT instead of improving it.

## How it works

THE ENVIRONMENT IS DECLARED, NOT SCRIPTED. A container definition names the
runtime version and the product, and whatever creates the host builds from it.

- No verify step: the runtime is in the image.
- No install step: the product is in the image.
- The entrypoint shrinks to fetch the iteration and start walking.
- The iteration list is collected while the previous surface is still being
  read, so the git read never happens at the moment somebody waits.
- Entering materialises the record's own folder rather than the whole product.

THE SEAMS.

- IMAGE TO PRODUCT: the load-bearing one, and it is a drift seam. The image
  and the product are two artifacts that must agree about the runtime, and
  nothing keeps them agreeing.
- PREFETCH TO TRUTH: a collected list is a cache, and this whole iteration
  exists because the disk was a cache pretending to be the truth. The
  invalidation is the seam and it is not designed here.
- IMAGE TO LAPTOP: none. The script stays for uc-install-quackitect, so this
  candidate is two paths rather than one.

## What it costs

IT MOVES THE PROBLEM RATHER THAN REMOVING IT. Building and publishing the
image is work somebody does, and keeping it current with the product is a
second thing that can drift.

IT CHANGES THE PRECONDITION RATHER THAN MEETING IT. This iteration targets a
host with a shell and nothing else. An image needs a container runtime, so a
genuinely bare host cannot use this path at all.

TWO PATHS INSTEAD OF ONE. The script survives for the laptop, so the thing
this iteration was trying to make single stays double.

THE PREFETCH ADDS A CACHE to a design whose central complaint was a cache.
That is not fatal and it is the objection to answer first.

## What it leans on

- a container runtime is present on the target host, which is exactly the
  assumption [[nbr-cloud-host]] says may not hold
- the image and the product stay in agreement about the runtime, which nothing
  currently checks
- a collected list can be invalidated correctly, which is undesigned
- git answers the open question cheaply without a worktree
  ([[raid-asm-git-answers-open-without-a-worktree]], probed 2026-08-15)
