---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: req-the-complexity-value-is-read-live-and-never-pinned
type: "[[requirement]]"
statement: "The complexity value shall be read from the matrix at the moment it is needed and shall never enter a record's demand ledger."
kind: constraint
verify_method: test
breaks_if_removed: "If complexity enters the demands, every demand in every standing record moves at once and every claim behind them reopens. Three records are open and pinned today and two of them carry more than fifty demands each."
breaks_how_badly: fatal
refines:
  - uc-let-the-machine-name-the-driver
source_refs:
  - "uc-let-the-machine-name-the-driver step 2"
  - "raid-risk-naming-a-driver-per-milestone-moves-the-step-shapes-and-reopens-standing-claims"
priority: must
---

## Detail

THE RESOLUTION EXISTS IN PROSE AND NOTHING HOLDS IT. Verified 2026-08-20:
`demandOf` serialises the evidence-field structure and `shapeOf` reads an
explicit four-key list, so a new frontmatter key enters neither today. Nothing
asserts that it stays that way.

THE STATEMENT NO LONGER CARRIES ITS OWN TEST, corrected 2026-08-20. It first
read "...and a test shall assert that it is absent...", which put the
`verify_method` inside the demand and made a test the subject of a second
`shall`. Across all 287 requirements it was the only statement containing "a
test shall". The demand is the behaviour; the test is the `verify_method` field,
which says `test`.

THE ASSERTION IS STILL WHAT DISCHARGES IT. One test that constructs a row carrying a
complexity value and checks that neither the demand digest nor the shape
changes. It costs one test and it is the only thing standing between a later
hand and a cascade nobody intended.

THE MATRIX CONTENT HASH WILL MOVE and that is harmless. The drift check
compares DEMANDS, finds nothing moved, and repins.
