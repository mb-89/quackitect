---
state: retro
state_kind: work
priority: strategic
statement: Turn what happened into rules.
legal_tools: se_note_drain, se_survey, se_log_query, se_answer, se_test, se_run, se_file_read, se_file_search, se_file_glob, se_file_patch, se_file_write, se_seed_expedition, se_seed_iteration, se_web_search, se_web_fetch
entry_read: project/guidance/method/retro.md
motivation: Lessons expire. A stray nobody judges rots into noise, and a mistake nobody names repeats. The retro turns what happened into rules while it is cheap, and it empties the inbox so the next decision starts clean.
inputs:
  - "Do the survey | Run se_survey. One call lists everything open: expeditions, iterations, pending notes, the options pool."
  - "Establish the interval | Name the span this retro judges: from the last retro (se_log_query shows it) to now. Write it into the report."
follow_up_label: steps minted
guidance: |
  THE RETRO, applied. Follow `project/guidance/method/retro.md` step by step.

  - Open with se_survey. One call lists everything that stands open, down to
    the work tokens standing in the options pool.
  - Drain every pending note with se_note_drain, including the needs-retro
    triggers. This state is the ONE place draining is legal.
  - Aim improvements at durable homes.
  - Seed iterations from here, with a goal and a vision. Seeding is legal HERE
    and needs no leaving.

  Pull onward when the inbox stands at zero.

  AN EMPTY INBOX MEANS THE RETRO IS ALREADY DONE. Survey first; if nothing
  pends, do NOT start one — pull onward. A retro with nothing to drain
  produces an empty report and costs a full state's work to say so.

  THIS IS THE RULE FOR EVERY RETRO, wherever it is reached: the standalone
  one at the desk, and the onboard-retro inside an iteration's M0.
---

# Retro

The retro is one state (the one-state rule) - its legality zone rides
legal_tools, its method rides the entry read. Leaving it should leave
the inbox empty.

## An empty inbox skips the retro (owner ruling 2026-08-16)

THE CADENCE DOUBLE-FIRES AND THE OWNER NAMED IT. Run a retro at the desk, then
open an iteration, and the iteration's own onboard-retro runs a second one
minutes later with nothing left to drain.

THEIR WORDS: "If we have just made a retro, meaning the notes are empty, then
we don't start another one. If you start a retro anywhere and the notes are
empty, then you just skip it." And, on the onboarding half: "if the onboarding
retro doesn't fire, then you just skip it."

THE TRIGGER IS THE INBOX, not a timer and not a memory of having just run one.
se_survey answers it in one call, which is why the retro opens with the survey.

WHAT ABOUT THE FIELD-FEEDBACK QUESTION, which the contract calls a sanctioned
stop nothing else stands in for? A skipped retro does not skip it — it was
asked by the retro that emptied the inbox, minutes earlier. Asking twice in one
sitting is the duplication this rule exists to remove.

THE MECHANICAL HALF IS NOT BUILT. Today this rule holds by authorship: the
agent surveys, sees zero, and pulls onward. Making the engine skip it needs a
condition the router can route PAST rather than block on, and onboard-retro
sits on an iteration's mandatory path where an unmet entry condition would
wedge the record instead of skipping the state.

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
