---
state: overhaul
state_kind: work
priority: strategic
statement: Everything catches up.
legal_tools: se_survey, se_log_query, se_run, se_test, se_lint, se_git, se_file_read, se_file_search, se_file_glob, se_file_list, se_file_patch, se_file_write, se_file_delete, se_file_move, se_note, se_note_drain, se_answer, se_prompt_place, se_web_search, se_web_fetch, se_seed_expedition, se_seed_iteration
entry_read: guidance/method/overhaul.md
motivation: Every good retro raises the bar, and the moment it rises everything written before it is out of compliance. Overhaul is where the system pays that debt off instead of carrying it. It is heavy on purpose, and it runs seldom.
inputs:
  - "Open with the survey | Run se_survey. One call lists every open record, every pending note and every work token standing in the pool."
  - "Run the machines | The whole battery and the voice lint. Collect what fails before judging anything."
follow_up_label: findings executed
guidance: |
  OVERHAUL, applied. Follow `guidance/method/overhaul.md` step by step.

  START WITH YOUR OWN METHOD. Before the corpus, before the code: research
  whether this method is still what the field does, change it where it is
  behind, and say what you compared against. se_web_search and se_web_fetch
  are legal here for exactly that.

  THREE JOBS, not one.

  - Throw out what should not be there.
  - Replace bad METHODS with good ones.
  - Replace bad STYLE with good style.

  Then se_survey and the whole battery. Then sweep against the RULES THAT
  CHANGED since the last overhaul. NO PREVIOUS OVERHAUL ON RECORD? Sweep
  everything, and say in the report that you did.

  Mark every candidate with its SORTED letter. The six criteria live in the
  method, and the pattern checklist runs beside them.

  THEN EVERY FINDING GOES TO ONE OF THREE PLACES.

  - A REFACTOR you DO, here, now.
    - Missing a verb to do it? Grant the verb.
  - A NEW FUNCTION gets an iteration seeded with se_seed_iteration. One
    where one will do.
  - A RULING goes to the owner. Deletion is theirs, never yours.

  Anything a machine could have caught becomes a LINT rather than a finding.
  Seen twice, it was always a lint.

  Re-project the prompt layer with se_prompt_place after editing guidance,
  or preflight goes red at the next verdict.

  COMMIT UNDER A MESSAGE BEGINNING `overhaul:`. That mark is the only
  boundary the next overhaul has to scope against.

  Pull onward when every refactor is executed, every new function is seeded,
  and every ruling is presented.
---

# Overhaul

Overhaul is one state (the one-state rule) - its legality zone rides
legal_tools, its method rides the entry read.

The retro moves the standard. Overhaul closes the distance that move
opened.

It was called pruning until 2026-07-29. The owner renamed it because the
scope was always all three jobs, and pruning only names the first.

## It executes, and it no longer only reports (owner ruling 2026-08-25)

THE OWNER'S FRAMING: everything that is just a refactor, the overhaul does
itself. Everything that is a new function, it seeds an iteration for.

WHAT IT USED TO DO. It produced findings and notes and stopped. A day of work
left the system exactly as it found it, with a longer inbox.

WHAT CHANGED WITH IT. The state was granted the verbs the new job needs, on
the owner's word that a state short of a right gets the right rather than a
workaround.

## Why each verb is here

A GRANT HAS TO PASS ONE TEST: was it refused while the state was doing what
the state is for? These are the ones that failed it.

- `se_seed_iteration` — the method now seeds. Without it a new function had
  nowhere to go but a note, which is the behaviour the ruling struck.
- `se_web_search` and `se_web_fetch` — step zero is an outward question by
  construction. A state that asks whether its method is current and cannot
  reach outside can only answer from memory.
- `se_git` — two jobs need it. Scoping the sweep means asking when the last
  overhaul was, and git holds that. Executing refactors means committing
  them.
- `se_prompt_place` — editing guidance is most of what this state does, and
  editing guidance makes the projection stale. The retro was granted this
  for the same reason after preflight went red on it.
- `se_file_list` — the first step is an inventory, and an inventory lists
  directories.
- `se_answer` — the owner rules mid-sweep, and a ruling recorded only in chat
  is lost when the chat is.
- `se_note_drain` — a fix closes the note that reported it. Draining it
  `done` is a check anyone can run, and a note left standing over a shipped
  fix makes every later survey lie. The judgment dispositions stay the
  retro's.
