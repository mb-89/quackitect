---
state: retro
state_kind: work
priority: strategic
statement: Turn what happened into rules.
legal_tools: se_note_drain, se_survey, se_log_query, se_answer, se_help, se_test, se_run, se_file_read, se_file_search, se_file_glob, se_file_list, se_file_patch, se_file_write, se_file_delete, se_prompt_place, se_seed_expedition, se_seed_iteration, se_web_search, se_web_fetch
entry_read: guidance/method/retro.md
motivation: Lessons expire. A stray nobody judges rots into noise, and a mistake nobody names repeats. The retro turns what happened into rules while it is cheap, and it empties the inbox so the next decision starts clean.
inputs:
  - "Do the survey | Run se_survey. One call lists everything open: expeditions, iterations, pending notes, the options pool."
  - "Establish the interval | Name the span this retro judges: from the last retro (se_log_query shows it) to now. Write it into the report."
follow_up_label: steps minted
guidance: |
  THE RETRO, applied. Follow `guidance/method/retro.md` step by step.

  - Open with se_survey. One call lists everything that stands open, down to
    the work tokens standing in the options pool.
  - Drain every pending note with se_note_drain, including the needs-retro
    triggers. This state is the ONE place draining is legal.
  - Aim improvements at durable homes.
  - DRAINING THE ASSISTANT MEMORY MEANS EMPTYING IT. Whatever holds project
    rules, project state or working guidance moves into the repository, and the
    memory file is then DELETED. A drain that only reads leaves the next retro
    the same pile to judge again.
  - Re-project the prompt layer with se_prompt_place after editing guidance.
    Editing guidance/ makes AGENTS.md, CLAUDE.md and the Copilot
    instructions stale, and preflight goes red at the next verdict.
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
stop the iteration dead instead of skipping the state.

## Three verbs this state was missing, all added 2026-08-19

EACH ONE WAS REFUSED WHILE THE RETRO WAS DOING WHAT THE RETRO IS FOR. That is
the test a grant has to pass, and these three failed it.

- `se_help` — the method's own step 8 opens with the demand log, and the demand
  log is read through this verb. So the step asked for something the state
  forbade, and the retro that hit it had to record the gap instead of the
  answer.
- `se_file_list` — refused while surveying what stands at a directory. Third
  sighting across three retros, and the first two were parked.
- `se_prompt_place` — see below.

WHY IT KEPT HAPPENING. A grant is written when a state is drawn, and the
method card is written separately. Nothing compares the two, so a card can ask
for a verb its own state does not hold and nobody finds out until a walk hits
it.

## Why this state holds the prompt-layer verb (added 2026-08-19)

THE RETRO IS THE STATE MOST LIKELY TO MAKE THE PROMPT LAYER STALE, because
editing guidance is what it exists to do. It was the one state granted the
edit and refused the repair.

MEASURED HERE: six guidance files were edited, preflight went red naming three
stale projections, and the verb that fixes it refused under SE-C-110. The
repair went through the shell with its reason logged, which is a refusal doing
its job and a grant that was wrong.

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
