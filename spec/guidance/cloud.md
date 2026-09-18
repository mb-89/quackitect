---
kind: [[guidance]]
scope: ["a session on a cloud box, where nobody sits beside it"]
env:
  - CLAUDE_CODE_REMOTE
  - SE_CLOUD
rationale: [[spec/rationales/cloud]]
---

# Actionables

1. Run `./RUNME.sh branch pull` first where you start on `main`. The branch you start on carries no work. *
2. Read the brief level zero hands you on a `work/` branch. Level zero deletes the copy it reads. *
3. Take `main` in first, with `./RUNME.sh branch sync`. A late conflict costs the work standing behind it. *
4. Work the branch you hold, and stop at its edge. A change nobody wants buries the one somebody wants. *
5. Commit and push each time you finish a thing. This box dies and takes its working tree with it. *
6. Decide every question whose wrong answer a later commit undoes. A box that waits on its own answer costs the owner a session. *
7. Hand out a question whose wrong answer spends, sends, or loses work nobody rebuilds. A commit puts none of those back. *
8. Read a step under `by: person` as a question, and weigh its cost. That stamp counts returns and knows nothing of the cost. *
9. Mint a question you hand out with `./RUNME.sh mint ticket <path> --process=question`. Run `ticket open`, then `branch unblock <ticket> <name>`. The group lands without it. *
10. Finish every step an agent takes before you leave. A step you leave meets the next box and waits again. *
11. Green the check before you hand the branch back, whatever hand puts the fault there. A fault with no owner outlives every hand that meets it. *
12. Write your result, your retro and every script under `.se/scripts` into `HANDOVER.md`. Git carries what this box learns, and nothing else does.
13. Run `./RUNME.sh branch done` last, and stop at the push. It sets the status the next box reads.
14. Work one branch a session, and leave the next branch to the next session. A second branch buries the first in one review. *
15. Say which commit you stand on, and whether it matches origin. This box reports itself current while somebody pushes past it. *
