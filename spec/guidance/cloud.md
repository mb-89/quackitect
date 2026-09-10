---
kind: [[guidance]]
scope: ["a session on a cloud box, where nobody sits beside it"]
env:
  - CLAUDE_CODE_REMOTE
  - SE_CLOUD
rationale: [[spec/rationales/cloud]]
---

# Actionables

1. Run `./RUNME.sh work take` first where you start on `main` or on a branch the platform cut. It gives you a branch and its brief, and the branch you start on carries no work. *
2. Read the brief level zero hands you where you start on a `work/` branch already. *
3. Take `main` into your branch before you start: `./RUNME.sh work sync`. *
4. Work the branch you hold and stop at its edge. The brief is the whole job. *
5. Commit and push each time you finish a thing, onto the branch you hold. *
6. Write your result, your retro and every script you write under `.se/scripts` into `HANDOVER.md`, replacing the brief.
7. Run `./RUNME.sh work done` last. It sets the status and pushes.
8. Stop at the push. The merge into `main` and the branch's delete happen off this box.
9. Stop after `work done`. One session works one branch, and the next branch belongs to the next session. *
10. Say in your answer which commit you are on, and whether it matches origin. *
