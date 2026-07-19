# M7 — validation

## Consistency sweep -> i27-m7-consistency-swept-everything

Everything i0027 changed, checked against what the docs teach (2026-07-19):

- Commands: AGENTS.md already carries `quack mv`, `apply` with `op: set-field`, `boot`,
  and the MCP lane notes - no drift found.
- Templates replayed to the rulings: `man-project.md` (project table and decisions
  table sections REMOVED, the shared timeline is the one iterations rendering; the
  des-ch6-table-only design marker rewritten onto the timeline section so
  req-decision-rendering.1 stays realized), `man-motivation.md` (the dead
  `needs.base` embed replaced by the register-top-rows form, fill comments
  re-pointed), `man-intro-ifus.md` (statement, IFUs landing section with the
  des-ch2-ifu-landing marker), `man-design-output.md` and `man-guidance.md`
  (decisions-table references re-pointed to the timeline), and a NEW `toc.md`
  template mirroring the toc-owns-ordering ruling.
- Prompts: `compose-reference.md` gained the chapter-order-lives-in-the-toc law plus
  the mv/set-field lanes. The engage prompt already carries the
  referenced-artifact-is-content law from this iteration.
- Workspace prose swept: the three remaining "decisions table" teachings
  (man-project fill, man-guidance drivers tailor, man-design-output architecture
  tailor) re-pointed to the timeline.
- The 86 decision/candidate nodes orphaned by the decisions-table removal are
  recorded in `man-excluded-history` (documented through the derived timeline;
  excluded from hand-curated chapters). Coverage computes clean again.

Known-open, named for the adjudicator:

- `spec/book.html` and `docs/book.html` are stale committed snapshots; lint itself
  defers them to the ship step (req-book-trust.3) - M8 regenerates them.
- The armed prose lane reports 89 unrendered-list findings across i0026/i0027
  milestone docs (comma-joined runs in evidence prose). Voice debt, not a
  behavior-doc disagreement; proposed as a recorded follow-up, not a today fix.
- `design-layers.md` sits at the template spec root (the engine's legal fallback);
  the ruled `spec/design/` location is a cosmetic template move parked with the
  template-replay note.

## Meets the need -> i27-m7-meets-the-need

The iteration's scope was the book itself: the owner's feedback driven to a book that
reads right. The validation was the owner's own reading, three full rounds on
2026-07-19: the M6 reopen dictation (about two dozen defects, every one walked to a
fix), the round-2 eyeball (derived documents, needs placement, onion geometry per the
committed drawing, duplicate IFU table), and the push-today round (project chapter,
timeline unification, RAID as the standard table). Each round ended with a fresh
render the owner inspected; the last renders drew no new defect reports. The owner's
proxy checks stayed green through every round: 274/274 verification, coverage clean,
refusals clean. Proposed verdict: the book meets the need as far as the owner's own
reading reached; the owner's bless IS the validation record.

## Killer use cases -> i27-m7-killer-use-cases

Exercised for real in this walk, not by suite green:

- The reader lane: the owner read the rendered book three times and navigated its
  figures, tables, and drills to produce the feedback rounds.
- The adjudication lane: two M6 gate blesses rode the handover page end to end
  (actor user, channel handoff), including the merged-group ceremony.
- The walk lane: the whole M6/M7 walk ran through next, observe-red, verify, and
  bless on the attested MCP session.
- The determinizer lane: `quack mv`, `apply` with byte-exact and `set-field` ops,
  the toc ordering, and the report/book renders all ran on real work in this
  session, journaled and undoable.

## Validation gaps captured -> i27-m7-validation-gaps-captured

- NEW RAID item `raid-stale-child-memo`: the resident MCP child's cached coverage
  memos yield stale ledger reads after spec changes; bit twice today.
- The armed prose lane's 89 unrendered-list findings across i0026/i0027 milestone
  docs: recorded here and in the sweep section; a follow-up, not silently passed.
- The render-triggered nested verification (a single book render runs the full
  battery) and the tests-against-markdown migration stay captured in the notes
  inbox for the retro.
- No validation was performed by an external reader; the owner is the only reader
  so far. The standing RAID item `raid-no-external-reader` covers it.

## Acceptance obtained -> i27-m7-acceptance-obtained-sign

The acceptance evidence is the ledger itself: the owner's recorded blesses on
2026-07-19 (i27-m6-gate twice via the handover channel, actor user), the owner's
explicit push-today ruling driving this milestone, and the M7 gate bless that closes
this group. No separate signature artifact exists beyond the ledger; the ledger is
the signing surface by design.
