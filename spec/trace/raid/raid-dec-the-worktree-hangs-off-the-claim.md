---
unreachable_refs:
  - raid-dec-a-claim-ends-only-when-a-person-releases-it
  - cand-the-lifecycle-is-the-claim
minted_in: i28-the-cloud-runs-from-its-seed-alone-a-fre
id: raid-dec-the-worktree-hangs-off-the-claim
type: "[[raid]]"
kind: decision
statement: A worktree exists exactly while a live claim exists, so nothing creates one and nothing removes one as a separate act.
owner: the owner
trigger: superseded only, or the first time a person wants a folder to outlive its claim on purpose
status: superseded
superseded_by: raid-dec-one-tree-beats-a-record-travelling-between-machines
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - raid-dec-a-claim-ends-only-when-a-person-releases-it
  - cand-the-lifecycle-is-the-claim
  - opt-the-folder-cannot-exist-without-a-live-claim
  - raid-a-crashed-walk-leaves-a-folder-that-means-nothing
---

## What was decided

THE CLAIM IS THE ONLY MECHANISM. A folder appears because a claim was taken and disappears because the claim ended. There is no create step and no remove step to get wrong.

WHAT IT REPLACES: a folder created at entry and removed at close, with a sweep behind it for the closes that never ran.

## Why

THE TREE'S EXISTENCE WAS NEVER AN INDEPENDENT FACT. It was always meant to mean "a walk is bound here". Storing that meaning in two places let the two disagree, and a stale folder is exactly that disagreement made visible.

THE THREE THINGS IT DELETES, rather than fixes.

- The stale-folder class stops existing.
- The sweep stops existing.
- The second definition of open stops existing.

## The seam that bears the load

CLAIM TO FILESYSTEM. A claim is a small text file today, and here it owns a directory. That is the one joint worth watching, and it is where a failure would show first.

## What is NOT decided here

WHETHER A WORKTREE IS NEEDED AT ALL. [[cand-no-folders-at-all]] tied the winner at deficit zero, and its argument stands untouched by this decision: the claim's expiry and the folder's lifetime are separate questions.

SO THIS DECISION SAYS WHAT GOVERNS A FOLDER'S LIFETIME. It does not say a folder must exist. If a later iteration removes worktrees entirely, this decision is not contradicted; it becomes vacuous.

## Rejected options

- ENTRY CREATES, CLOSE REMOVES, A SWEEP CATCHES THE REST, which is what stood before.
  - The sweep is not one-time in practice.
  - A crashed walk defeats every one of the three steps.
- A FOLDER THAT OUTLIVES ITS CLAIM ON PURPOSE, so work can be inspected after a walk ends.
  - Rejected because it restores the two-meanings problem this decision removes.
  - A later iteration may reopen it with a named reason.
- PRE-ASSIGNING FOLDERS AT SEED TIME. Rejected because it creates a tree for iterations nobody has entered, which is the same stale-folder class under a different name.

ONE OPTION IS NOT REJECTED AND IS NOT ADOPTED. [[opt-no-worktrees-at-all-every-record-walks-on-trunk]] tied the winner at deficit zero and answers a different question. It stays open rather than being written down as a loser.

## Consequences

- NO CODE CREATES OR REMOVES A WORKTREE as its own act from now on. Those calls exist only inside taking and ending a claim.
- THE STALE-FOLDER CLASS STOPS EXISTING, so nothing needs to detect one.
- THE SWEEP STOPS EXISTING, and any state whose job was to run it loses that job.
- A CLAIM NOW OWNS A DIRECTORY. It was a small text file, and that seam is where a failure would show first.
- RELEASING A CLAIM DESTROYS UNCOMMITTED WORK unless something commits first. That guard becomes mandatory rather than advisory.
- NOTHING RELEASES A CLAIM BUT A PERSON, so that destruction is always somebody's deliberate act ([[raid-dec-a-claim-ends-only-when-a-person-releases-it]]). No timer can take a tree away from a walk that merely paused.

## Superseded at i34, 2026-08-16

BOTH SIDES OF THIS DECISION ARE GONE. There are no worktrees and there are no
claims, so "a worktree exists exactly while a live claim exists" binds nothing.

IT IS SUPERSEDED RATHER THAN DELETED, because a decision can only ever be
superseded — somebody chose this and relied on it, and the archive keeps that.
What replaces it is
[[raid-dec-one-tree-beats-a-record-travelling-between-machines]].

WHAT IT GOT RIGHT AND IS WORTH CARRYING. It refused to let a folder be created
or removed as a separate act, because a folder whose lifetime nobody owns means
nothing. i34 answers the same worry differently: the folder is the record, it
is created once at the seed, and nothing ever removes it.
