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
6. Hand a step wanting a person out of your branch, and stop for none. Mint a ticket outside the group, write what stands open into its ask, and run `./RUNME.sh branch unblock <ticket> <successor>`. *
7. Finish every step an agent can take before you leave. A step a person owns waits on its own ticket, and it holds up nothing behind it. *
8. Write your result, your retro and every script you write under `.se/scripts` into `HANDOVER.md`, replacing the brief.
9. Run `./RUNME.sh branch done` last. It sets the status and pushes.
10. Stop at the push. The merge into `main` and the branch's delete happen off this box.
11. Stop after `branch done`. One session works one branch, and the next branch belongs to the next session. *
12. Say in your answer which commit you are on, and whether it matches origin. *
