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
2. Read the ask `./RUNME.sh branch take` prints on a `work/` branch. It names the group this box works. The work skill at `.claude/skills/work/SKILL.md` carries the road. *
3. Take `main` in first, with `./RUNME.sh branch sync`. A late conflict costs the work standing behind it. *
4. Work the branch you hold, and stop at its edge. A change nobody wants buries the one somebody wants. *
5. Commit and push each time you finish a thing. This box dies and takes its working tree with it. *
6. Decide every question this branch meets, a step under `by: person` among them, and hand none out. A ticket you can close yourself joins the group you work, and closes before the group reaches done. *
7. Mint a free ticket on `main` only for work a person alone can do. That means a secret, a setting on claude.ai or GitHub, or a trial on the owner's machine. Write every command they need into its ask, push it, and finish the branch. An ask in the chat meets nobody. *
8. Open no GitHub issue. The ticket holds the question. Where a ticket already carries an issue, close that issue. *
9. Say beside each answer what you weigh and what you assume. The hand at the merge judges the call on that. *
10. Carry the branch to done, and wait for every helper and retry inside your turn. A turn ending on a wait stops this box, and the step meets the next box and waits again. *
11. Green the check before you hand the branch back, whatever hand puts the fault there. A fault with no owner outlives every hand that meets it. *
12. Write your result, your retro and every script under `.se/scripts` into the group's retro. Git carries what this box learns, and nothing else does.
13. Run `./RUNME.sh branch done` last, and push. It refuses while the retro stands unwritten. Close every child first, since only a person's ticket leaves the group, as a free ticket on `main`. The work skill then opens the branch's pull request against `main`, with auto-merge on, and the session stops there.
14. Work one branch a session, and leave the next branch to the next session. A second branch buries the first in one review. *
15. Say which commit you stand on, and whether it matches origin. This box reports itself current while somebody pushes past it. *

# Examples

| the rule | do | do not |
|---|---|---|
| 5 | a commit and a push per finished thing | a day's work in the working tree |
| 6 | a finding you can fix, kept in your group until it closes | a loose ticket on `main` for work a box can do |
| 7 | a ticket carrying the trial's commands, then the branch at done | a closing question asking the owner to grant a permission |
| 8 | a ticket naming the question | a GitHub issue asking the owner |
| 10 | the branch at done, then the push | a branch standing mid-step |
| 10 | a wait on the helper inside the turn | a turn ending while a helper runs |
| 11 | the check green, whoever breaks it | a hand-back on a red check |
| 14 | one branch, then the session ends | a second branch after the first |
| 15 | the commit and whether origin matches | current, naming no commit |
