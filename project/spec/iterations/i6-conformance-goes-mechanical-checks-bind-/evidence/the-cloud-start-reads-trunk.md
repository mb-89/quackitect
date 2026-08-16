---
form: the-cloud-start-reads-trunk
by: agent
signed_off: 2026-08-16T18:02:39.076Z
authors: agent
files:
---

# Evidence form / the-cloud-start-reads-trunk

## current_situation

THE CLOUD START DEMANDED A BRANCH THE SEED NO LONGER MAKES.

Its fetch step resolved refs/remotes/origin/it/<id> and died without it. That was right while a seed minted a branch and pushed it, so a peer could claim the work.

i34 RETIRED ALL OF THAT. A record is a folder on trunk. The seed mints no branch, pushes nothing, and there is nothing for a peer to claim.

So the branch a cloud start demanded stopped being created the day the seed stopped creating it. Every one still on the remote is a leftover.

TWENTY-SIX OF THEM STAND, and they cannot be deleted while this check reads them.

## built

THE FETCH STEP PROVES THE RECORD BY ITS FOLDER.

recordOnTrunk(root, iteration) in engine/bin/se-start.ts returns project/spec/iterations/<id>/record.md when this clone holds it, and "" when it does not.

IT IS SPLIT OUT FROM THE STEP on purpose. die() exits the process, which is the right ending for a step and the wrong one for a question somebody wants to drive. The step keeps its exit; the question is now askable.

THE FAILURE MESSAGE SAYS WHY. It names the path and adds that a record is a folder on trunk, so that path IS the iteration. A reader who arrives expecting a branch is told what replaced it.

THE FETCH ITSELF IS UNCHANGED. It still brings every ref and prunes, because trunk has to be current before the folder answers anything.

TWO CASES in deliverable/tests/unattended-start.test.ts.

- A fresh clone without the folder does not hold the record; writing record.md makes it hold, and the path comes back.
- The entrypoint's CODE names no remote branch and builds no it/<id>.

THE SECOND CASE WAS TOO BROAD AT FIRST and caught the entrypoint's own comment explaining why the branch check went. It strips comment lines now. A check that forbids naming the thing it removed forbids explaining the removal.

RUN: 9 of 9 pass in that file, the seven that stood included.

## follow_up

THE BRANCHES ARE NOW DELETABLE, and that is chunk fifteen's other half. Nothing in the entrypoint reads origin/it/* any more; listBranches and its ref-stamp cache are what chunk fifteen removes, and the owner's own hand deletes the remote branches, because the agent never pushes.

ONE BRANCH IS NOT IN THAT SET. iter/i13-guidance-library is merged into neither v2 nor v3, and it must not be deleted blind.

NO REQUIREMENT WAS MINTED HERE. The demand is req-one-command-starts-an-unattended-machine, which already stands and already says the entrypoint must reach a walking agent. This chunk changed how one of its steps answers, not what is demanded. trace-design should confirm that reading.

CHUNK FIFTEEN IS NEXT: dead-branch-code-goes, the last of the build.

## anything_else

