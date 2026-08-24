---
form: gate-requirements
bless: blessed by agent
by: agent
signed_off: 2026-08-24T15:35:16.859Z
authors: agent
files:
---

# Evidence form / gate-requirements

## current_situation

The requirement register adds four functional workflow contracts. Each refines an operational use case, is satisfied by fn-run-a-governed-walk.serve-a-step, and has a named test verification method. The new host-mode assumption is recorded with an explicit unprobed result.

## round_0_verify

- evidence vs claims: The four requirement statements, function satisfaction links, and host-mode assumption match the traced workflow defects.
- types: Each new node has the required trace type and mandatory frontmatter fields.
- lint: The state form accepted the requirements, function mapping, and assumption sweep.
- tests: No implementation test verdict exists yet; the active engine-selected test job has not produced a result, and implementation tests are the next stage.

## round_1_validate

- exercised against the goal: The signed zero-worker kickoff accepted empty spawn hand lists through all three observed spawn states.
- missing: Implementation coverage for guidance filtering, form-on-entry, and blockers-only continuation is still owed after this design-input gate.
- wrong: No trace requirement duplicates a product function or requires worker creation contrary to the signed ceiling.
- out of scope: New product value propositions, stories, and use cases are not needed for this engine workflow correction.
- prior art: The existing governed-walk function already owns state entry, reading delivery, and autonomy routing.

## goals_served

- Serve only guidance applicable to the active session.: req-session-serves-only-applicable-guidance excludes unattended-only guidance from attended sessions.
- Keep walkers at zero unless a state explicitly earns one.: req-zero-worker-ceiling-satisfies-spawn-state treats a signed zero ceiling as an empty spawn obligation.
- Continue autonomously at blockers-only stop-at.: req-blockers-only-stops-only-at-a-blocker requires continuation when the next step is runnable within autonomy.
- Prevent completion while runnable work remains.: req-blockers-only-stops-only-at-a-blocker defines a runnable next step as not a blocker, so it cannot produce a wait or completion.

## bound_breaches

- if-agent-harness-to-entrypoint: No breach. The requirements constrain existing guided-walk responses and do not alter the harness-to-entrypoint boundary.

## round_2_red_team

none

## raid_additions

- raid-the-harness-reports-the-session-mode-correctly

## verdict

pass — The design-input trace is complete for this minor workflow correction. Implementation and test specifications remain downstream work, not an unrecorded gap in the requirements.

## follow_up

Implement the four requirements in the governed-walk code paths. Add test specifications and rerun the host-mode probe with attended and unattended fixtures.

## anything_else

