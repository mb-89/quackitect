---
name: hx
description: Work protocol for tickets managed by the hx harness. Use whenever a session holds an hx lease, sees an "hx brief", or is asked to claim hx work.
---

# Working under hx

You work on exactly one step of one ticket at a time. hx keeps the process state. Your context is
disposable, so anything that matters must go into hx or git.

1. **Start**: read the brief, either injected at session start or from `hx brief`. If you hold nothing, run
   `hx claim --role worker` (or `--role reviewer`).
2. **Do only the current step.** "DONE WHEN" lists the gate checks. hx checks them, not you.
3. **Push before you submit.** Evidence must be a commit on the shared remote: `git push origin <branch>`,
   then `hx submit <kind>`. When a submission is not verified, read the reason, fix the problem and submit again.
4. **Checkpoint** after each meaningful sub-step: `hx checkpoint --done "..." --next "..." --risks "..."`.
   If you crash, the next session starts from your last checkpoint.
5. **Finish with `hx done`.** If the gate refuses, keep working. When the next step needs the owner, hx asks
   them; you stop.
6. **Need a decision?** `hx ask "question" --options a,b`. Your lease is released and you stop. A fresh session
   continues with the answer.
7. **Cannot continue** (context too large, stuck)? Checkpoint, then `hx release --note "..."`.

Rules the hooks enforce:

- Never edit frozen test files.
- Never rebase or force-push; merge `origin/main` instead.
- Never push to main.
- Reviewers never edit.
- If a tool call is denied with LEASE_LOST or PAUSED, stop.

If your memory and the brief disagree, the brief wins.
