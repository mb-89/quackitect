---
kind: [[guidance]]
scope: ["a session on a cloud box, where nobody sits beside it"]
env:
  - CLAUDE_CODE_REMOTE
  - SE_CLOUD
rationale: [[spec/rationales/cloud]]
---

# Actionables

1. Run `./RUNME.sh work take` first where you start on `main`. It gives you a branch and its brief. *
2. Read the brief level zero hands you where you start on a `work/` branch already. *
3. Take `main` into your branch before you start: `./RUNME.sh work sync`. *
4. Work the branch you hold and stop at its edge. The brief is the whole job. *
5. Commit and push each time you finish a thing. A box dies and takes its working tree with it. *
6. Write your result and your retro into `HANDOVER.md`, at the root, replacing the brief.
7. Run `./RUNME.sh work done` last. It sets the status and pushes.
8. Leave the merge to a person. A cloud box opens no pull request.
9. Say in your answer which commit you are on, and whether it matches origin. *
