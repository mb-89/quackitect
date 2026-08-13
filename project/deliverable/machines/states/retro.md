---
state: retro
state_kind: work
priority: strategic
statement: Turn what happened into rules.
legal_tools: se_note_drain, se_survey, se_log_query, se_answer, se_test, se_run, se_file_read, se_file_search, se_file_glob, se_file_patch, se_file_write, se_seed_expedition, se_seed_iteration
entry_read: project/guidance/method/retro.md
motivation: Lessons expire. A stray nobody judges rots into noise, and a mistake nobody names repeats. The retro turns what happened into rules while it is cheap, and it empties the inbox so the next decision starts clean.
inputs:
  - "Do the survey | Run se_survey. One call lists everything open: expeditions, iterations, pending notes, parked backlog."
  - "Establish the interval | Name the span this retro judges: from the last retro (se_log_query shows it) to now. Write it into the report."
follow_up_label: steps minted
guidance: |
  THE RETRO, applied. Follow `project/guidance/method/retro.md` step by step.

  - Open with se_survey. One call lists everything that stands open, down to
    the parked backlog.
  - Drain every pending note with se_note_drain, including the needs-retro
    triggers. This state is the ONE place draining is legal.
  - Aim improvements at durable homes.
  - Seed iterations from here, with a goal and a vision. Seeding is legal HERE
    and needs no leaving.

  Pull onward when the inbox stands at zero.
---

# Retro

The retro is one state (the one-state rule) - its legality zone rides
legal_tools, its method rides the entry read. Leaving it should leave
the inbox empty.
