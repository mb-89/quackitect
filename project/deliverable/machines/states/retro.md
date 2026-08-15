---
state: retro
state_kind: work
priority: strategic
statement: Turn what happened into rules.
legal_tools: se_note_drain, se_survey, se_log_query, se_answer, se_test, se_run, se_file_read, se_file_search, se_file_glob, se_file_patch, se_file_write, se_seed_expedition, se_seed_iteration, se_web_search, se_web_fetch
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

## The outward doors are legal here (owner ruling 2026-08-15)

`se_web_search` and `se_web_fetch` were missing from this state's tools, and
the gap surfaced the moment the retro tried to do its own job.

THE RETRO ASKS "HAS THE PROCESS GONE STALE?" and demands the answer NAME what
it compared against. That is an outward question by construction. A state that
asks it and cannot reach outside can only answer from memory, which is the one
answer the standing question exists to forbid.

IT ALSO BLOCKED A LIVE PIECE OF WORK. At i12's retro the owner asked what
belongs in a milestone report. The canonical source is NASA NPR 7123.1
Appendix G, whose per-review entrance and success criteria tables are exactly
that list. The search found the document; the state could not read it.

THE OWNER'S WORDS: "That needs to be legal. Change that. I want to see that,
because maybe we can learn something from the NPR."
