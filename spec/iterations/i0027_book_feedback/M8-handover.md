# M8 — package & handover

## Configuration baselined -> i27-m8-configuration-baselined

The baseline is the "i27 done" commit made directly after this gate's bless: every
i0027 change (engine source, spec content, templates, prompts, the ledger's bless
events) in one commit on main. The engine stamp and the golden root ride the repo;
`quack build` at this state re-baselines to the same root.

## Docs complete and matching -> i27-m8-docs-complete-match

Both committed book snapshots regenerated from the current spec at this state:
`spec/book.html` and `docs/book.html` (the two lint render-drift findings close with
this). The method docs agree with the engine per the M7 consistency sweep; the known
prose-lane follow-up (89 unrendered-list findings in old milestone docs) stays
recorded there, named, not hidden.

## Packaged and versioned -> i27-m8-packaged-versioned

`quack ship` produced `quack-i0027_book_feedback.zip` in the workspace data home:
book.html, report.html, README.md, and both RUNME scripts at the zip root. The
version is the iteration id; the engine identity rides the build stamp.

## Handover accepted -> i27-m8-handover-accepted

The owner's bless on this gate group is the acceptance: the deliverable is the book
the owner read and corrected through three rounds today, now packaged, with the
ledger carrying every adjudication of the walk.
