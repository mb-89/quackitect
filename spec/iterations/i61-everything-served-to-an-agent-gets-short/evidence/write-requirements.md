---
form: write-requirements
by: agent
signed_off: 2026-08-24T15:30:04.013Z
authors: agent
files: null
---

# Evidence form / write-requirements

## current_situation

Iteration 61 exposed four workflow defects. Attended sessions received cloud-only guidance. A zero worker ceiling still required Walker selections. Required state forms arrived one pull after entry. Blockers-only stopped despite runnable work.

## register

- req-session-serves-only-applicable-guidance
- req-zero-worker-ceiling-satisfies-spawn-state
- req-state-entry-delivers-its-required-form
- req-blockers-only-stops-only-at-a-blocker

## set_criteria

- complete: The four rows cover the four observed workflow contracts, with no additional product behavior in this minor iteration.
- consistent: Each row governs one distinct trigger and response; their conditions do not conflict.
- affordable: Each row maps to the engine components already responsible for guidance, state forms, spawn forms, or stop-at routing.
- bounded: Every row is limited to session delivery or iteration walking behavior observed in this iteration.
- comprehensible: Each statement names its trigger, required response, and one measurable absence or continuation condition.
- no_tbd: The requirement files contain no TBD, TBC, TBR, or question-marker placeholders.
- behaviour_modelled: None here wanted a model because each row is one condition and one response.
- quality_groups_swept: This delta adds functional workflow contracts only; no ISO quality characteristic changes independently of those contracts.

## follow_up

Implement the four requirements in the guidance selection, state-form delivery, spawn-source resolution, and stop-at routing paths. Add test specifications when the author-tests state opens.

## anything_else

