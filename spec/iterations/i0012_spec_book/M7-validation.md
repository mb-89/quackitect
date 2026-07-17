# M7 - Validation (i0012_spec_book, systematic)

TL;DR: the book meets the docu need it was born from - every criterion demonstrated live against the rendered artifact. The four presets held. The deck held. Three agent retrieval probes held. The remaining gaps are owned raid items, not surprises:

- outside reader
- example rows
- bulk facet tags

## Meets the need  -> i12-m7-meets-need
Validated against ALL needs across every iteration; demonstrated by the Ch1 criteria:

- crit-board-live -> `quack status` and `quack report` recompute from the ledger on every call; the verdict cache holds only computed results and dies on every re-baseline (demonstrated live through ~15 build/battery cycles this walk).
- crit-book-standalone -> one 369 KB HTML file; zero external requests (selftest:book-single-file); read cold in this session without repo context via plain-text extraction.
- crit-capture-one-command -> four notes captured mid-walk this session with one `quack note` each, console and agent channel alike.
- crit-killer-user-adjudicated -> the M6 gate carries the owner's console-delegated bless (`--by user`); every killer of this walk stopped at a pager; the actor stamps ride the ledger.
- crit-tests-born-red -> seven amended/new tests this session each observed RED at their hash before their fix (b56741bc, ca0bc4a5, 13ef4183, e3760119, 38a16b90, 1f6ea55a, 4888eac1); a pass is refused by observe-red.

The seven needs across iterations:

- need-docu (the book IS the demonstration)
- need-engage/need-review (the walk that built it ran through engage and its gates)
- need-note (the capture lane carried this walk's four leads)
- need-implementation (test-first held throughout)
- need-qualities (voice, marks, a11y, determinism all mechanically checked)
- need-workspace-drive (the global binary drove this workspace and the stub fixtures all session)

## Killer use cases demonstrated end-to-end  -> i12-m7-killer-usecases
- uc-book-read (a real read session per preset) -> each preset narrows to its chapters, verified in the artifact: architect -> ch3+ch4, auditor -> ch5+ch6, newcomer -> ch0+ch1, onepager -> ch1+ch4; the sidebar TOC, search, and details card operate on the same static DOM.
- uc-book-present (the deck presented) -> man-deck-presentation renders 5 slides with the present machinery live (data-present, arrow-key paging, print handout path).
- uc-book-agent (an agent retrieval probe) -> three probes against the raw HTML text, no DOM needed: the reader's contract (suspect semantics), the req-book-shell statement, a glossary entry - all retrieved verbatim.

## Acceptance obtained  -> i12-m7-acceptance
The owner reviewed the finished book and the shell on 2026-07-07 and ruled: "looks good. needs more work, but its a good finisher for i12" - acceptance of the iteration's deliverable with the more-work items routed forward (the raid gaps below and the notes inbox). The M6 bless was the owner's, recorded actor=user.

## Validation gaps captured (RAID)  -> i12-m7-gaps-captured
- [raid-no-external-reader] - no outside stakeholder has read the book; owned, mitigation: one outside read early next iteration.
- [raid-example-views] - methods/rules/forces render EXAMPLE rows; the interface view cannot fill on a software project yet (endpoint-resolution gap); owned, demand-driven replacement.
- [raid-facet-bulk-tags] - the facet sweep was pattern-based; owner sampling pending, cheap via the register filters.

## Milestone review  -> i12-m7-gate

- **Verify:** every criterion demonstration ran against the LIVE artifact this session, not against memory. Presets, deck, and probes are reproducible from the rendered file. The five criteria trace to mechanisms with green tests.
- **Validate:** the original frame (a spec book any stakeholder can read, compiled from the ledger, honest about its own state) is what the demonstrations exercised. The owner's acceptance is recorded with its caveat routed into raid, not swallowed.
- **Red-team:** the strongest counter-case is that all validation is in-project - the owner is the author's adjudicator, the agent is the author. Answered: that gap is exactly raid-no-external-reader, held open and owned rather than argued away. Second counter: the demonstrations lean on mechanical checks. Answered: the preset/deck/probe walk above exercised the artifact itself, and what only a human read can judge is precisely what M7 asks the adjudicator to bless.
- **Verdict: PASS - pending the adjudicator's bless of meets-need and the gate.**
