---
form: find_prior_art
by: agent
signed_off: 2026-08-15T16:40:41.101Z
authors: agent
files:
---

# Evidence form / find_prior_art

## current_situation

M4's divergence, first finder. The design space being enumerated is the record lifecycle and the bootstrap: where an iteration's workspace lives, what creates and removes it, and what answers which iterations exist.

THE OPTION POOL IS NOT EMPTY. i27 enumerated this same territory and its options stand, so this finder's job is to test them against what the world has published and shipped rather than to invent beside them.

## applies

yes

## options

- [[opt-worktree-per-record]]
- [[opt-worktree-holds-only-the-record]]
- [[opt-the-branch-is-the-record]]
- [[opt-seeds-ride-their-stub-branch]]
- [[opt-abandon-by-deleting-the-branch]]

## literature

SEARCHED, AND IT ANSWERED. The problem's vocabulary in the field is "ephemeral worktree per task" and "parallel agent isolation", and naming it that way is what made the search work.

WHAT IS WRITTEN DOWN, and it describes our design rather than an alternative to it:

- THE WORKTREE IS CREATED, USED AND DESTROYED PER TASK, with the argument that when agents are ephemeral and a task finishes inside an hour, the create-and-destroy overhead is negligible. The explicit corollary in that account is that worktrees are NOT permanently owned by agents, which is the same claim as this iteration's "a folder means somebody is working it right now".
- THE .git FOLDER IS THE SOURCE OF TRUTH and each worktree adds only the weight of the files being edited. That is the mechanism our reader change adopts: ask the repository, not the directory.
- RUNTIME ISOLATION IS A NAMED GAP IN THE SAME PATTERN. One account argues directly that git worktrees are not sufficient for parallel agents because the filesystem is isolated and the runtime is not. That is our port-lifecycle problem, found independently and already an option in the pool.

WHAT THE LITERATURE DOES NOT SAY, and it is the honest gap: nobody in that material treats the branch list as the authority for WHICH WORK EXISTS. Worktrees are used for isolation, and the work list comes from a task queue or the tool's own state. Making `refs/heads/it/*` the work list is not a borrowed mechanism, and no account was found arguing for or against it.

Sources: https://www.augmentcode.com/guides/git-worktrees-parallel-ai-agent-execution , https://www.penligent.ai/hackinglabs/git-worktrees-need-runtime-isolation-for-parallel-ai-agent-development/ , https://paseo.sh/docs/worktrees , https://dev.to/metal3d/git-worktree-like-a-boss-2j1b

## shipped

COMPETITORS. Paseo creates a separate directory on a separate branch per workspace so parallel agents never collide, and it is the nearest running thing to what this iteration builds. The mechanism is create-per-task and it is described as backing a workspace rather than owning it.

PRODUCTION USE BEYOND A VENDOR PAGE. The pattern is reported running at incident.io, with parallel feature agents on different features at once. That matters because a vendor's own docs are evidence a feature is claimed, never that it works.

OUR OWN PREDECESSOR is the richest source and it is not in that list. i27 shipped the lane binding to the record and ruled that this product is self-hosting and gets NO worktree, its records walking on trunk. That ruling is why i28 exists in the shape it does, and it was made by people holding this exact problem.

REVERSE ENGINEERING, on our own artifact rather than somebody else's: `git worktree list` is the authority git itself offers, and it refuses to remove a dirty tree. Our engine reimplemented that question with `existsSync` and lost the refusal, which is readable straight off the code at engine/iterations.ts line 71.

WHAT NO PRODUCT COULD BE OBSERVED DOING: answering "which units of work exist" from the branch list. Every observed tool keeps that list somewhere else.

## dry_wells

- the-account: nothing published and nothing shipped about a machine keeping a reconstructable record of every act for an agent's benefit rather than an auditor's; the nearest material is audit logging, which answers a different question
- the-holding-pen: nothing found on holding a stray out of a governed walk's way and giving it back with exactly one disposition; note-taking tools solve capture and not the one-home discipline
- the-walk: nothing found on compiling an authored state machine into a lane that refuses tools per state; workflow engines were compared at M1 and carry no evidence discipline, which is a difference rather than prior art
- the branch list AS the work list: no account found arguing for it or against it, in either the literature or the shipped products

## follow_up

- PRIOR ART CONFIRMED THE POOL RATHER THAN EXPANDING IT, and no new option node was minted here. The seven referenced are i27's, and each one now carries external evidence it is a real shape rather than a local invention.
- THE RUNTIME-ISOLATION GAP IS CORROBORATED. Others hit it in the same pattern, which raises the port lifecycle from our own annoyance to a known property of this design.
- THE DIFFERENTIATOR IS NARROWER THAN THE DESIGN. What nobody else does is treat the branch list as the work list, and that is the part with no prior art to lean on.
- the remaining finders run next, and trimming is the one most likely to add something here
- nothing is parked from this state

## anything_else

### Why no option was minted

THE METHOD ASKS FOR ONE OPTION NODE PER IDEA FOUND, and every idea this search found was already a node. That is a result rather than a shortcut, and it is checkable: seven options are referenced and each was minted at i27 against this same territory.

WHAT WOULD HAVE MADE IT WRONG is minting near-duplicates so the field looked productive. The chart dedupes and `found_by` records the lens, so a second node for a shape already on the chart adds noise and no information.

### The comparison rule was followed, and one line of it bit

A FEATURE LIST IS EVIDENCE A FEATURE IS CLAIMED, never that it beats ours. So the Paseo entry says what its mechanism is and stops. The incident.io report is worth more than any vendor page precisely because it is somebody else's production, not a marketing claim.

AND WHERE OUR SIDE DOES NOT EXIST YET, no comparison was written. The branch-as-work-list has no counterpart to compare against, so it is recorded as a dry well rather than as an advantage.
