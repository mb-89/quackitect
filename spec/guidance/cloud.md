---
kind: [[guidance]]
scope: ["a session on a cloud box, where nobody sits beside it"]
env:
  - CLAUDE_CODE_REMOTE
  - SE_CLOUD
rationale: [[spec/rationales/cloud]]
---

# Actionables

1. Run `./RUNME.sh ticket pull` first where you start on `main`. The branch you start on carries no work. *
2. Read the ask `./RUNME.sh branch take` prints on a `work/` branch. It names the group this box works. *
3. Take `main` in first, with `./RUNME.sh branch sync`. A late conflict costs the work standing behind it. *
4. Work the branch you hold, and stop at its edge. A change nobody wants buries the one somebody wants. *
5. Commit and push each time you finish a thing. This box dies and takes its working tree with it. *
6. Decide every question this branch meets, a step under `by: person` among them, and hand none out. The merge is where a person reads your call. *
7. Mint a question ticket for work a person alone can do: a permission, a setting, a desk trial. Write every command they need into its ask, push it, and finish the branch. An ask in the chat meets nobody. *
8. Say beside each answer what you weigh and what you assume. The hand at the merge judges the call on that. *
9. Carry the branch to done, and stop for no answer you can write yourself. A branch standing mid-step costs the next box a session. *
10. Finish every step an agent takes before you leave. A step you leave meets the next box and waits again. *
11. Green the check before you hand the branch back, whatever hand puts the fault there. A fault with no owner outlives every hand that meets it. *
12. Write your result, your retro and every script under `.se/scripts` into the group's retro. Git carries what this box learns, and nothing else does.
13. Run `./RUNME.sh branch done` last, and stop at the push. It sets the standing the next box reads.
14. Work one branch a session, and leave the next branch to the next session. A second branch buries the first in one review. *
15. Say which commit you stand on, and whether it matches origin. This box reports itself current while somebody pushes past it. *

# Examples

| the rule | do | do not |
|---|---|---|
| 5 | a commit and a push per finished thing | a day's work in the working tree |
| 7 | a ticket carrying the trial's commands, then the branch at done | a closing question asking the owner to grant a permission |
| 9 | the branch at done, then the push | a branch standing mid-step |
| 11 | the check green, whoever breaks it | a hand-back on a red check |
| 14 | one branch, then the session ends | a second branch after the first |
| 15 | the commit and whether origin matches | current, naming no commit |
