---
state: retro
state_kind: work
priority: 0.4
statement: Turn what happened into rules.
legal_tools: se_note_drain, se_survey, se_log_query, se_answer, se_test, se_run, se_file_read, se_file_search, se_file_glob, se_file_patch, se_seed_expedition, se_seed_iteration
entry_read: project/guidance/method/retro.md
motivation: Lessons expire. A stray nobody judges rots into noise, and a mistake nobody names repeats. The retro turns what happened into rules while it is cheap, and it empties the inbox so the next decision starts clean.
inputs:
  - "Do the survey | Everything open in one call: inbox count, open work."
  - "Establish the interval | Last retro to now - the span this retro judges."
follow_up_label: steps minted
guidance: THE RETRO, applied - follow project/guidance/method/retro.md step by step. Open with se_survey - one call lists everything open (expeditions, iterations, pending notes, parked backlog). se_note_drain dispositions every pending note including the "needs retro" triggers (this state is the ONE place draining is legal); improvements aim at durable homes. Seeding is legal HERE - the retro plans by seeding iterations (goal + vision) without leaving. Pull onward when the inbox stands at zero.
---

# Retro

The retro is one state (the one-state rule) - its legality zone rides
legal_tools, its method rides the entry read. Leaving it should leave
the inbox empty.
