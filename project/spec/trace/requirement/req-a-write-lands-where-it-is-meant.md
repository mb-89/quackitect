---
minted_in: i27
id: req-a-write-lands-where-it-is-meant
type: "[[requirement]]"
statement: When the lane writes a file, the engine shall land it in the tree the caller meant, and shall name the tree it resolved to whenever the path admits more than one.
kind: functional
verify_method: test
breaks_if_removed: A write reports success and lands somewhere else. The work is found at a merge, or never - which is how one feature was built twice, differently, on two branches.
breaks_how_badly: fatal
refines:
  - uc-take-a-step
source_refs:
  - uc-change-the-method-mid-walk
  - uc-open-an-iteration
  - raid-risk-a-write-lands-in-the-wrong-tree-silently
  - raid-dec-two-layer-auth
  - "owner ruling 2026-08-13: a write ends up in the place where we want it, and the resolving just works"
  - "cloud field report 2026-08-12: se_help implemented twice on two branches"
priority: must
---

## Detail

WHERE THE CALLER MEANT, not where the walk happens to stand. Those are
usually the same and sometimes deliberately are not: reaching into
another record, reading a committed ref, touching the machine's own
session state. THE OWNER HAS RULED THAT REACHING ACROSS IS NORMAL WORK
rather than a leak, so a rule pinning every write to the bound tree
would forbid work we want.

WHAT MUST NEVER HAPPEN is the path resolving somewhere the caller did
not mean, silently.

## The second clause is the whole safety

NAME THE TREE WHENEVER THE PATH ADMITS MORE THAN ONE. That is what turns
an ambiguous path from a trap into a fact.

Observed 2026-08-13, and it needed no wrong write at all: two paths
outside the project folder resolved two different ways within five
minutes. One landed at the repository root; the other was rewritten into
the bound tree and reported a file missing that was sitting there.

Neither rule was written down anywhere, so neither could have been
predicted.

## FOR EVERY WRITE VERB AND FOR THE SHELL ALIKE

The guard standing today watches five write tools and not the shell, and
the shell is what got used: refused at the write, a walk reached for it
with a stated reason and the write landed on trunk anyway.

A rule that enumerates the doors it watches is unguarded by default at
every new door.

## Its narrower resident sibling

req-guidance-edit-lands-where-it-compiles says this for ONE class - a
walk-governing source lands in the tree the walk compiles it from. It is
a must and it stands.

THEY DO NOT CONFLICT. The narrow row names the COMPILES-FROM tree, which
is not always the tree the caller means. Where method fans out those
differ, and that difference is the fan-out's whole subject.

## Mixing and addressing are different things

req-trees-never-mix says the engine lands zero writes inside a vehicle's
overlay tree and zero overlay content inside its own. That stands, and
it does NOT forbid what this row permits.

MIXING is content of one tree bleeding into another where nobody meant
it to - the two ending up interleaved, and neither being what it says it
is.

ADDRESSING is a caller naming another tree on purpose and writing there.
Sending a task to another record, seeding work, correcting a sibling's
plan. THE OWNER RULED IT NORMAL WORK on 2026-08-13, and it is done
several times a day.

SO THE TWO ROWS DIVIDE CLEANLY. Never mix, and always be able to address
deliberately. What sits between them - a write that crosses without
anybody meaning it to - is what both rows exist to stop.

## What this does NOT say

It does not say trunk is unreachable. Making trunk unaddressable is one
mechanism that satisfies this row; judging each path against the record
is another; naming the tree in the answer is a third. THE ARCHITECTURE
MILESTONE CHOOSES. The requirement is the outcome.

## Behaviour

No model wanted. One predicate over one call.
