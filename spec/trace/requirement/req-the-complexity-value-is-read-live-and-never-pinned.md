---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: req-the-complexity-value-is-read-live-and-never-pinned
type: "[[requirement]]"
statement: "The engine shall keep a step's complexity out of every record's demand ledger, so that a complexity changing reopens no standing claim."
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

## Restated at gate-architecture, 2026-08-20

WHAT LEFT: "shall be read from the matrix at the moment it is needed". That is a
source and a timing — a mechanism — and it excluded every design that lets the
value ride a structure compiled earlier.

WHERE THE OUTCOME CAME FROM: this node's own `breaks_if_removed`, unchanged.
"If complexity enters the demands, every demand in every standing record moves
at once and every claim behind them reopens." The harm is entirely about the
demand ledger. Nothing in it is about when the read happens.

WHAT IT WAS COSTING, MEASURED RATHER THAN ARGUED. Two of the four candidates on
M4's chart pick
`opt-the-complexity-rides-the-cell-the-compiled-state-already-carries`, whose own
text names this requirement's first half as the objection to it:
"engine/iterations.ts:236 compiles the column at pin time and the pin is written
to disk, so a complexity riding the compiled state is a value fixed when the
record was blessed". Read literally, this requirement made half the chart
ineligible on a clause nobody had argued for.

THE ISSUE WAS ALREADY STANDING.
`raid-iss-the-live-read-rule-forbids-more-than-its-own-reason-needs` was raised
at M4 and named the same seam. It went unacted on until the must-check was
actually run.

WHAT IS UNCHANGED: the demand, the fatal grade, and the test. One assertion that
constructing a row carrying a complexity moves neither the demand digest nor the
step shape.

WHAT A DESIGN MAY NOW DO that it could not before: pin the value onto a compiled
state, provided the pin does not reach the demands. Whether that is a good idea
is M4's question, and two candidates answer it yes.

THE RESOLUTION EXISTS IN PROSE AND NOTHING HOLDS IT. Verified 2026-08-20 and
the citation corrected the same day: the check that matters is `demandsFor`, which
opens at engine/iterations.ts:289 and builds each demand at :294 from three
named things — an `applies`, an `evidence` and a `shape` — with `shapeOf` at
:329 serialising four named keys.

TWO LINE NUMBERS FOR ONE FACT WERE IN CIRCULATION and both are right. The
function starts at :289 and the three-field construction is at :294;
`raid-iss-the-live-read-rule-forbids-more-than-its-own-reason-needs` and
`opt-the-complexity-rides-the-cell-the-compiled-state-already-carries` both cite
:294, and this paragraph cited :289 alone. A reader comparing them could not tell
whether they were describing the same check. Corrected 2026-08-20, one paragraph
after this node had congratulated itself on fixing exactly that defect. A new frontmatter key enters neither today. Nothing
asserts that it stays that way.

THIS PARAGRAPH FIRST CITED `demandOf`, at :312. That function is real and it is
not the one that decides what a demand holds. A cold reader found the record
citing two different functions for one verification and reading as though they
were the same check.

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
