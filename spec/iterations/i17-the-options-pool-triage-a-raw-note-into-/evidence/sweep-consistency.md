---
form: sweep-consistency
by: agent
signed_off: 2026-08-18T11:25:39.780Z
authors: agent
files: null
---

# Evidence form / sweep-consistency

## current_situation

The iteration changed one behaviour and one name.

THE BEHAVIOUR: draining a note to `backlog` no longer parks it. It MINTS A
WORK TOKEN under `project/spec/trace/work-token/`, on trunk, and the survey
reads the pool from the repository rather than from the machine-local note
store. Two arguments became required, `where` and `statement`. A statement
that carries the note's own words refuses (SE-C-140). A second drain to
`backlog` refuses, because the first already minted. `se_file_write` cannot
open a second door into the pool folder.

THE NAME: the owner struck "option" for these nodes (ruling 2026-08-18). The
corpus already spends `option` on the morphological chart's design choices,
and two node kinds cannot answer to one word. The pool keeps Anderson's name.
What stands in it is a WORK TOKEN.

Both were taught in places written before either was true. This sweep is
those places.

## swept

- [x] command and tool docs
- [x] engine-served strings
- [x] method cards
- [x] matrix rows
- [x] templates and skeletons
- [x] guidance chapters
- [x] book chapters
- [x] README and entry documents
- [x] panels and form help

## follow_up

- The pool folder does not exist in this repository yet. The first mint
  creates it, and no note has been drained to `backlog` since the build. The
  next retro is what makes it appear.
- version-planning.md still carries twelve prose findings from the lint. All
  twelve predate this iteration and none sits in the text this sweep wrote.
  That file is scheduled to dissolve into the pool it proposed, so cleaning it
  line by line now would be work thrown away.
- The word "record" is still the engine's own generic term in forms, state
  guidance and refusals. The owner ruled against it on 2026-08-15 and prose
  fixes keep losing to the served strings. That is a sweep of its own and it
  is not this iteration's.

## anything_else

WHAT EACH CLASS ACTUALLY GOT, since a tick alone does not say.

- Command and tool docs: se_note_drain's description and its `statement`
  argument now say WORK TOKEN and carry the second-mint refusal. se_survey
  says it reads the repository.
- Engine-served strings: inbox.ts's drain refusal now names the mint and
  demands both arguments. Its two stale doc comments are gone — backlog
  "PARKS it", and "re-draining IS the migration mechanism", which is now
  false for backlog.
- Method cards: the retro card teaches the mint, both required arguments and
  the paste refusal. autonomous-run no longer tells a run to empty the pool.
  The retro and front_desk state cards say minting rather than parking.
- Matrix rows: walked all of them. M0_90_gate-kickoff is the only row naming
  se_note_drain, and it names it in legal_tools, which teaches nothing about
  the disposition.
- Templates and skeletons: machines/items/work-token.md declares the kind,
  its folder and its two sections, and records the collision with `option`
  outright. No form template teaches the drain.
- Guidance chapters: walking.md now carries the drain contract that reaches
  every agent through the prompt layer. refusals.md carries SE-C-140.
  craft/software.md's one-holder rule points at the machinery instead of
  waiting for it.
- Book chapters: none exist. The book is i20's work and there is no chapter
  to re-teach.
- README and entry documents: searched the front door for pool, note_drain
  and backlog. Zero matches, so nothing there teaches the old behaviour.
- Panels and form help: the panel's se_note_drain hints gained the
  `statement` argument, which was invisible to anybody driving from the
  panel.

WHAT I DID NOT RENAME, and why it is not residue. The disposition is still
spelled `backlog` in the tool's argument, in DISPOSITIONS, and in the
survey's `counts.backlog`. That is the API, and renaming it is a refactor
this state did not name. What the sweep owed was the PROSE a person reads,
and every one of those now says work token.

WHERE THE VOCABULARY REACHED FURTHER THAN PROSE. The pool tests' own failure
messages said "option" nineteen times, and a failing assertion is read by a
person exactly like a served string is. They now say work token, and so do
the drain test's name and comments.
