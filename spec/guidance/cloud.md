---
kind: [[guidance]]
scope: ["a session on a cloud box, where nobody sits beside it"]
env:
  - CLAUDE_CODE_REMOTE
  - SE_CLOUD
rationale: [[spec/rationales/cloud]]
---

# Actionables

1. Run `./RUNME.sh branch pull` first where you start on `main` or on a branch the platform cut. The engine takes a branch for you and hands you its brief. The branch you start on carries no work. *
2. Read the brief level zero hands you where you start on a `work/` branch already. *
3. Take `main` into your branch before you start: `./RUNME.sh branch sync`. *
4. Work the branch you hold and stop at its edge. The brief is the whole job. *
5. Commit and push each time you finish a thing, onto the branch you hold. *
6. Turn what only a person answers into a ticket. Finish the rest, and hand the branch back with that ticket beside it. Stop for nobody. *
7. Mint that ticket with `./RUNME.sh mint ticket spec/tickets/<name>.md --process=question`. Write the question the step asks into its ask. *
8. Run `./RUNME.sh ticket open <name>`, then `./RUNME.sh branch unblock <ticket> <name>`. The child closes as `became`, and the group lands without it. *
9. Finish every step an agent can take before you leave. A step a person owns waits on its own ticket. *
10. Green the check before you hand the branch back, whatever hand puts the fault there. A fault you inherit is no fault of yours, and a fault you hand on is. *
11. Write your result, your retro and every script you write under `.se/scripts` into `HANDOVER.md`, replacing the brief.
12. Run `./RUNME.sh branch done` last. It sets the status and pushes. The next box reads that status, and it merges nothing a box still holds.
13. Stop at the push. The merge into `main` and the branch's delete happen off this box.
14. Stop after `branch done`. One session works one branch, and the next branch belongs to the next session. *
15. Say in your answer which commit you are on, and whether it matches origin. *
