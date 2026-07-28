---
form: expedition-leave
status: done
by: agent
files:
---

# e14-fix-the-pre-iteration-bundle-one-record-1-sm — expedition-leave

## What was the goal

One record for the pre-iteration bundle: the small fixes (se_test, the
archive report link, the e12 gray-text size, the open-map truncation,
the defer to-do lists), the arbitrary-depth walk nesting the owner
ordered, and the archive decades as real sub-machines proving it.

## What was done

THE NESTING LIFT: the session's single sub-machine slot became a STACK.
Machines nest to any depth — entering a sub-machine state at any level
pushes, completing a sub pops back to its parent machine, and the walk,
breadcrumb, views, escape, and jump-back all speak the full path
(expedition_archive/e1-e10/e5). The generated-machine shape grew subGen:
a generated state can carry its own generated sub-machine.

ARCHIVE DECADES ARE SUB-MACHINES: both archives share one builder. Ten
or fewer records stand flat; more become decade states (e1-e10) the
owner clicks INTO — the ten records stand inside as their own states.
The iteration archive is now generated with the same shape (it was a
drawn stub). Archives no longer try to bind worktrees — browsing is
read-only by construction.

THE SMALL FIXES: se_test runs preflight plus the full suite in one call
with structured verdicts, in the bound worktree. The SE-C-121 open map
says "…and N more" past eight. The "no decisions recorded" placeholder
renders meta-sized like its gray siblings. Every state's details now
carry per-visit to-do folds: each point names its origin (planned here,
deferred from X, fork), and parked defers show before they arrive —
without materializing.

## What settled it

The suite in this worktree: preflight green, 94/94 selftests — five new
tests cover the decade builder shape, the and-N-more map, the to-do
origins with read-only parked views, the full nested walk (main →
archive → decade → record and back out), and se_test itself.

## What was not done

The clickable archive report was already shipped in 765e412 — verified,
no change. The archive_record detail table stays expedition-only; the
iteration archive shows goal statements until the iteration-lane build
wires its records. Render-consistency LINTS (the owner's note) are
deliberately left for the iterations work. The mirror's crumb menu shows
nested machines; deep-linking beyond one generated level relies on
viewFor and was tested engine-side, not clicked through a live browser.

## Files


