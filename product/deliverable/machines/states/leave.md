---
state: leave
state_kind: work
priority: 0.6
legal_tools: se_exp_close, se_exp_list
entry_evidence_form: expedition-leave
guidance: The gate out — entering leave demands the expedition-leave page (the record's report.md) filled and DONE; the lint checks it mechanically. Then close with se_exp_close to merge back and remove the worktree (bootstrap behavior until iterations receive changes as design input) — or tick onward WITHOUT closing to leave the expedition open for later.
---

# Leave

The context-manager exit. Closing merges and removes; leaving it open keeps
the worktree for continue_expedition to find again.
