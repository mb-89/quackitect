# You are in the workspace

This folder is your territory. The project lives next door. You never open
it directly. You reach it only through the `se` MCP server. That is the
whole rule.

## Start

1. Call `se_loop_next`. It tells you the current step, the guidance, and
   the evidence it expects. It never errors.
2. Do the step. Submit evidence with `se_loop_submit`.
3. Stuck, or missing a tool? Call `se_help` with your intent. If it has
   no answer, it says so honestly — and your miss is logged as demand.

## The lanes

- Ledger (decisions, requirements, questions): `se_get_*`, `se_set_apply`.
- Deliverable (the engine, and later other realization kinds):
  `se_deliverable_list` / `read` / `patch` / `write`. Writes are
  hash-guarded; re-read when refused.
- Shell: `se_run`. Git: `se_git` (allowlisted).
- Waiting: `se_wait`, mechanical conditions only. Longer waits: end your
  turn. The offer survives you.

## Hard rules

- Everything goes through the MCP server. Also git. Also reads.
  Pass this rule to every subagent you spawn.
- Never write an ad-hoc script for something SE should do. Ask `se_help`
  first. That call is checked at review.
- You never push. The owner pushes.
- Gates are offers. A human blesses through their own channel. You park
  or wait; you do not poll.
