# Handover, 2026-09-02

Read this first on the new machine. It replaces the handover written earlier
the same day. Delete it once the tokens it names are in hand.

## The idea, in the owner's words

The review system is off. Reviewers were introduced before the basics
existed, the reviewers were nitpickers, and two days went to rounds. The
system is built again from the ground up, without reviewers, until the first
process for a work token exists. That process is: go through a checklist by
yourself. After that the owner decides whether a reviewer joins, and
measures quality against time.

The owner named the failure behind it: the basics look self-evident, so
they are skipped, and then they have to be built first. That is now a rule
in `doc/guidance/behaviour.md`.

## First thing on the new machine

1. Build. `RUNME` builds the engine from source. The engine changed today
   and a stale `.bin/se` writes the old projections.
2. Run `sh util/checks/battery.sh`. Seven Go tests failed in the cloud box
   for environmental reasons only. Three read `util/views/work.base`. One
   needs a git repository. One needs `.bin/se`. One is a shell quoting
   difference. One walks `*.base` files. On a full checkout with a built
   engine they are expected to pass. If one does not, that is the first
   token.
3. Start the engine. It re-projects `AGENTS.md` from the Actionables
   chapters. Open it and see three short lists under three titles.

**Know this before the first token.** The engine still runs the review
flow: a draft waits in `spec_submitted` for a reviewer to agree it, a
submission waits in `imp_submitted` for a verdict, and the pull walls after
three unreviewed pieces. Nothing in the engine closes a token without a
second actor. The owner rejected a switch that bypasses this. The review
system is to be reworked, and the first process (wk-6bac0c2b7a) is where
the worker-only close gets designed and built. Until then, the three
tokens in work can be worked on but not closed through the engine.

## What changed today

**Tokens.** `doc/work/` held 335 tokens at 2.8 MB. It holds 307 at 0.33 MB.

    ls doc/work/wk-*.md | wc -l        307
    cat doc/work/wk-*.md | wc -c       about 330000

Every token was rewritten to the shape in `doc/guidance/work-token.md`.
That is a detail of 1 to 6 sentences and the criteria with every command
kept verbatim. An ended token carries one `## evidence: outcome` section. Findings, lessons
and re-watched sections are gone. Every command line under a criterion was
checked equal to the original, and no criterion was dropped.

Five tokens were deleted as machinery: reviewer task tokens and probes
(wk-0466a89662, wk-32cbd5092d, wk-5d65092bbb, wk-6d81d44bb8, wk-ab58cba9eb).
27 tokens titled "learned:" were digested into `doc/guidance/lessons.md`,
one entry per class, and deleted. Four tokens were minted for the work
below. The originals of all 335 are on the old machine under
`.se/scratchpad/tokens-before-cleanup/`, and in git history where they were
committed.

**Three tokens were put back in work**, held by `main`, because the
reviewers holding them are gone. They are wk-1b7c1a2da1 the bar burns down,
wk-71a9ec3d53 any agent takes any, and wk-890febfb99 the reviewer waits.
Their work is done. Walk the checklist on each and close it.

**Guidance.** Six files at about 1,400 lines became seven files at about
600. Every file has three chapters: Motivation, Actionables, Discussion.
`doc/guidance/guidance.md` says what that shape is and is the first
guidance to read. `specifying.md` became `work-token.md`. `cases.md` was
dissolved into the Discussion chapters. `reviewing.md` stays for when
reviewers return and says so in its first sentence.

**Engine.** Four changes, each with a test.

- `method()` in `src/engine/pull.go` hands an agent only the Actionables
  chapter of a guidance file. `cases.md` is no longer appended. The draft
  method reads `work-token.md`.
- `util/projections.json` gained `"section": "Actionables"` on the three
  guidance projections, and `src/engine/project.go` extracts the chapter
  and heads it with the file's title.
- `SaveToken` in `src/engine/store.go` refuses a detail over
  `limits.detail_bytes` (1500) or an evidence section over
  `limits.section_bytes` (1000). Both are in `util/parameters.json` and may
  be made smaller and never larger. Every token in `doc/work/` fits.
- 24 tests that asserted the wording of guidance files were deleted, in
  five whole files and five others. They were pins on prose that no longer
  exists.

## The order to build

The owner's proposed order was: schema system, guidance on guidance, voice,
work token guidance, first process. Today's cleanup wrote seed versions of
the three guidance files, so the order from here is:

1. **The schema system**, wk-126fd296db. It is the basic everything else
   stands on. Template, field comments, validation and dropdowns all derive
   from it. The size limits added today move into it as field constraints.
2. **Work token guidance re-derived from the schema.** Every rule in
   `work-token.md` that the schema now enforces leaves the file. What stays
   is what only a writer can keep.
3. **The first process**, wk-6bac0c2b7a. A process mints tokens, and the
   token's shape comes from its process. The first process mints from the
   template and the worker does the work. The checklist in `behaviour.md`
   is the evidence template, and the engine refuses a close with an item
   unanswered. Measure rounds, defects after close and time per token.
4. Only then, and only by the owner's decision, a reviewer, measured
   against the baseline from step 3.

Why the schema comes before the process: a process mints tokens, and it
cannot mint what has no shape. Why the guidance seeds came first anyway:
the corpus was pumping its register into every agent on every pull. That
had to stop before anything new was written under it.

## Slop, and what stops it now

The tokens grew to essays because of five mechanisms, and four are gone.

1. The register of what is handed out. The engine handed 700 lines of
   capitalised cases to every drafter and reviewer, and they wrote back in
   that register. Now it hands out the Actionables lists, in plain register.
2. Rules that reward text. Every rejection had to carry a lesson. Every
   number had to be pasted with its command. Every acceptance had to record
   a re-watch. Findings accumulated on the note round by round. Each rule
   added a mandatory paragraph. Reviewers off, so those paragraphs are
   not written.
3. No size limit anywhere. `SaveToken` now refuses the detail and the
   evidence sections above a limit. A refusal, not a sentence.
4. Tests pinning guidance prose. Agents wrote guidance to satisfy tests, and
   the guidance became a fixture. Those tests are gone.
5. Still open: 1,394 of the 6,871 comment lines in `src/engine` are written
   in capitals for emphasis, and an agent that reads them writes like them.
   That is wk-b71d26fd45.

The rule to carry into the process design: every mandatory field has a
size. The size is a refusal in the engine, never a sentence in guidance.

## Open work, by the numbers

    backlogged   160
    spec_open     27
    imp_open       4
    in work        3

Ask the engine for the rest. `se query` draws the view.
